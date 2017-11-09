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
      "conversation_id": "<conv:freeConvTeamInactive>",
      "export_files": [],
      "export_progress": "1",
      "has_pinboard": false,
      "has_task_archive": false,
      "has_taskboard": false,
      "inactives": [
        "<account:Bob Marley>",
      ],
      "inbox_message_nr": 5,
      "inbox_time": "...",
      "is_automute": false,
      "is_list": false,
      "is_mark_unread": false,
      "join_message_nr": 1,
      "label_ids": [
        "<label:InactiveTeam>",
      ],
      "last_inbox_nr": 3,
      "last_message_nr": 5,
      "last_message_time": "...",
      "mk_alert_level": "inactive",
      "mk_rec_type": "conv",
      "profile_id": "<account:Bob Marley>",
      "read_message_nr": 5,
      "send_message_nr": 1,
      "show_message_nr": 5,
      "snooze_interval": -3,
      "snooze_time": 0,
      "teams": [
        "<team:InactiveTeam>",
      ],
      "unread_count": 0,
    },
    "stream": [],
};

let conv_after_store2 = {
    "header": {
      "conversation_id": "<conv:freeConvTeamInactive>",
      "export_files": [],
      "export_progress": "1",
      "has_pinboard": false,
      "has_task_archive": false,
      "has_taskboard": false,
      "inactives": [],
      "inbox_message_nr": 5,
      "inbox_time": "...",
      "is_automute": false,
      "is_list": false,
      "is_mark_unread": false,
      "join_message_nr": 1,
      "label_ids": [
        "<label:InactiveTeam>",
      ],
      "last_inbox_nr": 3,
      "last_message_nr": 5,
      "last_message_time": "...",
      "mk_alert_level": "default",
      "mk_rec_type": "conv",
      "profile_id": "<account:Bob Marley>",
      "read_message_nr": 5,
      "send_message_nr": 5,
      "show_message_nr": 5,
      "snooze_interval": 0,
      "snooze_time": 0,
      "teams": [
        "<team:InactiveTeam>",
      ],
      "unread_count": 0,
    },
    "stream": [],
};


test('set conversation inactive/active', function () {
    let client = UC.bob;
    let teamName = 'InactiveTeam';
    let convTopic = 'freeConvTeamInactive';

    return thenSequence([
        // create free conv
        () => client.api_call("api/team/create", {
                team_name: teamName,
                account_ids: [UC.meg.account_id, UC.jil.account_id], }),
        () => client.api_call("api/conversation/create", {
                topic: convTopic,
                account_ids: [UC.don.account_id],
                team_ids: [client.getTeamId(teamName)], }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
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
        // add don to the free conv
        () => client.api_call("api/conversation/store/" + client.getConvId(convTopic), {
            mk_alert_level: 'inactive',
        }),
        (res) => expect(UC.clean(res)).toMatchObject(conv_after_store),
        // add don to the free conv
        () => client.api_call("api/conversation/store/" + client.getConvId(convTopic), {
            mk_alert_level: 'default',
        }),
        (res) => expect(UC.clean(res)).toMatchObject(conv_after_store2),
    ]);
});
