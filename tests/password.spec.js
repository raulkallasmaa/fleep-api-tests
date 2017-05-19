import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Jessica Alba',
    'Snoop Dogg',
    'Johnny Depp',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

it.skip('should reset password', function () {
   let client = UC.jessica;
   return thenSequence([
       () => client.api_call("api/account/reset_password", {email: client.email}),
       () => client.waitMail({}),
       (res) => expect(res).toEqual({})
   ]);
});