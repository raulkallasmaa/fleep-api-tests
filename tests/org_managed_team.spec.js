import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Bob Geldof',
    'Charlie Chaplin',
    'Don Johnson',
    'John Hurt',
    'Mel Gibson',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('create org and create team and then manage team', function () {
    let client = UC.charlie;
    let conv_topic = 'four-org-conv-topic';
    let org_name = 'four-org-name';
    let org_team = 'four-org-team-name';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create team
        () => client.api_call("api/team/create", {
            team_name: org_team,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: org_team}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),

        // turn conversation to managed
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true }),
        (res) => expect(res.header).toMatchObject({
            organisation_id: client.getOrgId(org_name),
            is_managed: true, }),

        // turn team into managed team
        () => client.api_call("api/team/configure/" + client.getTeamId(org_team), {
            is_managed: true }),
        () => client.getTeam(org_team),
        (team) => expect(team).toMatchObject({
            organisation_id: client.getOrgId(org_name),
            is_managed: true, }),

        // close org
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),

	// check that conv is back to unmanaged
        () => client.poll_filter({mk_rec_type: 'message', mk_message_type: 'unmanage'}),
        () => client.matchStream({mk_rec_type: 'message', mk_message_type: 'unmanage'}),
        (msg) => expect(msg.mk_message_type).toEqual('unmanage'),

        () => client.getConv(conv_topic),
        (conv) => expect(conv).toMatchObject({organisation_id: null, is_managed: false, }),

        // check that team is back to unmanaged
        () => client.getTeam(org_team),
        (team) => expect(team).toMatchObject({organisation_id: null, is_managed: false, }),
    ]);
});

