// https client for sysfe

"use strict";

import { randomBytes } from 'crypto';

import { requestPromise, cookieJar } from './utils';

// access sys api
class SysClient {
    constructor(base_url, sys_user, sys_password) {
        this.base_url = base_url;
        this.jar = cookieJar();
        this.sys_user = sys_user;
        this.sys_password = sys_password;
    }

    // https request with basic auth
    sys_call(path, payload) {
        let req = {
            uri: this.base_url + path,
            method: 'POST',
            headers: {'User-Agent': 'ApiTest'},
            jar: this.jar,
            body: payload,
            json: true,
            gzip: true,
            agent: false,
            auth: {
                'user': this.sys_user,
                'pass': this.sys_password,
            }
        };
        return requestPromise(req);
    }

    // create user
    register_user(email, password, display_name, fleep_address) {
        return this.sys_call('sys/account/register', {
                    email: email,
                    password: password,
                    fleep_address: fleep_address,
                    display_name: display_name})
            .then(res => {
                var account_id = res.account_id;
                if (account_id == null) {
                    throw new Error("account_id == null");
                }
                return {
                    account_id: account_id,
                    email: email,
                    display_name: display_name,
                    password: password
                };
            });
    }

    // create user based on display_name
    quick_register_helper(cache, display_name) {
        var shortname = display_name.split(' ')[0].toLowerCase();
        var password = randomBytes(9).toString('base64');
        var rnd = randomBytes(5).toString('hex');
        var email = 'tester+' + shortname + '_' + rnd + '@box.fleep.ee';
        var fleep_address = shortname + '.' + rnd;
        return this.register_user(email, password, display_name, fleep_address)
            .then(res => {
                cache[shortname] = res;
                return cache;
            });
    }

    // accept many display_names, return map of info records
    quick_register_many(users) {
        var cache = {};
        var plist = [];
        for (var i = 0; i < users.length; i++) {
            plist.push(this.quick_register_helper(cache, users[i]));
        }
        return Promise.all(plist).then(() => cache);
    }
}

export { SysClient };

