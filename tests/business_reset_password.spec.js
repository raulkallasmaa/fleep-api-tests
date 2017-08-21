import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Ben Dover',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('business reset password and check for email & close session', function () {
    let client = UC.bob;
    let org_name = 'businessResetPassword';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // do a lookup for ben's account
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ben.email], ignore_list: []}),

        // invite ben
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.ben.account_id],
        }),
        // ben joins the org
        () => UC.ben.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.ben.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.ben.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: res.reminder_id}),

        // reset ben's password
        () => client.api_call("api/business/reset_password/" + client.getOrgId(org_name), {
            profile_id: UC.ben.account_id,
            password: UC.ben.password + 'gh54g6h5gh45',
        }),
        // ben receives an email regarding his password change
        () => UC.ben.waitMail({
            subject: /Your Fleep account password has been reset/,
            body: /reset the password of your Fleep account/,
        }),
        // ben's current connection/session has been closed and he has been logged out
        () => UC.ben.poll_filter()
            .then(() => Promise.reject(new Error('Expired token, please relogin.')),
                (r) => expect(r.statusCode).toEqual(401)),
    ]);
});
