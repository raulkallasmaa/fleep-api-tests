import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test.skip('account close test', function () {
    let client = UC.bob;
    let conv_topic = 'topic1';
    let conv_topic2 = 'topic2';
    let org_name = 'orgName1';
    let team_name = 'teamName1';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create team and add meg
        () => client.api_call("api/team/create", {
            team_name: team_name,
            account_ids: [UC.meg.account_id],
        }),
        // create conv1 and add meg
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create conv2 and add meg
        () => client.api_call("api/conversation/create", {
            topic: conv_topic2,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic2}),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.poke(client.getConvId(conv_topic2), true),
        // meg deletes conv2
        () => UC.meg.api_call("api/conversation/store/" + client.getConvId(conv_topic2), {is_deleted: true}),
        // meg closes her account
        () => UC.meg.api_call("api/account/close", {}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(conv_topic2), true),
        // check that meg is removed from both the deleted conv and the regular conv and also from the team
        () => client.getConv(conv_topic).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        () => client.getConv(conv_topic2).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        () => client.getTeam(team_name).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        // check that meg is logged out after account close
        () => UC.meg.logout()
        .then(() => Promise.reject(new Error('Expired token, please relogin')),
            (r) => expect(r.statusCode).toEqual(401)),
        // check that meg can not log back in
        () => UC.meg.login()
            .then(() => Promise.reject(new Error('Incorrect email or password')),
                (r) => expect(r.statusCode).toEqual(431)),
        // do a lookup for jon
        () => client.api_call("api/account/lookup", {lookup_list: [UC.jon.email], ignore_list: []}),
        // invite fleep user jon to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id]
        }),
        // jon joins the org
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.jon.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.jon.api_call("api/business/join/" + client.getOrgId(org_name), {reminder_id: res.reminder_id}),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        // check that jon is an active member of the org
        () => expect(UC.clean(client.getRecord('org_member', 'account_id', UC.jon.account_id))).toEqual({
            "account_id": "<account:Jon Lajoie>",
            "inviter_id": "<account:Bob Marley>",
            "is_admin": false,
            "mk_member_status": "bms_active",
            "mk_rec_type": "org_member",
            "organisation_id": "<org:orgName1>",
        }),
        // jon tries to close his account but can't
        () => UC.jon.api_call("api/account/close")
            .then(() => Promise.reject(new Error('Org members can be closed only by org admins')),
                (r) => expect(r.statusCode).toEqual(430)),
        // !!! org admin bob shouldn't be able to close his account while he's not the only member left in the org, needs a fix !!!
        () => client.api_call("api/account/close"),
        /*
        () => UC.jon.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(UC.clean(UC.jon.getOrg(org_name))).toEqual({
            "active_member_count": "...",
            "grace_time": "...",
            "is_admin": false,
            "is_member": true,
            "mk_rec_type": "org_header",
            "organisation_founder_id": "<account:Bob Marley>",
            "organisation_id": "<org:orgName1>",
            "organisation_name": "orgName1",
            "status": "bos_closed",
            "trial_time": "...",
            "version_nr": 4,
        }),
        () => expect(UC.clean(UC.jon.getOrg(org_name).active_member_count)).toEqual(1),
        */
    ]);
});
