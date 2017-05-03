// api client

import { requestPromise, cookieJar, newAgent, dump_record } from './utils';

// connection for one client
class TestClient {
    constructor(base_url, info, magic, smtp_transport, imap_listener) {
        this.base_url = base_url;
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
        return this.raw_api_call(path, payload, qs);
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
            p = p.then(() => this.raw_api_call('api/account/register', {
                    email: this.info.email,
                    display_name: this.info.display_name,
                    password: this.info.password,
                    use_code: true
                }))
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
        return p.then(() => this.raw_api_call('api/account/login', {email: this.email, password: this.password}))
            .then((res) => {
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
            .then((res) => {
                rlist.push(res);
                if (res.event_horizon !== ev_horiz) {
                    return this.initial_poll_loop(rlist, res.event_horizon);
                }

                // merge stream to single result
                let stream = [];
                for (let i = 0; i < rlist.length; i++) {
                    stream.push(...rlist[i].stream);
                }
                res.stream = stream;
                this.event_horizon = res.event_horizon;
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

