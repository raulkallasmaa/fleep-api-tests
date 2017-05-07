// https client for sysfe

import { requestPromise, cookieJar, newAgent } from './utils';

// access sys api
class SysClient {
    constructor(base_url, sys_user, sys_password, userGenerator) {
        this.base_url = base_url;
        this.jar = cookieJar();
        this.sys_user = sys_user;
        this.sys_password = sys_password;
        this.agent = newAgent();
        this.userGenerator = userGenerator;
    }

    // https request with basic auth
    sys_call(path, payload) {
        let req = {
            uri: this.base_url + path,
            method: 'POST',
            jar: this.jar,
            body: payload,
            json: true,
            agent: this.agent,
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
            .then((res) => {
                if (res.account_id == null) {
                    throw new Error("account_id == null");
                }
                return {
                    account_id: res.account_id,
                    email: email,
                    display_name: display_name,
                    fleep_address: fleep_address,
                    password: password
                };
            });
    }

    // create user based on display_name
    quick_register_helper(cache, display_name) {
        return this.userGenerator(display_name)
            .then((user) => {
                if (user.registerEmail) {
                    cache[user.shortname] = user;
                    return Promise.resolve();
                }
                return this.register_user(user.email, user.password, user.display_name, user.fleep_address)
                    .then((res) => {
                        cache[user.shortname] = res;
                        return Promise.resolve();
                    });
            });
    }

    // accept many display_names, return map of info records
    quick_register_many(users) {
        let cache = {};
        let plist = [];
        for (let i = 0; i < users.length; i++) {
            plist.push(this.quick_register_helper(cache, users[i]));
        }
        return Promise.all(plist).then(() => cache);
    }
}

export { SysClient };

