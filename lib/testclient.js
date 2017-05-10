// api client

import { requestAsync, cookieJar, newAgent, dump_record, waitAsync, randomInt } from './utils';
import { Logger } from './logger';
import _ from 'lodash';
import util from 'util';

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
function matchStream(stream, pat) {
    let i, rec;
    for (i = stream.length - 1; i >= 0; i--) {
        rec = stream[i];
        if (matchRec(rec, pat)) {
            return rec;
        }
    }
    return null;
}

function findMail(mlist, filter) {
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

// record fields to use to insert into cache
let CACHE_PARAMS = {
    'activity': ['conversation_id', 'account_id'],
    'contact': ['account_id'],
    'conv': ['conversation_id'],
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
};

// connection for one client
// object fields:
// .fleep_email - email of fleep user - "xxx@dev.fleep.ee"
// .email - plain email - "xxx@box"
// .email_fullname - plain email with full name - "A B <xxx@box>"
// .account_id - uuid of fleep user
class TestClient {
    constructor(env_host, info, magic, smtp_transport, imap_listener) {

        // public info fields
        this.email = info.email;
        this.email_fullname = info.display_name + ' <' + info.email + '>';
        this.password = info.password;
        this.fleep_email = info.fleep_address + '@' + env_host;
        this.account_id = info.account_id;

        // technical fields
        this.info = info;
        this.ticket = null;
        this.base_url = 'https://' + env_host + '/';
        this.jar = cookieJar();
        this.magic = magic;
        this.log = new Logger('[' + info.display_name + ']: ');
        this.smtp_transport = smtp_transport;
        this.imap_listener = imap_listener;
        this.login_response = null;
        this.event_horizon = 0;
        this.agent = newAgent();

        // mk_rec_type -> id
        this.cache = {};

        // full stream history
        this.stream = [];

        // all received emails
        this.imap_emails = [];
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
        };
        return requestAsync(req)
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

    // run poll without filtering
    initial_poll() {
        return this.poll_core([], Date.now());
    }

    // wait until record appears from poll
    poll_filter(filter) {
        return this.poll_core([], Date.now(), filter);
    }

    // internal poll loop
    poll_core(rlist, start_time, filter) {
        return this.api_call("api/account/poll", {wait: false, event_horizon: this.event_horizon})
            .then((res) => {
                rlist.push(...res.stream);

                let old_horiz = this.event_horizon;
                this.event_horizon = res.event_horizon;

                if (res.event_horizon !== old_horiz) {
                    return this.poll_core(rlist, start_time, filter);
                }
                if (filter) {
                    let mrec = matchStream(rlist, filter);
                    if (mrec == null) {
                        // not found, sleep & poll again
                        let dur = Date.now() - start_time;
                        if (dur < 10 * 1000) {
                            return waitAsync(3 * 1000)
                                .then(() => this.poll_core(rlist, start_time, filter));
                        } else {
                            return Promise.reject(new Error('poll did not return needed record: ' + util.format(filter) + " stream = " + JSON.stringify(rlist, null, 2)));
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
        return matchStream(this.stream, filter);
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
                this.imap_emails.push(...mlist);

                let ret = this.findMail(filter);
                if (ret == null) {
                    return this.waitMail(filter);
                }
                return Promise.resolve(ret);
            });
    }

    // search from already received emails
    findMail(filter) {
        return findMail(this.imap_emails, filter);
    }

    getMessageNr(textPat) {
        let rec = this.matchStream({mk_rec_type: 'message', message: textPat});
        if (rec == null) {
            throw new Error("message not found: " + textPat);
        }
        return rec.message_nr;
    }
    getConvId(topicPat) {
        let rec = this.matchStream({mk_rec_type: 'conv', topic: topicPat});
        if (rec == null) {
            throw new Error("conv not found: " + topicPat);
        }
        return rec.conversation_id;
    }
}

export {
    TestClient,
    matchRec,
    matchStream,
};

