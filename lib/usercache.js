// generate and cache test users

import process from 'process';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

import nodemailer from 'nodemailer';

import { parse_ini, execPromise } from './utils';
import { MagicStrings } from './magic';
import { TestClient } from './testclient';
import { SysClient } from './sysclient';
import { ImapListener } from './email';
import { LateResult } from './lateresult';

// env config
let env = process.env.FLEEP_ENV_NAME;
let key_dir = process.env.FLEEP_KEY_DIR;
let ENV_HOST = env + '.fleep.ee';
let BASE_URL = `https://${ENV_HOST}/`;
let BIG_TEST = !!process.env.BIG_TEST;

let sysconf = null;

let sys_user = null;
let sys_password = null;

let imap_server = null;
let imap_user = null;
let imap_password = null;


let TEST_SESSION = randomBytes(5).toString('hex');

let smtp_transport = null;
let imap_listener = null;

// use email registration for one user
let registerEmailDefault = BIG_TEST;

function randomBytesAsync(num) {
    return new Promise((resolve, reject) => {
        randomBytes(num, (err, buf) => {
            if (err) {
                reject(err);
            } else {
                resolve(buf);
            }
        });
    });
}

function newUserGenerator(display_name) {
    return randomBytesAsync(32)
        .then((rndBuf) => {
            let password = null, emailOnly = false;
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
            if (!emailOnly) {
                password = rndBuf.slice(5, 5 + 9).toString('base64');
            }

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

function load_ini(cfname) {
    if (!existsSync(cfname)) {
        return Promise.reject(new Error(`config not found: ${cfname}`));
    }
    let args = ['-d', '--batch', cfname];
    return execPromise('gpg', args)
        .then((stdout) => Promise.resolve(parse_ini(stdout)));
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
    let cfname = `${key_dir}/config/syscli_${env}.ini.gpg`;
    let p1 = load_ini(cfname)
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
    let cfname2 = `${key_dir}/config/testsetup_dev.ini.gpg`;
    let p2 = load_ini(cfname2)
        .then((conf) => {
            imap_server = conf.imap_server;
            imap_user = conf.imap_user;
            imap_password = conf.imap_password;
            return Promise.resolve();
        });

    return Promise.all([p1, p2])
        .then(() => {
            // config loaded, set up smtp & imap

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
    constructor(users) {
        this._users = users;
        this._magic = new MagicStrings();
    }

    // prepare users
    setup() {
        return setup_sys()
            .then(() => {
                let sc = new SysClient(BASE_URL, sys_user, sys_password, newUserGenerator);
                imap_listener.incref();
                return sc.quick_register_many(this._users)
                    .then((usermap) => {
                        for (let k in usermap) {
                            this[k] = new TestClient(ENV_HOST, usermap[k], this._magic, smtp_transport, imap_listener);
                            this._magic.register('account', usermap[k].account_id, usermap[k].display_name);
                            this._magic.register('email', usermap[k].email, usermap[k].display_name);
                        }
                        return Promise.resolve();
                    });
            });
    }

    // drop connections
    cleanup() {
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
};

