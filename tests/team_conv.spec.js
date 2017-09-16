import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let conv_after_create = {
   "admins": [],
   "autojoin_url": "<autojoin:teamsConvTestTopic2>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:teamsConvTestTopic2>",
   "conversation_id": "<conv:teamsConvTestTopic2>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 1,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 0,
   "last_message_nr": 1,
   "last_message_time": "...",
   "leavers": [],
   "members": [
   "<account:Charlie Chaplin>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 1,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "teamsConvTestTopic2",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let conv_after_team_add = {
   "label_ids": [
   "<label:Performers>",
   ],
   "last_message_nr": 2,
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   ],
   "read_message_nr": 2,
   "teams": [
   "<team:Performers>",
   ],
};

let team_label_sync = {
   "stream": [{
   "index": "...",
   "is_in_muted": true,
   "is_in_recent": true,
   "is_on_left_pane": false,
   "label": "Performers",
   "label_id": "<label:Performers>",
   "mk_label_status": "active",
   "mk_label_subtype": "team_label",
   "mk_label_type": "system_label",
   "mk_rec_type": "label",
   "sync_cursor": "{}",
   "sync_inbox_time": 0,
   "team_id": "<team:Performers>",
   },
   {
   "admins": [],
   "autojoin_url": "<autojoin:teamsConvTestTopic2>",
   "begin_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:teamsConvTestTopic2>",
   "conversation_id": "<conv:teamsConvTestTopic2>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [
   "<label:Performers>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 2,
   "last_message_time": "...",
   "leavers": [],
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_header",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 2,
   "send_message_nr": 1,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsConvTestTopic2",
   "topic_message_nr": 1,
   "unread_count": 0,
   }],
};

let add_team_msg = {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:teamsConvTestTopic2>",
   "inbox_nr": 0,
   "lock_account_id": null,
   "message": {
   "members": [
   "<account:Bob Dylan>",
   "<account:Don Johnson>",
   ],
   "sysmsg_text": "{author} added {members} using {team_name}",
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   },
   "message_nr": 2,
   "mk_message_state": "urn:fleep:message:mk_message_state:system",
   "mk_message_type": "add_teamV2",
   "mk_rec_type": "message",
   "posted_time": "...",
   "prev_message_nr": 1,
   "profile_id": "<account:Charlie Chaplin>",
   "tags": [],
};

let team_label_conversations_after_remove = {
   "stream": [{
   "index": "...",
   "is_in_muted": true,
   "is_in_recent": true,
   "is_on_left_pane": false,
   "label": "Performers",
   "label_id": "<label:Performers>",
   "mk_label_status": "active",
   "mk_label_subtype": "team_label",
   "mk_label_type": "system_label",
   "mk_rec_type": "label",
   "sync_cursor": "{}",
   "sync_inbox_time": 0,
   "team_id": "<team:Performers>",
   }],
};

test('team: add and remove conversations', function () {
    let client = UC.charlie;
    let convTopic = 'teamsConvTestTopic2';
    let teamName = 'Performers';
    let orgName = 'teamsConvTestTopic2OrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        (res) => expect(res.header.topic).toEqual(convTopic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        // create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                account_ids: [UC.bob.account_id, UC.don.account_id],
                is_managed: true, }),

        // initial state of the conversation
        () => expect(UC.clean(client.getConv(convTopic))).toEqual(conv_after_create),
        // add conversation to team conversations
        () => client.api_call("api/team/configure/" + client.getTeamId(teamName), {
            add_conversations: [client.getConvId(convTopic)], }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
        // conversation after team is added
        () => expect(UC.clean(client.getConv(convTopic))).toMatchObject(conv_after_team_add),
        () => client.matchStream({mk_rec_type: 'message', mk_message_type: 'add_teamV2'}),
        (msg) => expect(UC.clean(msg)).toEqual(add_team_msg),

        // check this conversation appears under label conversations
        () => client.matchStream({mk_rec_type: 'label', team_id: client.getTeamId(teamName)}),
        (team_label) => client.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(team_label_sync),

        // remove conversation from team conversations
        () => client.api_call("api/team/configure/" + client.getTeamId(teamName), {
            remove_conversations: [client.getConvId(convTopic)], }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
        () => client.poke(client.getConvId(convTopic), true),

        () => client.matchStream({mk_rec_type: 'label', team_id: client.getTeamId(teamName)}),
        (team_label) => client.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(team_label_conversations_after_remove),
    ]);
});
