// generate and cache test users

"use strict";

import process from 'process';

import { parse_ini, execPromise } from './utils';
import { MagicStrings } from './magic';
import { TestClient } from './testclient';
import { SysClient } from './sysclient';

// env config
var env = process.env.FLEEP_ENV_NAME;
var key_dir = process.env.FLEEP_KEY_DIR;
var HOST = env + '.fleep.ee';
var cfname = key_dir + "/config/syscli_" + env + ".ini.gpg";
var sys_user = null;
var sys_password = null;
var BASE_URL = 'https://' + HOST + '/';

// Load syscli key
function setup_sys() {
    if (sys_user != null) {
        return Promise.resolve();
    }
    var args = ['-d', '--batch', cfname];
    return execPromise('gpg', args)
        .then((stdout) => {
            var conf = parse_ini(stdout);
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
                var sc = new SysClient(BASE_URL, sys_user, sys_password);
                return sc.quick_register_many(this._users)
                    .then(usermap => {
                        for (var k in usermap) {
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

