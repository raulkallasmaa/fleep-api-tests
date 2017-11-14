import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('create teams with all parameters', function () {
    let client = UC.charlie;
    let convTopic = 'teamsDiffCreate';
    let teamName = 'DiffPerformers';
    let orgName = 'teamsDiffCreateOrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.initial_poll(),
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        (res) => expect(res.header.topic).toEqual(convTopic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        () => client.api_call("api/business/configure/" + client.getOrgId(orgName), {
            add_account_ids: [UC.mel.account_id, UC.don.account_id], }),
        // create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                conversations: [client.getConvId(convTopic)],
                account_ids:  [UC.bob.account_id], }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
        () => client.poke(client.getConvId(convTopic), true),
        () => client.api_call("api/business/diff_team/" + client.getOrgId(orgName), {
            team_id: client.getTeamId(teamName), }),
        // check singesrs to have three members
        (res) => expect(UC.clean(res)).toEqual({
            "add_to_org_account_ids": [
                "<account:Bob Dylan>",
            ],
            "add_to_team_account_ids": [
                "<account:Don Johnson>",
                "<account:Mel Gibson>",
            ],
        }),
    ]);
});
