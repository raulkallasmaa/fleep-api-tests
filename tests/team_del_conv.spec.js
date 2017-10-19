import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let client_sync_convs_first = {
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
   "autojoin_url": "<autojoin:teamsDelConvTopicOne>",
   "begin_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:teamsDelConvTopicOne>",
   "conversation_id": "<conv:teamsDelConvTopicOne>",
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
   "is_full": true,
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
   "topic": "teamsDelConvTopicOne",
   "topic_message_nr": 1,
   "unread_count": 0,
   },
   {
   "admins": [
       "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:teamsDelConvTopicToo>",
   "begin_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:teamsDelConvTopicToo>",
   "conversation_id": "<conv:teamsDelConvTopicToo>",
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
   "is_full": true,
   "is_init": true,
   "is_list": false,
   "is_managed": true,
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
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_header",
   "mk_rec_type": "conv",
   "organisation_id": "<org:teamsDelConvOrgName>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 2,
   "send_message_nr": 1,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsDelConvTopicToo",
   "topic_message_nr": 1,
   "unread_count": 0,
   }],
};

let bobs_team_label_cons = {
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
   "autojoin_url": "<autojoin:teamsDelConvTopicOne>",
   "begin_message_nr": 2,
   "can_post": true,
   "cmail": "<cmail:teamsDelConvTopicOne>",
   "conversation_id": "<conv:teamsDelConvTopicOne>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_full": true,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 2,
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
   "profile_id": "<account:Bob Dylan>",
   "read_message_nr": 1,
   "send_message_nr": 2,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsDelConvTopicOne",
   "topic_message_nr": 1,
   "unread_count": 0,
   },
   {
   "admins": [
        "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:teamsDelConvTopicToo>",
   "begin_message_nr": 2,
   "can_post": true,
   "cmail": "<cmail:teamsDelConvTopicToo>",
   "conversation_id": "<conv:teamsDelConvTopicToo>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_full": true,
   "is_init": true,
   "is_list": false,
   "is_managed": true,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 2,
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
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_header",
   "mk_rec_type": "conv",
   "organisation_id": "<org:teamsDelConvOrgName>",
   "profile_id": "<account:Bob Dylan>",
   "read_message_nr": 1,
   "send_message_nr": 2,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsDelConvTopicToo",
   "topic_message_nr": 1,
   "unread_count": 0,
   }],
};

let bobs_conv_list_after_del = {
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
   "admins": [
        "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:teamsDelConvTopicToo>",
   "begin_message_nr": 2,
   "can_post": true,
   "cmail": "<cmail:teamsDelConvTopicToo>",
   "conversation_id": "<conv:teamsDelConvTopicToo>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_full": true,
   "is_init": true,
   "is_list": false,
   "is_managed": true,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 2,
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
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_header",
   "mk_rec_type": "conv",
   "organisation_id": "<org:teamsDelConvOrgName>",
   "profile_id": "<account:Bob Dylan>",
   "read_message_nr": 1,
   "send_message_nr": 2,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsDelConvTopicToo",
   "topic_message_nr": 1,
   "unread_count": 0,
   }],
};

test('team: add and remove conversations', function () {
    let client = UC.charlie;
    let convTopic = 'teamsDelConvTopicOne';
    let convTopic2 = 'teamsDelConvTopicToo';
    let teamName = 'Performers';
    let orgName = 'teamsDelConvOrgName';
    return thenSequence([
        // create first conversation
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        // create team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                conversations: [client.getConvId(convTopic)],
                account_ids: [UC.bob.account_id, UC.don.account_id],
                is_managed: true, }),
        () => client.poll_filter({mk_rec_type: 'team', team_name: teamName}),
        // create second conv
        () => client.api_call("api/conversation/create", {
                topic: convTopic2,
                team_ids: [client.getTeamId(teamName)], }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic2}),

        // check whats in conversation list for label
        () => client.matchStream({mk_rec_type: 'label', label: teamName}),
        (team_label) => client.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(client_sync_convs_first),

        // start with Bob
        () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: convTopic2}),
        () => UC.bob.poke(client.getConvId(convTopic2), true),

        // check whats in Bob's conversation list for label
        () => UC.bob.matchStream({mk_rec_type: 'label', label: teamName}),
        (team_label) => UC.bob.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(bobs_team_label_cons),

        // Delete from Bob's conversation list
        () => UC.bob.api_call('api/conversation/store/' + UC.bob.getConvId(convTopic), {
            is_deleted: true, }),
        () => UC.bob.poll_filter({mk_rec_type: 'conv',
            conversation_id: UC.bob.getConvId(convTopic), is_deleted: true}),

        // check whats in Bob's conversation list for label
        () => UC.bob.matchStream({mk_rec_type: 'label', label: teamName}),
        (team_label) => UC.bob.api_call("api/label/sync_conversations/", {
            label_id: team_label.label_id,
            mk_init_mode: 'ic_header', }),
        (res) => expect(UC.clean(res)).toEqual(bobs_conv_list_after_del),
    ]);
});
