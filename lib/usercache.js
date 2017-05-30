// generate and cache test users

import process from 'process';
import nodemailer from 'nodemailer';

import { loadConfigAsync, randomBytesAsync } from './utils';
import { MagicStrings } from './magic';
import { TestClient } from './testclient';
import { SysClient } from './sysclient';
import { ImapListener } from './email';
import { LateResult } from './lateresult';
import { fileLogger } from './logger';

let DEFAULT_TIMEOUT_INTERVAL = 85000;

let env_map = {
    io: 'fleep.io',
};

function get_env_host(env) {
    return env_map[env] || (env + '.fleep.ee');
}

// env config
let env = process.env.FLEEP_ENV_NAME;
let KEY_DIR = process.env.FLEEP_KEY_DIR;
let ENV_HOST = get_env_host(env);
let BASE_URL = `https://${ENV_HOST}/`;
let BIG_TEST = !!process.env.BIG_TEST;

let sysconf = null;

let sys_user = null;
let sys_password = null;

let imap_server = null;
let imap_user = null;
let imap_password = null;


let TEST_SESSION = null;

let smtp_transport = null;
let imap_listener = null;

// use email registration for one user
let registerEmailDefault = BIG_TEST;

function newUserGenerator(display_name) {
    return randomBytesAsync(32)
        .then((rndBuf) => {
            let emailOnly = false;
            let registerEmail = registerEmailDefault;

            if (display_name[display_name.length - 1] === '@') {
                emailOnly = true;
                registerEmail = false;
                display_name = display_name.substr(0, display_name.length - 1);
            }
            if (registerEmail) {
                registerEmailDefault = false;
            }

            let rnd = rndBuf.slice(0, 5).toString('hex');
            let shortname = display_name.split(' ')[0].toLowerCase();
            let fleep_address = `${shortname}.${rnd}.${TEST_SESSION}`;
            let email = `${imap_user}+${fleep_address}@${imap_server}`;
            let password = rndBuf.slice(5, 5 + 9).toString('base64');

            let info = {
                email: email,
                password: password,
                display_name: display_name,
                fleep_address: fleep_address,
                registerEmail: registerEmail,
                emailOnly: emailOnly,
                shortname: shortname
            };
            return info;
        });
}

// Load config
function setup_sys(gpgOnce) {
    if (!env) {
        return Promise.reject(new Error("no env set"));
    }
    if (sysconf == null) {
        sysconf = new LateResult();
    } else {
        return sysconf.waitResult();
    }

    // sysapi passwords
    let cfname = `${KEY_DIR}/config/syscli_${env}.ini.gpg`;
    let p1 = loadConfigAsync(cfname)
        .then((conf) => {
            sys_user = conf.sys_user;
            sys_password = conf.sys_password;
            return Promise.resolve();
        });

    // we just want to launch gpg once
    if (gpgOnce) {
        return p1;
    }

    // imap/smtp passwords
    let cfname2 = `${KEY_DIR}/config/testsetup_dev.ini.gpg`;
    let p2 = loadConfigAsync(cfname2)
        .then((conf) => {
            imap_server = conf.imap_server;
            imap_user = conf.imap_user;
            imap_password = conf.imap_password;
            return Promise.resolve();
        });

    return Promise.all([p1, p2])
        .then(() => randomBytesAsync(5))
        .then((buf) => {
            // config loaded, set up smtp & imap

            TEST_SESSION = buf.toString('hex');

            smtp_transport = nodemailer.createTransport({
                host: imap_server,
                port: 465,
                auth: {
                    user: imap_user,
                    pass: imap_password
                },
                secure: true,
            });

            let sessionAddr = TEST_SESSION + '@' + imap_server;
            imap_listener = new ImapListener(imap_server, 993, imap_user, imap_password, sessionAddr);

            // notify waiters
            sysconf.sendResult(true);

            return Promise.resolve();
        });
}

// caches TestClient for generated users, remembers uuids
class UserCache {
    constructor(users, filename, _jasmine) {
        this.BASE_URL = BASE_URL;
        this._users = users;
        this._magic = new MagicStrings();
        if (filename) {
            let fnprefix = filename.replace(/.*[\/\\]tests[\/\\]/, 'tests/');
            this._filelog = fileLogger(fnprefix);
        } else {
            this._filelog = console;
        }
        this.sysclient = null;

        if (_jasmine) {
            _jasmine.DEFAULT_TIMEOUT_INTERVAL = DEFAULT_TIMEOUT_INTERVAL;
        }
    }

    // prepare users
    setup() {
        return setup_sys()
            .then(() => {
                let sc = new SysClient(BASE_URL, sys_user, sys_password, newUserGenerator);
                this.sysclient = sc;
                imap_listener.incref();
                return sc.quick_register_many(this._users)
                    .then((usermap) => {
                        for (let k in usermap) {
                            this[k] = new TestClient(ENV_HOST, usermap[k], this._magic, smtp_transport, imap_listener, this._filelog);
                            this._magic.register('account', usermap[k].account_id, usermap[k].display_name);
                            this._magic.register('email', usermap[k].email, usermap[k].display_name);
                        }
                        return Promise.resolve();
                    });
            });
    }

    // drop connections
    cleanup() {
        this._filelog._close();
        return imap_listener.decref();
    }

    // remember magic strings
    register_magic(kind, value, ref) {
        this._magic.register(kind, value, ref);
    }

    // clean response object
    clean(obj, magic_fields) {
        return this._magic.clean(obj, magic_fields);
    }

    // wait until mail arrives for address
    waitMail(addr) {
        return imap_listener.waitMail(addr);
    }
}

export {
    UserCache,
    ENV_HOST,
    BASE_URL,
    setup_sys,
    BIG_TEST,
    KEY_DIR,
};

