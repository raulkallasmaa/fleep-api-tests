// api client

import { waitAsync, randomInt, readFileAsync } from './utils';
import { Logger } from './logger';
import { logRequestAsync, now_str, cookieJar, newAgent } from './http';
import util from 'util';

// return true if rec matches pat
function matchRec(rec, pat) {
    for (let k in pat) {
        let frag = pat[k];
        if (typeof frag !== 'object' || frag === null) {
            if (rec[k] === frag) {
                continue;
            }
        } else if (frag instanceof RegExp) {
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
        } else {
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

    // search for several objects
    if (Array.isArray(pat)) {
        let rlist = [];
        for (i = 0; i < pat.length; i++) {
            rec = matchStream(stream, pat[i], magic);
            if (rec == null) {
                return null;
            }
            rlist.push(rec);
        }
        return rlist;
    }

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

function quote_http_header(kind, params) {
    let k, v, res = [kind];
    for (k in params) {
        v = params[k].replace(/[\\"]/g, '\\$&');
        res.push(k + '="' + v + '"');
    }
    return res.join('; ');
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
    'billing': ['organisation_id'],
    'preview': ['conversation_id', 'message_nr', 'attached_url'],
    'reminder': ['reminder_id'],
    'request': ['client_req_id'],
    'smtp': ['smtp_id'],
    'team': ['team_id'],
    'upload': ['conversation_id'],
    'org_changelog': ['version_nr'],
    'mail': ['mail_id'],
    'mail_conf_progress': ['mail_id'],
    'section': ['conversation_id', 'section_id'],
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

        // full requests history
        this.requests = [];

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

    // add requests to cache
    cache_add_requests(requests) {
        for (let i = 0; i < requests.length; i++) {
            this.cache_add(requests[i]);
        }
        this.requests.push(...requests);
    }

    // do https request
    raw_api_call(path, payload, qs) {
        let jsbody = payload;
        if (this.ticket != null) {
            jsbody = Object.assign({ticket: this.ticket, api_version: 2}, payload);
        }
        let req = {
            uri: this.base_url + path,
            method: 'POST',
            jar: this.jar,
            body: jsbody,
            qs: qs,
            json: true,
            agent: this.agent,
        };
        this.last_response = null;
        return logRequestAsync('APICALL', req, this.log)
            .then((res) => {
                this.last_response = res;
                return res.body;
            });
    }

    // do https PUT
    raw_api_put(path, filename, qs, databuf) {
        let basename = filename.replace(/.*\//, '');
        let req = {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': quote_http_header('attachment', {filename: basename}),
            },
            uri: this.base_url + path,
            method: 'PUT',
            jar: this.jar,
            body: null,
            qs: qs,
            agent: this.agent,
        };
        this.last_response = null;

        let p = databuf ? Promise.resolve(databuf) : readFileAsync(filename);
        return p.then((data) => logRequestAsync('rawPUT', Object.assign(req, {body: data}), this.log))
            .then((res) => {
                // remember full req
                this.last_response = res;

                if (/application\/json/.test(res.headers['content-type'])) {
                    res.body = JSON.parse(res.body);
                }
                return res.body;
            });
    }

    // http request with current cookies
    raw_request(path, req) {
        path = path.replace(/^\/+/, '');
        req = Object.assign({
            uri: this.base_url + path,
            jar: this.jar,
            agent: this.agent,
            method: 'GET',
            keepErrors: true,
        }, req);
        return logRequestAsync('raw', req, this.log);
    }

    // PUT, handle login and result processing
    api_put(path, filename, data) {
        let p = Promise.resolve();
        if (!this.ticket) {
            p = p.then(() => this.login());
        }
        return p.then(() => this.raw_api_put(path, filename, {ticket: this.ticket}, data))
            .then((res) => this._process_result(res));
    }

    // do api call, login if necessary
    api_call(path, payload, qs) {
        let p = Promise.resolve();
        if (this.ticket == null) {
            p = p.then(() => this.login());
        }
        return p.then(() => this.raw_api_call(path, payload, qs))
            .then((res) => this._process_result(res));
    }

    _process_result(res) {
        //this.log.info("_process_result: %s", JSON.stringify(res));
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
        if (res.requests != null) {
            this.cache_add_requests(res.requests);
        }
        return res;
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
                        if (dur < 5 * 60 * 1000) {
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

    // search over full stream
    matchRequests(filter) {
        return matchStream(this.requests, filter, this.magic);
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
    // options: https://nodemailer.com/smtp/
    send_mail(email_opts) {
        email_opts = Object.assign({
            'from': this.email_fullname,
        }, email_opts);
        this.log.info("[%s] SEND EMAIL: %s\n", now_str(), JSON.stringify(email_opts, null, 2));
        return this.smtp_transport.sendMail(email_opts);
    }

    // wait for specific mail
    waitMail(filter) {
        this.log.info("[%s] WAITING EMAIL: %s filter: %s\n", now_str(), this.email_fullname, JSON.stringify(filter));
        return this.imap_listener.waitMail(this.email)
            .then((mlist) => {
                this.log.info("[%s] GOT EMAIL: %s\nemails: %s\n", now_str(), this.email_fullname, JSON.stringify(mlist, null, 2));

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

    getLabel(namePat) {
        return this.getRecord('label', 'label', namePat);
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

    getLabelId(labelName) {
        return this.getLabel(labelName).label_id;
    }
}

export {
    TestClient,
    matchRec,
    matchStream,
};

