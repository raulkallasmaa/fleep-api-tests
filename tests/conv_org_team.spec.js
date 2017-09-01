import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Jon Lajoie',
    'Charlie Chaplin',
    'Don Johnson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('free conversation with managed team', function () {
    let client = UC.bob;
    let conv_topic = 'freeConv';
    let team_name = 'managedTeam';
    let org_name = 'organisationName';

    return thenSequence([
        // create free conversation
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.charlie.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // create org and add jon & don
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id, UC.don.account_id]}),

        // create managed team and add don and jon
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.api_call("api/business/store_team/" + client.getOrgId(org_name), {
            team_id: client.getTeamId(team_name),
            add_account_ids: [UC.don.account_id, UC.jon.account_id],
            is_managed: true}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // charlie tries to add managed team to conv but fails to do so
        () => UC.charlie.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Business logic error!')),
                 (r) => expect(r.statusCode).toEqual(431)),

        // don tries to add managed team to conv but can't cause he's not in the conv so he can't see the conv
        () => UC.don.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Member or conversation not found!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // Bob adds managed team to conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]}),

        // charlie tries to remove managed team from conv but fails
        () => UC.charlie.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            remove_team_ids: [client.getTeamId(team_name)]})
        .then(() => Promise.reject(new Error('Business logic error!')),
            (r) => expect(r.statusCode).toEqual(431)),

        // jon removes managed team from conv
        () => UC.jon.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            remove_team_ids: [client.getTeamId(team_name)]}),
    ]);
});
