import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let conv_after_label_sync = {
    "stream": [{
    "index": "...",
    "is_in_muted": true,
    "is_in_recent": true,
    "is_on_left_pane": true,
    "label": "frontend",
    "label_id": "<label:frontend>",
    "mk_label_status": "active",
    "mk_label_subtype": "user",
    "mk_label_type": "user_label",
    "mk_rec_type": "label",
    "sync_cursor": "{}",
    "sync_inbox_time": 0,
    },
    {
    "admins": [],
    "autojoin_url": "<autojoin:customLabels>",
    "begin_message_nr": 1,
    "bw_message_nr": 1,
    "can_post": true,
    "cmail": "<cmail:customLabels>",
    "conversation_id": "<conv:customLabels>",
    "creator_id": "<account:Bob Marley>",
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
    "is_tiny": true,
    "join_message_nr": 1,
    "label_ids": [
    "<label:backend>",
    "<label:frontend>",
    ],
    "labels": [
    "backend",
    "frontend",
    ],
    "last_inbox_nr": 0,
    "last_message_nr": 1,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Bob Marley>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_init_mode": "ic_tiny",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 1,
    "send_message_nr": 1,
    "show_message_nr": 1,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [],
    "topic": "customLabels",
    "topic_message_nr": 1,
    "unread_count": 0,
    },
    {
    "account_id": "<account:Bob Marley>",
    "conversation_id": "<conv:customLabels>",
    "inbox_nr": 0,
    "message": {
    "members": [],
    "org_name": null,
    "organisation_id": null,
    "topic": "customLabels",
    },
    "message_nr": 1,
    "mk_message_type": "create",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 0,
    "profile_id": "<account:Bob Marley>",
    "tags": [],
    }]
};

test('create custom labels for conversation, rename and remove, change index, is on left pane, is muted, is in recent', function () {
    let client = UC.bob;
    let conv_topic = 'customLabels';

    return thenSequence([
        // create conversation and add two custom labels
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {labels: ['backend', 'frontend']}),
        () => client.poke(client.getConvId(conv_topic), true),
        // sync conversation by label name and check that there are 2 labels
        () => client.api_call("api/label/sync_conversations", {label_id: client.getLabelId(/frontend/)}),
        (res) => expect(UC.clean(res)).toEqual(conv_after_label_sync),
        // add a new label called full-stack
        () => client.api_call("api/label/store", {label: 'full-stack'}),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{         "index": "...",
            "is_in_muted": true,
            "is_in_recent": true,
            "is_on_left_pane": true,
            "label": "full-stack",
            "label_id": "<label:full-stack>",
            "mk_label_status": "active",
            "mk_label_subtype": "user",
            "mk_label_type": "user_label",
            "mk_rec_type": "label",
            }]
        }),
        // rename the full-stack label to marketing
        () => client.api_call("api/label/store", {label: 'marketing', label_id: client.getLabelId(/full-stack/)}),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "index": "...",
            "is_in_muted": true,
            "is_in_recent": true,
            "is_on_left_pane": true,
            "label": "marketing",
            "label_id": "<label:full-stack>",
            "mk_label_status": "active",
            "mk_label_subtype": "user",
            "mk_label_type": "user_label",
            "mk_rec_type": "label",
            }]
        }),
        // remove label 'marketing' and check that it is removed
        () => client.api_call("api/label/store", {label: 'marketing', index: -1}),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "index": "...",
            "is_in_muted": true,
            "is_in_recent": true,
            "is_on_left_pane": true,
            "label_id": "<label:full-stack>",
            "mk_label_status": "removed",
            "mk_label_subtype": "user",
            "mk_label_type": "user_label",
            "mk_rec_type": "label",
            }]
        }),
        // changing the index of label frontend to 8
        () => client.api_call("api/label/store", {label_id: client.getLabelId(/frontend/), index: 8}),
        () => client.api_call("api/label/sync_conversations", {label_id: client.getLabelId(/frontend/)}),
        () => expect(client.getLabel(/frontend/).index).toEqual(8),
        // changing the index of label backend to 9
        () => client.api_call("api/label/store", {label_id: client.getLabelId(/backend/), index: 9}),
        () => client.api_call("api/label/sync_conversations", {label_id: client.getLabelId(/backend/)}),
        () => expect(client.getLabel(/backend/).index).toEqual(9),
        // changing is on left pane to false on label frontend
        () => client.api_call("api/label/store", {label_id: client.getLabelId(/frontend/), is_on_left_pane: false}),
        () => client.api_call("api/label/sync_conversations", {label_id: client.getLabelId(/frontend/)}),
        () => expect(client.getLabel(/frontend/).is_on_left_pane).toEqual(false),
        // changing is in muted and is in recent to false on label backend
        () => client.api_call("api/label/store", {
            label_id: client.getLabelId(/backend/),
            is_in_muted: false,
            is_in_recent: false}),
        () => client.api_call("api/label/sync_conversations", {label_id: client.getLabelId(/backend/)}),
        () => expect(client.getLabel(/backend/).is_in_muted).toEqual(false),
        () => expect(client.getLabel(/backend/).is_in_recent).toEqual(false),
        // create a new label called finance and assign it to the conversation
        () => client.api_call("api/label/store", {label: 'finance'}),
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {labels: ['finance']}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => expect(UC.clean(client.getConv(conv_topic))).toEqual({
            "admins": [],
            "can_post": true,
            "conversation_id": "<conv:customLabels>",
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
            "<label:finance>",
            ],
            "labels": [
            "finance",
            ],
            "last_inbox_nr": 0,
            "last_message_nr": 1,
            "last_message_time": "...",
            "leavers": [],
            "members": [
            "<account:Bob Marley>",
            ],
            "mk_alert_level": "default",
            "mk_conv_type": "cct_default",
            "mk_rec_type": "conv",
            "organisation_id": null,
            "profile_id": "<account:Bob Marley>",
            "read_message_nr": 1,
            "send_message_nr": 1,
            "show_message_nr": 1,
            "snooze_interval": 0,
            "snooze_time": 0,
            "teams": [],
            "topic": "customLabels",
            "topic_message_nr": 1,
            "unread_count": 0,
        })
    ]);
});