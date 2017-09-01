import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson@',
    'King Kong@',
    'Bill Clinton@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('register new fleep account via email and check for welcome email', function () {
    return thenSequence([
        () => UC.bill.register_via_email(),
        () => UC.bill.waitMail({
            subject: /Welcome to Fleep/,
            body: /Thank you for signing up to Fleep/
        }),
    ]);
});

test('register new fleep account via team invite and check for welcome email', function () {
    let client = UC.bob;
    let team_name = 'welcomeEmail';
    let nfid = null;

    return thenSequence([
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: '<my_ip>',
            mk_time_action: 'clear_regcode_ip_velo',
        }),
        // create a team and invite don
        () => client.api_call("api/team/create", {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.api_call("api/account/lookup", {lookup_list: [UC.don.email], ignore_list: []}),
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {
            add_emails: UC.don.email,
        }),
        () => UC.don.waitMail({
            subject: /invited you to/,
            body: /has started using Fleep messenger, and added you to/
        }),
        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },
        // prepare and confirm Don's registration and joining the team
        () => UC.don.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.don.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.don.info.display_name,
            password: UC.don.password,
            fleep_address: res.suggestions[0]
        }),
        () => UC.don.waitMail({
            subject: /Welcome to Fleep/,
            body: /Thank you for signing up to Fleep/
        }),
    ]);
});

test('register new fleep user via org invite and check for welcome email', function () {
    let client = UC.meg;
    let org_name = 'welcomeEmail';
    let nfid = null;

    return thenSequence([
        // create org and invite king
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // do a lookup for king's account
        () => client.api_call("api/account/lookup", {lookup_list: [UC.king.email], ignore_list: []}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [client.getRecord('contact', 'email', UC.king.email).account_id]
        }),
        () => UC.king.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/,
        }),
        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },
        // prepare and confirm king's registration and joining the org
        () => UC.king.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.king.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.king.info.display_name,
            password: UC.king.password,
            fleep_address: res.suggestions[0]
        }),
        () => UC.king.waitMail({
            subject: /Welcome to Fleep/,
            body: /Thank you for signing up to Fleep/
        }),
    ]);
});
