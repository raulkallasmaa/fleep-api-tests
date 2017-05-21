import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Jessica Alba',
    'Snoop Dogg',
    'Johnny Depp',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

it('should reset password and set new', function () {
   let client = UC.jessica;
   return thenSequence([
       () => client.logout(),
       () => client.raw_api_call("api/account/reset_password", {email: client.email}),
       () => client.waitMail({subject: /Your Fleep account access/, body: /link to reset your password/}),
       (res) => {
           let link = /https:[^\s]+/.exec(res.body)[0];
           let nfid = /notification_id=([^=&]+)/.exec(link)[1];
           //expect({link:link, nfid:nfid}).toEqual({});
           client.password = client.password + 'esdgs53h45gh43g5k435k435dgsdf';
           return nfid;
       },
       (nfid) => client.raw_api_call("api/account/confirm_password", {
           notification_id: nfid,
           password: client.password
       }),
       () => client.login()
   ]);
});
