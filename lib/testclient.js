// api client

"use strict";

import { requestPromise, cookieJar } from './utils';

// connection for one client
class TestClient {
    constructor(base_url, info, magic) {
        this.base_url = base_url;
        this.email = info.email;
        this.password = info.password;
        this.ticket = null;
        this.jar = cookieJar();
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
            uri: this.base_url + path,
            method: 'POST',
            headers: {'User-Agent': 'ApiTest'},
            jar: this.jar,
            body: payload,
            qs: qs,
            json: true,
            gzip: true,
            agent: false
        };
        return requestPromise(req)
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

export { TestClient };

