
"use strict";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20 * 1000;

// node modules
var assert = require('assert');
var child_process = require('child_process');
var process = require('process');
var crypto = require('crypto');

// npm modules
var requestAsync = require('request-promise');
var request = require('request');

// env config
var env = process.env.FLEEP_ENV_NAME;
var key_dir = process.env.FLEEP_KEY_DIR;
var HOST = env + '.fleep.ee';
var cfname = key_dir + "/config/syscli_" + env + ".ini.gpg";
var sys_user = null;
var sys_password = null;
var BASE_URL = 'https://' + HOST + '/';

function dump_record(desc, obj) {
    console.log(desc + ": " + JSON.stringify(obj, null, 2));
}

// extract keys, ignore sections
function parse_ini(data) {
    var res = {};
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++) {
        let ln = lines[i].trim();
        if (ln.length === 0 || ln[0] === '#' || ln[0] === ';' || ln[0] === '[') {
            continue;
        }
        var pos = ln.indexOf('=');
        if (pos > 0) {
            var k = ln.substring(0, pos).trim();
            var v = ln.substring(pos+1).trim();
            res[k] = v;
        }
    }
    return res;
}

// new random password
function generate_password() {
    return crypto.randomBytes(9).toString('base64');
}

// promise wrapper on child_process
function execAsync(cmd, args, opts) {
    return new Promise(function (resolve, reject) {
        var proc = child_process.execFile(cmd, args, opts, function (ex, out, err) {
            if (ex) {
                reject(ex);
            } else if (proc.status != null && proc.status !== 0) {
                reject(new Error("process exited with error status: "+proc.status));
            } else {
                resolve(out);
            }
        });
    });
}

// Load syscli key
function setup_sys() {
    if (sys_user != null) {
        return Promise.resolve();
    }
    var args = ['-d', '--batch', cfname];
    return execAsync('gpg', args)
        .then((stdout) => {
            var conf = parse_ini(stdout);
            sys_user = conf.sys_user;
            sys_password = conf.sys_password;
            return Promise.resolve();
        });
}

// connection for one client
class TestClient {
    constructor(info, magic) {
        this.email = info.email;
        this.password = info.password;
        this.ticket = null;
        this.jar = request.jar();
        this.magic = magic;
        this.login_response = null;
        this.event_horizon = 0;
    }

    // do https request
    raw_api_call(path, payload, qs) {
        if (this.ticket != null) {
            payload = Object.assign({ticket: this.ticket}, payload);
        }
        let req = {
            uri: BASE_URL + path,
            method: 'POST',
            headers: {'User-Agent': 'ApiTest'},
            jar: this.jar,
            body: payload,
            qs: qs,
            json: true,
            gzip: true,
            agent: false
        };
        return requestAsync(req)
            .then(res => {
                //dump_record(path, res);
                return res;
            });
    }

    // do api call, login if necessary
    api_call(path, payload, qs) {
        if (this.ticket == null) {
            return this.login()
                .then(() => this.raw_api_call(path, payload));
        }
        return this.raw_api_call(path, payload, qs);
    }

    // login, remember ticket/token
    login() {
        return this.raw_api_call('api/account/login',
                {email: this.email, password: this.password})
            .then(res => {
                //dump_record('login', res);
                this.ticket = res.ticket;
                this.magic.register('ticket', res.ticket, res.display_name);
                this.login_response = res;

                let profile = res.profiles[0];
                this.magic.register('flautogen', profile.fleep_autogen, res.display_name);
                this.magic.register('fladdr', profile.fleep_address, res.display_name);

                return res;
            });
    }

    initial_poll() {
        return this.initial_poll_loop([], 0);
    }

    initial_poll_loop(rlist, ev_horiz) {
        return this.api_call("api/account/poll", {wait: false, event_horizon: ev_horiz})
            .then(res => {
                rlist.push(res);
                if (res.event_horizon !== ev_horiz) {
                    return this.initial_poll_loop(rlist, res.event_horizon);
                }

                // merge stream to single result
                let stream = [];
                for (let i = 0; i < rlist.length; i++) {
                    stream.push.apply(stream, rlist[i].stream);
                }
                res.stream = stream;
                this.event_horizon = res.event_horizon;
                return res;
            });
    }
}

// access sys api
class SysClient {
    constructor() {
        this.jar = request.jar();
    }

    // https request with basic auth
    sys_call(path, payload) {
        let req = {
            uri: BASE_URL + path,
            method: 'POST',
            headers: {'User-Agent': 'ApiTest'},
            jar: this.jar,
            body: payload,
            json: true,
            gzip: true,
            agent: false,
            auth: {
                'user': sys_user,
                'pass': sys_password,
            }
        };
        return requestAsync(req);
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
                assert(account_id != null);
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
        var password = generate_password();
        var rnd = crypto.randomBytes(5).toString('hex');
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

class MagicStrings {
    constructor() {
        this._magic = {};
        this._reverse = {};
        this._rec_clean = {
            "contact": {
                activated_time: null,
                trial_end_time: null,
                static_version: ['jsver', '-'],
                dialog_id: ['dlg', 'display_name'],
                fleep_address: ['fladdr', 'display_name'],
                email: ['email', 'display_name'],
                account_id: ['account', 'display_name'],
                sort_rank: null,
                activity_time: null,
            },
            "label": {
                index: null,
                label_id: ['label', 'label'],
            },
            "conv": {
                cmail: ['cmail', 'default_topic'],
            },
            "message": {
                inbox_nr: null,
                prev_message_nr: null,
                message_nr: null,
                posted_time: null,
            }
        };
    }

    // remember magic strings
    register(kind, value, ref) {
        assert(value);
        if (!ref) {
            ref = '-';
        }
        let alt = "<" + kind + ":" + ref + ">";
        this._magic[value] = alt;
        this._reverse[alt] = value;
    }

    // return raw value for alt string
    get(alt) {
        return this._reverse[alt];
    }

    // clean response object
    clean(obj, magic_fields) {
        if (obj == null) {
            return obj;
        } else if (typeof obj === "string") {
            if (obj in this._magic) {
                return this._magic[obj];
            }
            return obj;
        } else if (typeof obj !== "object") {
            return obj;
        } else if (Array.isArray(obj)) {
            let ret = [];
            for (let i = 0; i < obj.length; i++) {
                ret.push(this.clean(obj[i], magic_fields));
            }
            return ret;
        } else {
            let ret = {};
            let cur_magic = magic_fields;
            if (obj.mk_rec_type && this._rec_clean[obj.mk_rec_type]) {
                cur_magic = this._rec_clean[obj.mk_rec_type];
            }
            for (let k in obj) {
                if (!obj.hasOwnProperty(k)) {
                    continue;
                }
                let val = obj[k];
                if (typeof val !== "object") {
                    if (val in this._magic) {
                        ret[k] = this._magic[val];
                        continue;
                    } else if (cur_magic != null && k in cur_magic) {
                        let info = cur_magic[k];
                        if (info == null) {
                            ret[k] = "...";
                        } else {
                            let kind = info[0], ref = info[1];
                            this.register(kind, obj[k], obj[ref]);
                            ret[k] = this._magic[val];
                        }
                        continue;
                    }
                }
                ret[k] = this.clean(val, magic_fields);
            }
            return ret;
        }
    }
}

// caches TestClient for generated users, remembers uuids
class UserCache {
    constructor(users) {
        this._users = users;
        this._magic = new MagicStrings();
    }

    // prepare users
    setup() {
        var sc = new SysClient();
        return setup_sys()
            .then(() => {
                return sc.quick_register_many(this._users)
                    .then(usermap => {
                        for (var k in usermap) {
                            this[k] = new TestClient(usermap[k], this._magic);
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
    TestClient,
    SysClient,
    UserCache,
    dump_record,
};

