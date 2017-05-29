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
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id, UC.don.account_id]}),
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.api_call("api/business/store_team/" + client.getOrgId(org_name), {
            team_id: client.getTeamId(team_name),
            add_account_ids: [UC.don.account_id, UC.jon.account_id],
            is_managed: true}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => UC.charlie.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]}),
    ]);
});