// https client for sysfe

import { requestAsync, cookieJar, newAgent } from './utils';
import { Logger } from './logger';


function now_str() {
    return new Date().toISOString().replace('T', ' ');
}

function fmt_http_headers(hdrs) {
    let k, kx, pfx = '  > ', lines = [''];
    for (k in hdrs) {
        kx = k.replace(/(^|-)[a-z]/g, function (m) { return m.toUpperCase(); });
        lines.push(pfx + kx + ': ' + hdrs[k]);
    }
    return lines.join('\n');
}

function get_href(res) {
    return res.request.uri.href;
}

class ServerError extends Error {
    constructor(response) {
        super('ServerError - ' + response.statusCode + ' ' + response.statusMessage);
        this.name = 'ServerError';
        this.response = response;
        this.statusCode = response.statusCode;
    }
}

// access sys api
class SysClient {
    constructor(base_url, sys_user, sys_password, userGenerator, flog) {
        this.base_url = base_url;
        this.jar = cookieJar();
        this.sys_user = sys_user;
        this.sys_password = sys_password;
        this.agent = newAgent();
        this.userGenerator = userGenerator;
        this.log = new Logger('<SYS>: ', flog);
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
            },
            simple: false,
            resolveWithFullResponse: true,
        };
        this.log.info("[%s] launch syscall: %s %s\n", now_str(), req.method, req.uri);
        let start_time = Date.now();
        return requestAsync(req)
            .then((res) => {
                let status = res.statusCode + ' ' + res.statusMessage;
                if (res.statusCode >= 300) {
                    throw new ServerError(res);
                }
                this.log.info("[%s] SYS CALL: %s\nduration: %s\n" +
                              "request headers: %s\nrequest: %s\nresponse: %s %s\nresponse headers: %s\n",
                              now_str(), req.uri, Date.now() - start_time,
                              fmt_http_headers(res.request.headers),
                              JSON.stringify(payload, null, 2),
                              status,
                              JSON.stringify(res.body, null, 2),
                              fmt_http_headers(res.headers));
                return res.body;
            })
            .catch((err) => {
                let res = err.response;
                if (!res) {
                    this.log.info("[%s] SYS CALL ERROR: %s\nduration: %s\nerror: %s\n",
                                  now_str(), req.uri, Date.now() - start_time, err);
                } else {
                    let status = res.statusCode + ' ' + res.statusMessage;
                    this.log.info("[%s] SYS CALL ERROR: %s\nduration: %s\nrequest headers %s\nrequest: %s\nerror: %s %s\n",
                                  now_str(), req.uri, Date.now() - start_time,
                                  fmt_http_headers(res.request.headers),
                                  JSON.stringify(payload, null, 2),
                                  status,
                                  JSON.stringify(res.body, null, 2));
                }
                return Promise.reject(err);
            });

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
                if (user.skip) {
                    return Promise.resolve();
                }
                if (user.registerEmail || user.emailOnly) {
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

