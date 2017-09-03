import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Jon Lajoie',
    'Charlie Chaplin',
    'Don Johnson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('free conversation with team', function () {
    let client = UC.bob;
    let conv_topic = 'freeConv';
    let team_name = 'regularTeam';

    return thenSequence([
        // create free conversation
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.charlie.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // create team and add don and jon
        () => client.api_call("api/team/create", {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {
            add_account_ids: [UC.don.account_id, UC.jon.account_id]}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // charlie tries to add team to conv
        () => UC.charlie.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Must be member or team admin!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // don tries to add team to conv
        () => UC.don.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Member or conversation not found!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // charlie tries to remove team from conv
        () => UC.charlie.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            remove_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Must be member or team admin!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // jon tries to remove team from conv
        () => UC.jon.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            remove_team_ids: [client.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Member or conversation not found!')),
                (r) => expect(r.statusCode).toEqual(431)),
    ]);
});
