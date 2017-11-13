import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let conv_after_store = {
   "header": {
     "admins": [],
     "can_post": true,
     "conversation_id": "<conv:freeConvTeamDisclose>",
     "creator_id": "<account:Bob Marley>",
     "default_members": [],
     "export_files": [],
     "export_progress": "1",
     "guests": [],
     "has_email_subject": false,
     "has_pinboard": false,
     "has_task_archive": false,
     "has_taskboard": false,
     "inbox_message_nr": 4,
     "inbox_time": "...",
     "is_automute": false,
     "is_list": false,
     "is_managed": false,
     "is_mark_unread": false,
     "is_premium": false,
     "join_message_nr": 1,
     "label_ids": [
        "<label:DiscloseTeam>",
     ],
     "last_inbox_nr": 3,
     "last_message_nr": 7,
     "last_message_time": "...",
     "leavers": [],
     "members": [
       "<account:Bob Marley>",
       "<account:Don Johnson>",
       "<account:Jil Smith>",
       "<account:Meg Griffin>",
     ],
     "mk_alert_level": "default",
     "mk_conv_type": "cct_default",
     "mk_rec_type": "conv",
     "organisation_id": null,
     "profile_id": "<account:Bob Marley>",
     "read_message_nr": 7,
     "send_message_nr": 1,
     "show_message_nr": 7,
     "snooze_interval": 0,
     "snooze_time": 0,
     "teams": [
       "<team:DiscloseTeam>",
     ],
     "topic": "freeConvTeamDisclose",
     "topic_message_nr": 1,
     "unread_count": 0,
   },
   "stream": [
     {
       "account_id": "<account:Bob Marley>",
       "conversation_id": "<conv:freeConvTeamDisclose>",
       "inbox_nr": -3,
       "lock_account_id": null,
       "message": {
         "members": [
           "<account:Don Johnson>",
         ],
       },
       "message_nr": 5,
       "mk_message_state": "urn:fleep:message:mk_message_state:system",
       "mk_message_type": "add",
       "mk_rec_type": "message",
       "posted_time": "...",
       "prev_message_nr": 4,
       "profile_id": "<account:Bob Marley>",
       "tags": [],
     },
     {
       "account_id": "<account:Bob Marley>",
       "conversation_id": "<conv:freeConvTeamDisclose>",
       "inbox_nr": -3,
       "lock_account_id": null,
       "message": {
         "members": [
           "<account:Don Johnson>",
         ],
         "sysmsg_text": "{author} disclosed previous messages to {teamsAndMembers} starting from {disclose_time}.",
         "team_ids": [
           "<team:DiscloseTeam>",
         ],
         "team_names": [
           "DiscloseTeam",
         ],
       },
       "message_nr": 7,
       "mk_message_state": "urn:fleep:message:mk_message_state:system",
       "mk_message_type": "discloseV2",
       "mk_rec_type": "message",
       "posted_time": "...",
       "prev_message_nr": 6,
       "profile_id": "<account:Bob Marley>",
       "ref_message_nr": 1,
       "tags": [],
     },
     {
       "account_id": "<account:Don Johnson>",
       "conversation_id": "<conv:freeConvTeamDisclose>",
       "join_message_nr": 1,
       "mk_rec_type": "activity",
     },
   ],
};

test('conversation disclose and disclose all in free conversation', function () {
    let client = UC.bob;
    let teamName = 'DiscloseTeam';
    let convTopic = 'freeConvTeamDisclose';

    return thenSequence([
        // create free conv
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/team/create", {
                team_name: teamName,
                account_ids: [UC.meg.account_id, UC.jil.account_id], }),
        () => client.poke(client.getConvId(convTopic)),
        // send 3 messages to conv
        () => client.api_call("api/message/store/" + client.getConvId(convTopic), {
            message: 'message1',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(convTopic), {
            message: 'message2',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(convTopic), {
            message: 'message3',
        }),
        () => client.poke(client.getConvId(convTopic), true),
        // add don to the free conv
        () => client.api_call("api/conversation/store/" + client.getConvId(convTopic), {
            add_account_ids: [UC.don.account_id],
            add_team_ids: [client.getTeamId(teamName)],
            disclose_account_ids: [UC.don.account_id],
            disclose_team_ids: [client.getTeamId(teamName)],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(conv_after_store),
    ]);
});
