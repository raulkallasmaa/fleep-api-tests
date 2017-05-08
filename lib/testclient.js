// api client

import { requestPromise, cookieJar, newAgent, dump_record, promiseWait } from './utils';
import { Logger } from './logger';

// return true if rec matches pat
function matchRec(rec, pat) {
    //console.log("matchRec pat=" + JSON.stringify(pat) + " rec=" + JSON.stringify(rec));
    if (rec.mk_rec_type !== pat.mk_rec_type) {
        return false;
    }
    for (let k in pat) {
        let frag = pat[k];
        if (rec[k] && rec[k].indexOf(frag) >= 0) {
            continue;
        } else {
            return false;
        }
    }
    return true;
}

// match stream against pattern
function matchStream(stream, pat) {
    let i, rec;
    for (i = 0; i < stream.length; i++) {
        rec = stream[i];
        if (matchRec(rec, pat)) {
            return true;
        }
    }
    return false;
}

// connection for one client
class TestClient {
    constructor(env_host, info, magic, smtp_transport, imap_listener) {
        this.base_url = 'https://' + env_host + '/';
        this.email = info.email;
        this.email_fullname = info.display_name + ' <' + info.email + '>';
        this.password = info.password;
        this.ticket = null;
        this.jar = cookieJar();
        this.magic = magic;
        this.login_response = null;
        this.event_horizon = 0;
        this.agent = newAgent();
        this.smtp_transport = smtp_transport;
        this.imap_listener = imap_listener;
        this.info = info;
        this.fleep_email = info.fleep_address + '@' + env_host;
        this.log = new Logger('[' + info.display_name + ']: ');

        // mk_rec_type -> id
        this.cache = {};
        this.cache_params = {
            'activity': ['conversation_id', 'account_id'],
            'contact': ['account_id'],
            'conv': ['conversation_id'],
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
        };
    }

    // add one record to cache
    cache_add(rec) {
        let rtype = rec.mk_rec_type;
        if (!rtype) {
            throw new Error("cannot find rectype: " + JSON.stringify(rec));
        }
        if (this.cache_params[rtype] == null) {
            throw new Error("unknown rectype: " + JSON.stringify(rec));
        }
        if (this.cache[rtype] == null) {
            this.cache[rtype] = {};
        }
        let klist = this.cache_params[rtype];

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
                cur_map[k] = rec;
            }
        }
    }

    // add stream to cache
    cache_add_stream(stream) {
        for (let i = 0; i < stream.length; i++) {
            this.cache_add(stream[i]);
        }
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
        };
        return requestPromise(req)
            .then((res) => {
                if (0) {
                    dump_record(path, res);
                }
                return res;
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
                return res;
            });
    }

    findMail(mlist, filter) {
        for (let i = 0; i < mlist.length; i++) {
            let msg = mlist[i];
            if (filter.subject && msg.headers.subject.indexOf(filter.subject) < 0) {
                continue;
            }
            if (filter.body && msg.body.indexOf(filter.body) < 0) {
                continue;
            }
            return msg;
        }
        return null;
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

                let profile = res.profiles[0];
                this.magic.register('flautogen', profile.fleep_autogen, res.display_name);
                this.magic.register('fladdr', profile.fleep_address, res.display_name);

                // do initial_poll but return login result
                return this.initial_poll().then(() => res);
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
            .then((res) => this.imap_listener.waitMail(this.email))
            .then((msglist) => {
                let msg = this.findMail(msglist, {subject: 'Fleep confirmation code'});
                if (msg == null) {
                    throw new Error('confirmation mail not found');
                }
                let code = msg.headers.subject.split(': ')[1].replace('/-/g', '');
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
            });
    }

    initial_poll() {
        return this.poll_core([], Date.now());
    }

    poll_filter(filter) {
        return this.poll_core([], Date.now(), filter);
    }

    poll_core(rlist, start_time, filter) {
        return this.api_call("api/account/poll", {wait: false, event_horizon: this.event_horizon})
            .then((res) => {
                if (filter) {
                    //console.log(res);
                }
                rlist.push(...res.stream);
                res.stream = rlist;

                let old_horiz = this.event_horizon;
                this.event_horizon = res.event_horizon;

                if (res.event_horizon !== old_horiz) {
                    return this.poll_core(rlist, start_time, filter);
                }
                if (filter && !matchStream(rlist, filter)) {
                    let dur = Date.now() - start_time;
                    if (dur < 10 * 1000) {
                        return promiseWait(3 * 1000)
                            .then(() => this.poll_core(rlist, start_time, filter));
                    } else {
                        return Promise.reject(new Error('poll did not return needed record'));
                    }
                }
                return res;
            });
    }

    send_mail(email_opts) {
        email_opts = Object.assign({
            'from': this.email_fullname,
        }, email_opts);
        return this.smtp_transport.sendMail(email_opts);
    }
}

export { TestClient };

