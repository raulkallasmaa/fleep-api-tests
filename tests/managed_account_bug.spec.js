import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Ben Dover',
    'Don Johnson',
    'Jon Snow',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('user is removed from managed conv and team after declining org invite and getting kicked from the org', function () {
    let client = UC.bob;
    let conv_topic = 'topic1';
    let conv_topic2 = 'topic2';
    let org_name = 'orgName1';
    let team_name = 'teamName1';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create managed conv and add meg
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // check that the conv is managed
        () => expect(UC.clean(client.getConv(conv_topic)).is_managed).toEqual(true),
        // create managed team and add meg
        () => client.api_call("api/team/create", {
            team_name: team_name,
            account_ids: [UC.meg.account_id],
            is_managed: true,
        }),
        // invite meg to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.meg.account_id]
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        // meg declines the org invite
        () => UC.meg.api_call('api/account/sync_reminders'),
        () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.meg.api_call("api/account/click_reminder", {reminder_id: res.reminder_id}),
        // meg joins the org
        // () => UC.meg.api_call('api/account/sync_reminders'),
        // () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        // (res) => UC.meg.api_call("api/business/join/" + client.getOrgId(org_name), {
        //     reminder_id: res.reminder_id
        // }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that meg is in the managed conv
        () => client.getConv(conv_topic).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>", "<account:Meg Griffin>"]),
        // check that meg is in the managed team
        () => client.getTeam(team_name).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>", "<account:Meg Griffin>"]),
        // kick meg from the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            kick_account_ids: [UC.meg.account_id]
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that meg is no longer in the managed conv
        () => client.getConv(conv_topic).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        // check that meg is no longer in the managed team
        () => client.getTeam(team_name).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        // create a new conv
        () => client.api_call("api/conversation/create", {topic: conv_topic2}),
        (res) => expect(res.header.topic).toEqual(conv_topic2),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic2}),
        // turn the conv managed
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic2), {is_managed: true}),
        // check that the conv is managed
        () => expect(UC.clean(client.getConv(conv_topic2)).is_managed).toEqual(true),
        () => client.api_call("api/conversation/sync/" + client.getConvId(conv_topic2)),
        // check that no system message about user being kicked from conv is created after a conv is turned managed
        () => client.matchStream({mk_rec_type: 'message', message: /removed/, conversation_id: client.getConvId(conv_topic2)}),
        (res) => expect(UC.clean(res)).toEqual(null),
    ]);
});
