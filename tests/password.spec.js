import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Jessica Alba',
    'Snoop Dogg',
    'Johnny Depp',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('password tests', function () {
    it('should reset password and set new', function () {
        let client = UC.jessica;
        return thenSequence([
            // make sure the account isnt logged in when requesting new password
            () => client.logout(),
            // an email is sent with a password reset link
            () => client.raw_api_call("api/account/reset_password", {email: client.email}),
            () => client.waitMail({subject: /Your Fleep account access/, body: /link to reset your password/}),
            (res) => {
                let link = /https:[^\s]+/.exec(res.body)[0];
                let nfid = /notification_id=([^=&]+)/.exec(link)[1];
                //expect({link:link, nfid:nfid}).toEqual({});
                client.password = client.password + 'esdgs53h45gh43g5k435k435dgsdf';
                return nfid;
            },
            // confirm the new password
            (nfid) => client.raw_api_call("api/account/confirm_password", {
                notification_id: nfid,
                password: client.password
            }),
            () => client.login()
        ]);
    });

    it('retry password reset until it hits velocity', function () {
        let client2 = UC.snoop;
        return thenSequence([
            () => client2.logout(),
            // try to reset password with an invalid email address
            () => client2.raw_api_call("api/account/reset_password", {email: client2.info.fleep_address + '@gmail.com'})
                .then(() => Promise.reject(new Error('Account not found!')),
                    (r) => expect(r.statusCode).toEqual(431)),
            // reset password with same email address over and over again
            () => Promise.all([
                client2.raw_api_call("api/account/reset_password", {email: client2.email}),
                client2.raw_api_call("api/account/reset_password", {email: client2.email}),
                client2.raw_api_call("api/account/reset_password", {email: client2.email}),
                client2.raw_api_call("api/account/reset_password", {email: client2.email}),
                client2.raw_api_call("api/account/reset_password", {email: client2.email}),
            ])
                .then(() => Promise.reject(new Error('Too many password reset attempts per hour!')),
                    (r) => expect(r.statusCode).toEqual(431)),
        ]);
    });
});