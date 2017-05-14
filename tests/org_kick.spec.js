import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

let UC = new UserCache([
    'Bob Geldof',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let sx_managed_team = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-team-name>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:five-org-name>",
   "team_id": "<team:five-org-team-name>",
   "team_name": "five-org-team-name",
   "team_version_nr": 2,
};

let sx_managed_conv_one = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "can_post": true,
   "conversation_id": "<conv:five-org-conv-topic>",
   "creator_id": "<account:Charlie Chaplin>",
   "export_files": [],
   "export_progress": "1",
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": true,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:five-org-team-name>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 4,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": "<org:five-org-name>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:five-org-team-name>",
   ],
   "topic": "five-org-conv-topic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let sx_managed_conv_two = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:six-topix>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:six-topix>",
   "conversation_id": "<conv:six-topix>",
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
   "is_list": true,
   "is_managed": true,
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
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": "<org:five-org-name>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 1,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "six-topix",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let sx_managed_team_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-team-name>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:five-org-name>",
   "team_id": "<team:five-org-team-name>",
   "team_name": "five-org-team-name",
   "team_version_nr": 3,
};

let sx_managed_conv_one_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "can_post": true,
   "conversation_id": "<conv:five-org-conv-topic>",
   "creator_id": "<account:Charlie Chaplin>",
   "export_files": [],
   "export_progress": "1",
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": true,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:five-org-team-name>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 5,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": "<org:five-org-name>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 5,
   "send_message_nr": 1,
   "show_message_nr": 5,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:five-org-team-name>",
   ],
   "topic": "five-org-conv-topic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let sx_managed_conv_two_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "can_post": true,
   "conversation_id": "<conv:six-topix>",
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
   "is_list": true,
   "is_managed": true,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 0,
   "last_message_nr": 2,
   "last_message_time": "...",
   "leavers": [
     "<account:Mel Gibson>",
   ],
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_conv_type": "cct_list",
   "mk_rec_type": "conv",
   "organisation_id": "<org:five-org-name>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 2,
   "send_message_nr": 1,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "six-topix",
   "topic_message_nr": 1,
   "unread_count": 0,
};

test('create org and create team and then kick member from all', function () {
    let client = UC.charlie;
    let conv_topic = 'five-org-conv-topic';
    let six_topix = 'six-topix';
    let org_name = 'five-org-name';
    let org_team = 'five-org-team-name';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.mel.account_id, UC.don.account_id]}),
        // get mel into org
        () => UC.mel.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.mel.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),

        // create managed team and two conversations
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: org_team, account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true, add_team_ids: [client.getTeamId(org_team)]}),
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: six_topix, account_ids: [UC.mel.account_id, UC.don.account_id]}),

	// poll and poke to get cache in sync
        () => client.poll_filter({mk_rec_type: 'conv', topic: six_topix}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(six_topix), true),

        // check the results
        () => client.getTeam(org_team),
        (team) => expect(UC.clean(team)).toEqual(sx_managed_team),
        () => client.getConv(conv_topic),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_one),
        () => client.getConv(six_topix),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_two),

        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            kick_account_ids: [UC.mel.account_id]}),

	// let all backend stuff to complete
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(six_topix), true),

	// check results after kick
        () => client.getTeam(org_team),
        (team) => expect(UC.clean(team)).toEqual(sx_managed_team_after_kick),
        () => client.getConv(conv_topic),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_one_after_kick),
        () => client.getConv(six_topix),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_two_after_kick),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
    ]);
});
