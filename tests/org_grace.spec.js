import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Mel Gibson',
    'Charlie Chaplin',
    'Don Johnson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let changelog_before_timetravel = {
    "stream":[{
    "account_id": "<account:Bob Marley>",
        "event_data": {
        "account_id": "<account:Bob Marley>",
            "conversation_ids": [
            "<conv:organisationGrace>",
            ],
            "team_id": "<team:teamName>",
            "team_name": "teamName",
    },
    "event_time": "...",
        "event_type": "team.add_conversations",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 4,
},
{
    "account_id": "<account:Bob Marley>",
        "event_data": {
        "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:organisationGrace>",
            "email_members": [],
            "fleep_members": [
            "<account:Bob Marley>",
            ],
            "topic": "organisationGrace",
    },
    "event_time": "...",
        "event_type": "chat.create_conversation",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 3,
},
{
    "account_id": "<account:Bob Marley>",
        "event_data": {
        "account_id": "<account:Bob Marley>",
            "conversation_ids": null,
            "is_autojoin": false,
            "member_ids": [
            "<account:Bob Marley>",
                "<account:Mel Gibson>",
            ],
            "team_id": "<team:teamName>",
            "team_name": "teamName",
    },
    "event_time": "...",
        "event_type": "team.create",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 2,
},
{
    "account_id": "<account:Bob Marley>",
        "event_data": {
        "account_id": "<account:Bob Marley>",
            "organisation_name": "organisationName",
    },
    "event_time": "...",
        "event_type": "create_org",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 1,
}]
};

let changelog_after_timetravel = {
    "event_horizon": 30,
    "limit_time": 0,
    "static_version": "...",
    "stream": [{
        "grace_time": "...",
        "is_member": false,
        "mk_rec_type": "org_header",
        "organisation_founder_id": "<account:Bob Marley>",
        "organisation_id": "<org:organisationName>",
        "organisation_name": "organisationName",
        "status": "bos_closed",
        "trial_time": "...",
        "version_nr": 9,
},
{
    "account_id": "<account:Bob Marley>",
        "activated_time": "...",
        "client_flags": [
        "emoticons_old",
            "show_onboarding",
        ],
        "connected_email": "",
        "dialog_id": null,
        "display_name": "Bob Marley",
        "email": "<email:Bob Marley>",
        "export_files": [],
        "export_progress": "1",
        "fleep_address": "<fladdr:Bob Marley>",
        "fleep_autogen": "<flautogen:Bob Marley>",
        "has_password": true,
        "is_automute_enabled": true,
        "is_hidden_for_add": true,
        "is_premium": false,
        "mk_account_status": "active",
        "mk_email_interval": "never",
        "mk_rec_type": "contact",
        "organisation_id": null,
        "trial_end_time": "...",
},
{
    "admins": [],
        "autojoin_url": "<autojoin:teamName>",
        "is_autojoin": false,
        "is_deleted": false,
        "is_managed": false,
        "is_tiny": false,
        "members": [
        "<account:Bob Marley>",
            "<account:Mel Gibson>",
        ],
        "mk_rec_type": "team",
        "mk_sync_mode": "tsm_full",
        "organisation_id": null,
        "team_id": "<team:teamName>",
        "team_name": "teamName",
        "team_version_nr": 3,
},
{
    "index": "...",
        "is_in_muted": true,
        "is_in_recent": true,
        "is_on_left_pane": false,
        "label": "teamName",
        "label_id": "<label:teamName>",
        "mk_label_status": "active",
        "mk_label_subtype": "team_label",
        "mk_label_type": "system_label",
        "mk_rec_type": "label",
        "team_id": "<team:teamName>",
},
{
    "admins": [],
        "can_post": true,
        "conversation_id": "<conv:organisationGrace>",
        "creator_id": "<account:Bob Marley>",
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
        "is_list": false,
        "is_managed": false,
        "is_mark_unread": false,
        "is_premium": false,
        "join_message_nr": 1,
        "label_ids": [
        "<label:teamName>",
        ],
        "last_inbox_nr": 0,
        "last_message_nr": 4,
        "last_message_time": "...",
        "leavers": [],
        "members": [
        "<account:Bob Marley>",
            "<account:Mel Gibson>",
        ],
        "mk_alert_level": "default",
        "mk_conv_type": "cct_no_mail",
        "mk_rec_type": "conv",
        "organisation_id": null,
        "profile_id": "<account:Bob Marley>",
        "read_message_nr": 3,
        "send_message_nr": 1,
        "show_message_nr": 4,
        "snooze_interval": 0,
        "snooze_time": 0,
        "teams": [
        "<team:teamName>",
        ],
        "topic": "organisationGrace",
        "topic_message_nr": 1,
        "unread_count": 0,
},
{
    "account_id": "<account:Fleep Support>",
        "conversation_id": "<conv:organisationGrace>",
        "inbox_nr": 0,
        "message":  {
        "organisation_id": "<org:organisationName>",
            "sysmsg_text": "{author} disabled admin control, all members can change conversation settings.",
    },
    "message_nr": 4,
        "mk_message_type": "unmanage",
        "mk_rec_type": "message",
        "posted_time": "...",
        "prev_message_nr": 3,
        "profile_id": "<account:Bob Marley>",
        "tags": [],
},
{
    "account_id": "<account:Fleep Support>",
        "conversation_id": "<conv:organisationGrace>",
        "mk_rec_type": "activity",
},
{
    "account_id": "<account:Bob Marley>",
        "conversation_id": "<conv:organisationGrace>",
        "message_nr": '...',
        "mk_rec_type": "poke",
}]
};

describe('end grace period', function () {
it('should delete org (unmanage conv and team) after grace period ends', function () {
   let client = UC.bob;
   let conv_topic = 'organisationGrace';
   let team_name = 'teamName';
   let org_name = 'organisationName';
   return thenSequence([

       // create org
       () => client.api_call("api/business/create", {organisation_name: org_name}),
       () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

       // create managed team
       () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
           team_name: team_name,
           account_ids: [UC.mel.account_id],
           is_managed: true}),
       () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),

       // create managed conversation
       () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
           topic: conv_topic,
           is_managed: true,
           team_ids: [client.getTeamId(team_name)]}),
       () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
       () => client.poke(client.getConvId(conv_topic), true),

       // sync changelog after managed conversation
       () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name), {}),
       (res) => expect(UC.clean(res)).toEqual(changelog_before_timetravel),

       // start grace period and look for email
       () => UC.sysclient.sys_call("sys/business/start_grace_period", {
           organisation_id: client.getOrgId(org_name),
       }),
       () => client.waitMail({
           subject: /Payment failed/,
           body: /next 30 days/,
       }),

       // time travel 20 days and look for email
       () => UC.sysclient.sys_call("sys/shard/time_travel", {
           object_id: client.getOrgId(org_name),
           mk_time_action: 'bbg_grace_notif',
           time_interval: '20 days',
       }),
       () => client.waitMail({
           subject: /Payment failure/,
           body: /next 10 days/,
       }),

       // time travel for 29 days and look for email
       () => UC.sysclient.sys_call("sys/shard/time_travel", {
           object_id: client.getOrgId(org_name),
           mk_time_action: 'bbg_grace_warn',
           time_interval: '29 days',
       }),
       () => client.waitMail({
           subject: /Payment failure/,
           body: /tomorrow/,
       }),

       // time travel for 30 days and look for email
       () => UC.sysclient.sys_call("sys/shard/time_travel", {
           object_id: client.getOrgId(org_name),
           mk_time_action: 'bbg_grace_end',
           time_interval: '30 days',
       }),
       () => client.waitMail({
           subject: /Subscription cancelled/,
           body: /has been cancelled/,
       }),
       () => client.poke(client.getConvId(conv_topic), true),
       (res) => expect(UC.clean(res, {static_version: null})).toEqual(changelog_after_timetravel),
   ]);
});
});
