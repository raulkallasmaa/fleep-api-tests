import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Mel Gibson',
    'Don Johnson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('managed conversation and free team', function () {
    let client = UC.bob;
    let conv_topic = 'managedConv';
    let team_name = 'freeTeam';
    let org_name = 'organisationName';

    return thenSequence([

        // create org and add don
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.don.account_id]}),

        // create free team and add meg
        () => UC.don.api_call("api/team/create", {team_name: team_name}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => UC.don.api_call("api/team/configure/" + UC.don.getTeamId(team_name), {
            add_account_ids: [UC.meg.account_id]}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // create managed conversation
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            team_ids: [UC.don.getTeamId(team_name)],
            is_managed: true}),

        // add Mel into free team
        () => UC.don.api_call("api/team/configure/" + UC.don.getTeamId(team_name), {
            add_account_ids: [UC.mel.account_id]}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // sync conversation
        () => client.api_call("api/business/sync_conversations/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual({})
    ]);
});