import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let bob_team_label_sync = {
   "stream": [
     {
       "index": "...",
       "is_in_muted": true,
       "is_in_recent": true,
       "is_on_left_pane": true,
       "label_id": "<label:Performers>",
       "mk_label_status": "removed",
       "mk_label_subtype": "user",
       "mk_label_type": "user_label",
       "mk_rec_type": "label",
       "sync_cursor": "{}",
       "sync_inbox_time": 0,
     },
   ],
};

test('team: add and remove conversations', function () {
    let client = UC.charlie;
    let convTopic = 'teamsDelConvTestTopic';
    let convTopic2 = 'teamsDelConvTopicToo';
    let teamName = 'Performers';
    let orgName = 'teamsDelConvTestOrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        (res) => expect(res.header.topic).toEqual(convTopic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/business/create", {organisation_name: orgName}),
	// create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                conversations: [client.getConvId(convTopic)],
                account_ids: [UC.bob.account_id, UC.don.account_id],
                is_managed: true, }),
        () => client.api_call("api/message/store/" + client.getConvId(convTopic), {
                message: 'message1', }),
        // create another team
        () => client.api_call("api/conversation/create", {
                topic: convTopic2,
                team_ids: [client.getTeamId(teamName)], }),
        () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: convTopic2}),

        // Delete from Charlie's conversation list
        () => UC.bob.api_call('api/conversation/store/' + client.getConvId(convTopic), {
            is_deleted: true, }),
        (res) => expect(UC.clean(res.header)).toMatchObject({
            "is_deleted": true,
	}),

        // let delete be synced into account schema
        () => client.poke(client.getConvId(convTopic2), true),

        () => client.matchStream({mk_rec_type: 'label', team_id: UC.bob.getTeamId(teamName)}),
        (team_label) => UC.bob.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(bob_team_label_sync),

        // remove conversation from team conversations
        () => client.api_call("api/team/configure/" + client.getTeamId(teamName), {
            remove_account_ids: [UC.bob.account_id], }),

	// let bg_worker remove bob from conversations
        () => client.poke(client.getConvId(convTopic), true),
        () => expect(UC.clean(client.getConv(convTopic))).toMatchObject({
            "leavers": [
                "<account:Bob Dylan>",
            ], }),

        // remove conversation from team conversations
        () => client.api_call("api/team/configure/" + client.getTeamId(teamName), {
            remove_conversations: [client.getConvId(convTopic)], }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
    ]);
});
