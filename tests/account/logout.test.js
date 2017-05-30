
import {UserCache, thenSequence} from '../../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

function setAuth(dst, token, ticket) {
    dst.ticket = ticket;
    dst.jar.setCookie('token_id=' + token, UC.BASE_URL, {});
}

describe('logout', function () {
    test('logout test', function () {
        let old_token, old_ticket;
        return thenSequence([
            // login
            () => UC.alice.initial_poll(),
            () => {
                let ck = UC.alice.get_cookies();
                UC.bob.email = UC.alice.email;
                old_ticket = UC.alice.ticket;
                old_token = ck.token_id;
            },

            // logout
            () => UC.alice.logout(),
            () => {
                let ck = UC.alice.get_cookies();
                expect(ck.token_id).toEqual(old_token); // FIXME: clear cookie
            },

            // try api call with old cookie
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.initial_poll()
                .then(() => Promise.reject(new Error('unexpected unfail 1')),
                      (err) => expect(err.statusCode) ),

            // try http call with old cookie
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.raw_request('', {method: 'GET'}),
            (res) => {
                let ck = UC.bob.get_cookies();
                expect(res.statusCode).toEqual(200);
                expect(ck.token_id).not.toEqual(old_token);
            },

            // try globals/auth with old cookie
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.raw_request('globals/auth', {method: 'GET'}),
            (res) => expect(res.statusCode).toEqual(401),

            // try /chat with old cookie, no redirects
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.raw_request('chat', {method: 'GET', followRedirect: false}),
            (res) => {
                if (res.statusCode !== 401) {
                    expect(res.statusCode).toEqual(302);
                    expect(res.headers.location).toEqual('/login');
                }
            },

            // try /chat with old cookie, redirect to /login
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.raw_request('chat', {method: 'GET', followRedirect: true}),
            (res) => {
                let ck = UC.bob.get_cookies();
                if (res.statusCode !== 401) {
                    expect(res.statusCode).toEqual(200);
                    expect(ck.token_id).not.toEqual(old_token);
                    expect(ck.xs_ticket).not.toEqual(old_ticket);
                }

                // check if new cookie works
                UC.bob.ticket = ck.xs_ticket;
                return UC.bob.initial_poll()
                    .then(() => Promise.reject(new Error('unexpected unfail 3')),
                          () => true);
            },

            // try /login with old cookie, should not redirect to /chat
            () => setAuth(UC.bob, old_token, old_ticket),
            () => UC.bob.raw_request('login', {method: 'GET', followRedirect: false}),
            (res) => {
                let ck = UC.bob.get_cookies();
                expect(res.statusCode).toEqual(200);
                expect(ck.token_id).not.toEqual(old_token);
                //expect(ck.xs_ticket).not.toEqual(old_ticket);

                // check if new cookie works
                UC.bob.ticket = ck.xs_ticket;
                return UC.bob.initial_poll()
                    .then(() => Promise.reject(new Error('unexpected unfail 4')),
                          () => true);
            },
        ]);
    });
});

