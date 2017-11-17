import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('team configure org wide off and on', function () {
    let client = UC.bob;
    let conv_topic = 'teamIsOrgWide';
    let org_name = 'orgName';
    let team_name = 'teamName';

    return thenSequence([
        // create conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create org and add 2 users
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.meg.account_id, UC.don.account_id],
        }),
        // create managed team
        () => client.api_call("api/team/create", {
            team_name: team_name,
            conversations: [client.getConvId(conv_topic)],
            is_managed: true,
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that bob is the only member of the team
        () => expect(UC.clean(client.getTeam(team_name).members)).toEqual(["<account:Bob Marley>"]),
        // turn org wide on
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {is_org_wide: true}),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that the other 2 org members are added to the team
        () => expect(UC.clean(client.getTeam(team_name).members)).toEqual([
            "<account:Bob Marley>",
            "<account:Don Johnson>",
            "<account:Meg Griffin>",
        ]),
        // add jil to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jil.account_id],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that jil is added to the team
        () => expect(UC.clean(client.getTeam(team_name).members)).toEqual([
            "<account:Bob Marley>",
            "<account:Don Johnson>",
            "<account:Jil Smith>",
            "<account:Meg Griffin>",
        ]),
        // turn org wide off and add jon to the org
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {is_org_wide: false}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that jon wasn't added to the team
        () => expect(UC.clean(client.getTeam(team_name).members)).toEqual([
            "<account:Bob Marley>",
            "<account:Don Johnson>",
            "<account:Jil Smith>",
            "<account:Meg Griffin>",
        ]),
    ]);
});
