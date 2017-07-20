import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let sync_changelog = {
   "stream": [{
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "topic": "managedConvTopic",
   },
   "event_time": "...",
   "event_type": "chat.delete_conversation_by_admin",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 3,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "member_ids": [
   "<account:Charlie Chaplin>",
   ],
   "topic": "managedConvTopic",
   },
   "event_time": "...",
   "event_type": "chat.create_conversation",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 2,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "organisation_name": "managedConvOrgName",
   },
   "event_time": "...",
   "event_type": "create_org",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 1,
   }],
};

let del_message = {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "inbox_nr": 1,
   "message": {
   "members": [
   "<account:Charlie Chaplin>",
   ],
   "org_name": "managedConvOrgName",
   "organisation_id": "<org:managedConvOrgName>",
   "sysmsg_text": "An administrator of {org_name} has deleted this conversation and its content.",
   },
   "message_nr": 4,
   "mk_message_type": "deleteV1",
   "mk_rec_type": "message",
   "posted_time": "...",
   "prev_message_nr": 3,
   "profile_id": "<account:Charlie Chaplin>",
   "tags": [],
};

test('create org and create managed conv with team in it and then delete by admin', function () {
    let client = UC.charlie;
    let conv_topic = 'managedConvTopic';
    let org_name = 'managedConvOrgName';
    let org_team = 'managedConvTeamName';

    return thenSequence([
        // create team
        () => client.api_call("api/team/create", {
            team_name: org_team,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: org_team}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        // create managed conv with team
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            team_ids: [client.getTeamId(org_team)], }),
        (res) => res['stream'][0]['conversation_id'],
        (conv_id) => client.poke(conv_id, true),
        // delete conversation by admins
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            is_deleted_by_admin: true, }),
        // see changelog
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog),
        // see system message
        () => client.matchStream({mk_rec_type: 'message', mk_message_type: 'deleteV1'}),
        (res) => expect(UC.clean(res)).toEqual(del_message),
    ]);
});