// api client

import { requestAsync, cookieJar, newAgent, waitAsync, randomInt } from './utils';
import { Logger } from './logger';
import _ from 'lodash';
import util from 'util';

function now_str() {
    return new Date().toISOString().replace('T', ' ');
}

class ServerError extends Error {
    constructor(response) {
        super('ServerError - ' + response.statusCode + ' ' + response.statusMessage);
        this.name = 'ServerError';
        this.response = response;
        this.statusCode = response.statusCode;
    }
}

// return true if rec matches pat
function matchRec(rec, pat) {
    for (let k in pat) {
        let frag = pat[k];
        if (typeof frag !== 'object' || frag === null) {
            if (rec[k] === frag) {
                continue;
            }
        } else if (_.isRegExp(frag)) {
            if (typeof rec[k] === 'string' && frag.test(rec[k])) {
                continue;
            }
        } else if (Array.isArray(frag)) {
            if (Array.isArray(rec[k]) && frag.length === rec[k].length) {
                let ok = true;
                for (let j = 0; j < frag.length; j++) {
                    if (rec[k][j] !== frag[j]) {
                        ok = false;
                    }
                }
                if (ok) {
                    continue;
                }
            }
        } else if (_.isPlainObject(frag)) {
            if (matchRec(rec[k], frag)) {
                continue;
            }
        }
        return false;
    }
    return true;
}

// match stream against pattern
function matchStream(stream, pat, magic) {
    let k, val, i, rec, xpat = {};

    for (k in pat) {
        val = pat[k];
        if (typeof val === 'string' && magic) {
            val = magic.getMagic(val) || val;
        }
        xpat[k] = val;
    }

    for (i = stream.length - 1; i >= 0; i--) {
        rec = stream[i];
        if (matchRec(rec, xpat)) {
            return rec;
        }
    }
    return null;
}

// record fields to use to insert into cache
let CACHE_PARAMS = {
    'activity': ['conversation_id', 'account_id'],
    'contact': ['account_id'],
    'conv': ['conversation_id'],
    'org_conv': ['conversation_id'],
    'poke': ['conversation_id', 'message_nr'],
    'external_account': ['external_account_id'],
    'file': ['conversation_id', 'message_nr'],
    'hangout_activity': ['conversation_id', 'hangout_id'],
    'hook': ['conversation_id', 'hook_key'],
    'label': ['label_id'],
    'lastseen': ['account_id'],
    'lock': ['conversation_id', 'message_nr'],
    'mailinfo': ['mail_id'],
    'message': ['conversation_id', 'message_nr'],
    'org_member': ['organisation_id', 'account_id'],
    'org_header': ['organisation_id'],
    'preview': ['conversation_id', 'message_nr', 'attached_url'],
    'reminder': ['reminder_id'],
    'request': ['client_req_id'],
    'smtp': ['smtp_id'],
    'team': ['team_id'],
    'upload': ['conversation_id', 'upload_id'],
    'org_changelog': ['version_nr'],
};

// connection for one client
// object fields:
// .fleep_email - email of fleep user - "xxx@dev.fleep.ee"
// .email - plain email - "xxx@box"
// .email_fullname - plain email with full name - "A B <xxx@box>"
// .account_id - uuid of fleep user
class TestClient {
    constructor(env_host, info, magic, smtp_transport, imap_listener, flog) {

        // public info fields
        this.email = info.email;
        this.email_fullname = info.display_name + ' <' + info.email + '>';
        this.password = info.password;
        this.fleep_email = info.fleep_address + '@' + env_host;
        this.account_id = info.account_id;
        this.display_name = info.display_name;

        // technical fields
        this.info = info;
        this.ticket = null;
        this.base_url = 'https://' + env_host + '/';
        this.jar = cookieJar();
        this.magic = magic;
        this.log = new Logger('[' + info.display_name + ']: ', flog);
        this.smtp_transport = smtp_transport;
        this.imap_listener = imap_listener;
        this.login_response = null;
        this.event_horizon = 0;
        this.agent = newAgent();
        this.last_response = null;

        // pre-register info fields
        magic.register('fladdr', info.fleep_address, info.display_name);
        magic.register('flemail', this.fleep_email, info.display_name);
        magic.register('email', info.email, info.display_name);
        if (this.account_id) {
            magic.register('account', this.account_id, info.display_name);
        }

        // mk_rec_type -> id
        this.cache = {};

        // full stream history
        this.stream = [];

        // all received emails
        this.imap_emails = [];
    }

    get_cookies() {
        let res = {};
        let list = this.jar.getCookies(this.base_url);
        if (list) {
            list.forEach(function (ck) { res[ck.key] = ck.value; });
        }
        return res;
    }

    // fetch full record from cache, given partial record
    cache_get(rec) {
        let rtype = rec.mk_rec_type;
        if (!rtype) {
            throw new Error("cannot find rectype: " + JSON.stringify(rec));
        }
        if (CACHE_PARAMS[rtype] == null) {
            throw new Error("unknown rectype: " + JSON.stringify(rec));
        }
        if (this.cache[rtype] == null) {
            this.cache[rtype] = {};
        }
        let klist = CACHE_PARAMS[rtype];

        let cur_map = this.cache[rtype];
        for (let i = 0; i < klist.length; i++) {
            let k = rec[klist[i]];
            if (k == null) {
                throw new Error("key not found rectype: " + JSON.stringify(rec));
            }
            if (i < klist.length - 1) {
                if (cur_map[k] == null) {
                    cur_map[k] = {};
                }
                cur_map = cur_map[k];
            } else {
                return cur_map[k];
            }
        }
    }

    // add one record to cache
    cache_add(rec) {
        let rtype = rec.mk_rec_type;
        if (!rtype) {
            throw new Error("cannot find rectype: " + JSON.stringify(rec));
        }
        if (CACHE_PARAMS[rtype] == null) {
            throw new Error("unknown rectype: " + JSON.stringify(rec));
        }
        if (this.cache[rtype] == null) {
            this.cache[rtype] = {};
        }
        let klist = CACHE_PARAMS[rtype];

        let cur_map = this.cache[rtype];
        for (let i = 0; i < klist.length; i++) {
            let k = rec[klist[i]];
            if (k == null) {
                throw new Error("key not found rectype: " + JSON.stringify(rec));
            }
            if (i < klist.length - 1) {
                if (cur_map[k] == null) {
                    cur_map[k] = {};
                }
                cur_map = cur_map[k];
            } else if (cur_map[k] != null) {
                // merge into new object
                cur_map[k] = Object.assign({}, cur_map[k], rec);
            } else {
                cur_map[k] = rec;
            }
        }
    }

    // add stream to cache
    cache_add_stream(stream) {
        for (let i = 0; i < stream.length; i++) {
            this.cache_add(stream[i]);
        }
        this.stream.push(...stream);
    }

    // do https request
    raw_api_call(path, payload, qs) {
        let jsbody = payload;
        if (this.ticket != null) {
            jsbody = Object.assign({ticket: this.ticket}, payload);
        }
        let req = {
            uri: this.base_url + path,
            method: 'POST',
            jar: this.jar,
            body: jsbody,
            qs: qs,
            json: true,
            agent: this.agent,
            simple: false,
            resolveWithFullResponse: true,
        };
        this.last_response = null;
        return requestAsync(req)
            .then((res) => {
                // remember full req
                this.last_response = res;

                // throw error
                if (res.statusCode >= 300) {
                    throw new ServerError(res);
                }
                let status = res.statusCode + ' ' + res.statusMessage;

                this.log.info("[%s] API CALL: %s%s\nrequest headers: %s\nrequest: %s\nresponse: %s %s\nresponse headers: %s\n", now_str(), this.base_url, path,
                              JSON.stringify(res.request.headers, null, 2),
                              JSON.stringify(jsbody, null, 2),
                              status,
                              JSON.stringify(res.body, null, 2),
                              JSON.stringify(res.headers, null, 2));
                return res.body;
            })
            .catch((err) => {
                let res = err.response;
                let status = res.statusCode + ' ' + res.statusMessage;
                this.log.info("[%s] API CALL ERROR: %s%s\nrequest headers %s\nrequest: %s\nerror: %s %s\n", now_str(), this.base_url, path,
                              JSON.stringify(res.request.headers, null, 2),
                              JSON.stringify(jsbody, null, 2),
                              status,
                              JSON.stringify(res.body, null, 2));
                return Promise.reject(err);
            });
    }

    // http request with current cookies
    raw_request(path, req) {
        req = Object.assign({
            uri: this.base_url + path,
            jar: this.jar,
            agent: this.agent,
            simple: false,
            resolveWithFullResponse: true,
        }, req);
        return requestAsync(req)
            .then((res) => {
                this.log.info("[%s] HTTP %s: %s%s\ncookies: %s\n", now_str(), req.method, this.base_url, path, this.jar.getCookies(this.base_url));
                return res;
            }, (err) => {
                this.log.info("[%s] HTTP %s ERROR: %s%s - %s\ncookies: %s\n", now_str(), req.method, this.base_url, path, err, this.jar.getCookies(this.base_url));
                return Promise.reject(err);
            });
    }

    // do api call, login if necessary
    api_call(path, payload, qs) {
        if (this.ticket == null) {
            return this.login()
                .then(() => this.raw_api_call(path, payload));
        }
        return this.raw_api_call(path, payload, qs)
            .then((res) => {
                this.magic.clean(res, {});
                if (res.stream != null) {
                    this.cache_add_stream(res.stream);
                }
                if (res.headers != null) {
                    this.cache_add_stream(res.headers);
                }
                if (res.header != null) {
                    this.cache_add_stream([res.header]);
                }
                return res;
            });
    }

    // login, remember ticket/token
    login() {
        let p = Promise.resolve();
        if (this.info.registerEmail) {
            p = p.then(() => this.register_via_email());
        }
        return p.then(() => this.raw_api_call('api/account/login', {email: this.email, password: this.password}))
            .then((res) => {
                this.ticket = res.ticket;
                this.magic.register('ticket', res.ticket, res.display_name);
                this.login_response = res;
                this.account_id = res.account_id;

                let profile = res.profiles[0];
                this.magic.register('flautogen', profile.fleep_autogen, res.display_name);
                this.magic.register('fladdr', profile.fleep_address, res.display_name);

                // do initial_poll but return login result
                return this.initial_poll().then(() => res);
            });
    }

    logout() {
        return this.api_call('api/account/logout', {})
            .then((res) => {
                this.ticket = null;
                return res;
            });
    }

    // register using email confirmation
    register_via_email() {
        return this.raw_api_call('api/account/register', {
                email: this.info.email,
                display_name: this.info.display_name,
                password: this.info.password,
                use_code: true
            })
            .then((res) => this.waitMail({subject: /Fleep confirmation code/}))
            .then((msg) => {
                let code = msg.subject.split(': ')[1].replace('/-/g', '');
                return code;
            })
            .then((code) => this.raw_api_call('api/account/prepare/v2', {
                registration_mail: this.email,
                registration_code: code
            }))
            .then((res) => this.raw_api_call('api/account/confirm/v2', {
                notification_id: res.notification_id,
                password: this.info.password,
                display_name: this.info.display_name,
                fleep_address: this.info.fleep_address
            }))
            .then((res) => {
                //console.log("confirm/v2 res", res);
                this.magic.register('email', this.info.email, res.display_name);
                this.magic.register('account', res.account_id, res.display_name);
                this.info.registerEmail = false;
            });
    }

    // run poll without filtering
    initial_poll() {
        return this.poll_core([], Date.now());
    }

    // wait until record appears from poll
    poll_filter(filter) {
        return this.poll_core([], Date.now(), filter);
    }

    // internal poll loop
    poll_core(rlist, start_time, filter, wait) {
        return this.api_call("api/account/poll", {wait: !!wait, event_horizon: this.event_horizon})
            .then((res) => {
                rlist.push(...res.stream);

                let old_horiz = this.event_horizon;
                this.event_horizon = res.event_horizon;

                if (res.event_horizon !== old_horiz) {
                    return this.poll_core(rlist, start_time, filter);
                }
                if (filter) {
                    let mrec = matchStream(rlist, filter, this.magic);
                    if (mrec == null) {
                        // not found, sleep & poll again
                        let dur = Date.now() - start_time;
                        if (dur < 10 * 1000) {
                            return waitAsync(1 * 1000)
                                .then(() => this.poll_core(rlist, start_time, filter, true));
                        } else {
                            return Promise.reject(new Error('poll did not return needed record: ' + util.format(filter))); // + " stream = " + JSON.stringify(rlist, null, 2)));
                        }
                    } else {
                        //return mrec;
                    }
                }

                // no filter, just return full stream
                res.stream = rlist;
                return res;
            });
    }

    // search over full stream
    matchStream(filter) {
        return matchStream(this.stream, filter, this.magic);
    }

    // search from already received emails
    findMail(filter) {
        return matchStream(this.imap_emails, filter, this.magic);
    }

    // wait for poke passthrough
    poke(conv_id, is_bg_poke) {
        let rnd_id = randomInt();
        return this.api_call("api/conversation/poke/" + conv_id, {is_bg_poke: !!is_bg_poke, message_nr: rnd_id})
             .then((res) => {
                return this.poll_filter({mk_rec_type: 'poke', message_nr: rnd_id});
             });
    }

    // send mail from users email server
    send_mail(email_opts) {
        email_opts = Object.assign({
            'from': this.email_fullname,
        }, email_opts);
        return this.smtp_transport.sendMail(email_opts);
    }

    // wait for specific mail
    waitMail(filter) {
        return this.imap_listener.waitMail(this.email)
            .then((mlist) => {
                let now = new Date().toISOString().replace('T', ' ');
                this.log.info("[%s] GOT EMAIL: %s\nemails: %s\n", now, this.email_fullname, JSON.stringify(mlist, null, 2));

                this.imap_emails.push(...mlist);

                let ret = this.findMail(filter);
                if (ret == null) {
                    return this.waitMail(filter);
                }
                return Promise.resolve(ret);
            });
    }

    // find record in cache
    getRecord(mk_rec_type, field, pat) {
        let arg = {mk_rec_type: mk_rec_type};
        arg[field] = pat;
        let rec = this.matchStream(arg);
        if (rec == null) {
            throw new Error("record not found: " + util.format(arg));
        }
        let crec = this.cache_get(rec);
        if (crec) {
            if (false) {
                // full record in cache
                return crec;
            } else {
                // actual record in stream
                return rec;
            }
        } else {
            throw new Error("record in stream but not in cache: " + util.format(rec));
        }
    }

    //
    // find objects in cache
    //

    getConv(topicPat) {
        return this.getRecord('conv', 'topic', topicPat);
    }

    getMessage(messagePat) {
        return this.getRecord('message', 'message', messagePat);
    }

    getHook(namePat) {
        return this.getRecord('hook', 'hook_name', namePat);
    }

    getTeam(namePat) {
        return this.getRecord('team', 'team_name', namePat);
    }

    getOrg(namePat) {
        return this.getRecord('org_header', 'organisation_name', namePat);
    }

    getContact(namePat) {
        return this.getRecord('contact', 'display_name', namePat);
    }

    //
    // return object fields
    //

    // return message_nr based on text pattern
    getMessageNr(textPat) {
        return this.getMessage(textPat).message_nr;
    }


    // return conversation_id based on text pattern on topic
    getConvId(topicPat) {
	return this.getConv(topicPat).conversation_id;
    }

    getHookUrl(hookName) {
        return this.getHook(hookName).hook_url;
    }

    getHookKey(hookName) {
        return this.getHook(hookName).hook_key;
    }

    getTeamId(teamName) {
        return this.getTeam(teamName).team_id;
    }

    getOrgId(orgName) {
        return this.getOrg(orgName).organisation_id;
    }

    getTeamAutoJoinKey(teamName) {
        let rec = this.getTeam(teamName);
	let parts = rec.autojoin_url.split("/");
        return parts.pop();
    }
}

export {
    TestClient,
    matchRec,
    matchStream,
};

