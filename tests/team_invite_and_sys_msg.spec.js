import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy@',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let system_message = {
        "event_horizon": "...",
        "limit_time": 0,
        "static_version": "...",
        "stream": [{
        "account_id": "<account:Ron Jeremy>",
        "activity_time": "...",
        "dialog_id": null,
        "display_name": "Ron Jeremy",
        "email": "<email:Ron Jeremy>",
        "fleep_address": "<fladdr:Ron Jeremy>",
        "is_hidden_for_add": false,
        "mk_account_status": "active",
        "mk_rec_type": "contact",
        "organisation_id": null,
        "sort_rank": "...",
},
 {
    "account_id": "<account:Ron Jeremy>",

        "dialog_id": null,
        "display_name": "<email:Ron Jeremy>",
        "email": "<email:Ron Jeremy>",
        "is_hidden_for_add": true,
        "mk_account_status": "new",
        "mk_rec_type": "contact",
        "organisation_id": null,
        "sort_rank": "...",
},
 {
    "admins": [],
        "autojoin_url": "<autojoin:freeTeam>",
        "is_autojoin": false,
        "is_deleted": false,
        "is_managed": false,
        "is_tiny": false,
        "members": [
        "<account:Bob Marley>",
            "<account:Ron Jeremy>",
        ],
        "mk_rec_type": "team",
        "mk_sync_mode": "tsm_full",
        "organisation_id": null,
        "team_id": "<team:freeTeam>",
        "team_name": "freeTeam",
        "team_version_nr": 4,
},
 {
    "index": "...",
        "is_in_muted": true,
        "is_in_recent": true,
        "is_on_left_pane": false,
        "label": "freeTeam",
        "label_id": "<label:freeTeam>",
        "mk_label_status": "active",
        "mk_label_subtype": "team_label",
        "mk_label_type": "system_label",
        "mk_rec_type": "label",
        "team_id": "<team:freeTeam>",
},
 {
    "admins": [],
        "can_post": true,
        "conversation_id": "<conv:inviteToTeamViaEmail>",
        "creator_id": "<account:Bob Marley>",
        "default_members": [],
        "export_files": [],
        "export_progress": "1",
        "guests": [],
        "has_email_subject": false,
        "has_pinboard": false,
        "has_task_archive": false,
        "has_taskboard": false,
        "inbox_message_nr": 3,
        "inbox_time": "...",
        "is_automute": false,
        "is_list": false,
        "is_managed": false,
        "is_mark_unread": false,
        "is_premium": false,
        "join_message_nr": 1,
        "label_ids": [
        "<label:freeTeam>",
        ],
        "last_inbox_nr": 1,
        "last_message_nr": 5,
        "last_message_time": "...",
        "leavers": [
        "<account:Ron Jeremy>",
        ],
        "members": [
        "<account:Bob Marley>",
            "<account:Ron Jeremy>",
        ],
        "mk_alert_level": "default",
        "mk_conv_type": "cct_no_mail",
        "mk_rec_type": "conv",
        "organisation_id": null,
        "profile_id": "<account:Bob Marley>",
        "read_message_nr": 4,
        "send_message_nr": 1,
        "show_message_nr": 5,
        "snooze_interval": 0,
        "snooze_time": 0,
        "teams": [
        "<team:freeTeam>",
        ],
        "topic": "inviteToTeamViaEmail",
        "topic_message_nr": 1,
        "unread_count": 0,
},
 {
    "account_id": "<account:Ron Jeremy>",
        "conversation_id": "<conv:inviteToTeamViaEmail>",
        "inbox_nr": -1,
        "message": {
        "sysmsg_text": "{author} became a Fleep user.",
    },
    "message_nr": 5,
        "mk_message_type": "signin",
        "mk_rec_type": "message",
        "posted_time": "...",
        "prev_message_nr": 4,
        "profile_id": "<account:Bob Marley>",
        "tags": [],
},
 {
    "account_id": "<account:Ron Jeremy>",
        "conversation_id": "<conv:inviteToTeamViaEmail>",
        "join_message_nr": 4,
        "mk_rec_type": "activity",
        "read_message_nr": 5,
},
 {
    "account_id": "<account:Bob Marley>",
        "conversation_id": "<conv:inviteToTeamViaEmail>",
        "message_nr": "...",
        "mk_rec_type": "poke",
}]};

test('invite to team via email', function () {
    let client = UC.bob;
    let conv_topic = 'inviteToTeamViaEmail';
    let team_name = 'freeTeam';
    let nfid = null;

    return thenSequence([
        // bob creates team
        () => client.initial_poll(),
        () => client.api_call("api/team/create", {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // bob creates convo and adds team
        () => client.api_call("api/conversation/create", {topic: conv_topic, team_ids: [client.getTeamId(team_name)]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // do a lookup for the email contacts
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ron.email], ignore_list: []}),

        // bob invites ron to team conv via email
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {
            add_account_ids: [client.getRecord('contact', 'email', UC.ron.email).account_id]}),

        // bob sends message to team conv
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'randomMessageText'
        }),

        // ron receives the email invitation
        () => UC.ron.waitMail({
            subject: /invited you to/,
            body: /has started using Fleep messenger, and added you to/
        }),

        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },

        // prepare and confirm ron's registration and joining the team chat
        () => UC.ron.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.ron.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.ron.info.display_name,
            password: UC.ron.password,
            fleep_address: res.suggestions[0]
        }),
        () => UC.ron.login(),

        // check that correct system message is in team chat (Ron became a Fleep user.)
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.poke(client.getConvId(conv_topic), true),
        (res) => expect(UC.clean(res, {event_horizon: null, static_version: null})).toEqual(system_message)
    ]);
});