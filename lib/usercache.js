// generate and cache test users

import process from 'process';
import { existsSync } from 'fs';

import { parse_ini, execPromise } from './utils';
import { MagicStrings } from './magic';
import { TestClient } from './testclient';
import { SysClient } from './sysclient';

// env config
let env = process.env.FLEEP_ENV_NAME;
let key_dir = process.env.FLEEP_KEY_DIR;
let BASE_URL = `https://${env}.fleep.ee/`;
let sys_user = null;
let sys_password = null;

// Load syscli key
function setup_sys() {
    let cfname = `${key_dir}/config/syscli_${env}.ini.gpg`;
    if (sys_user != null) {
        return Promise.resolve();
    }
    if (!env) {
        return Promise.reject(new Error("no env set"));
    }
    if (!existsSync(cfname)) {
        return Promise.reject(new Error(`config not found: ${cfname}`));
    }
    let args = ['-d', '--batch', cfname];
    return execPromise('gpg', args)
        .then((stdout) => {
            let conf = parse_ini(stdout);
            sys_user = conf.sys_user;
            sys_password = conf.sys_password;
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
                let sc = new SysClient(BASE_URL, sys_user, sys_password);
                return sc.quick_register_many(this._users)
                    .then((usermap) => {
                        for (let k in usermap) {
                            this[k] = new TestClient(BASE_URL, usermap[k], this._magic);
                            this._magic.register('account', usermap[k].account_id, k);
                            this._magic.register('email', usermap[k].email, k);
                        }
                        return Promise.resolve();
                    });
            });
    }

    // remember magic strings
    register_magic(kind, value, ref) {
        this._magic.register(kind, value, ref);
    }

    // clean response object
    clean(obj, magic_fields) {
        return this._magic.clean(obj, magic_fields);
    }
}

export {
    UserCache,
};

