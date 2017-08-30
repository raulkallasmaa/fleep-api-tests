import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let after_bob_removed = {
    "admins": [],
    "can_post": true,
    "conversation_id": "<conv:removeMember>",
    "creator_id": "<account:Alice Adamson>",
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
    "label_ids": [],
    "last_inbox_nr": 0,
    "last_message_nr": 3,
    "last_message_time": "...",
    "leavers": [
    "<account:Bob Dylan>",
    ],
    "members": [
    "<account:Alice Adamson>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Alice Adamson>",
    "read_message_nr": 3,
    "send_message_nr": 1,
    "show_message_nr": 3,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [],
    "topic": "removeMember",
    "topic_message_nr": 2,
    "unread_count": 0,
};

test('add members to conversation', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'members'}),
        (res) => expect(res.header.topic).toEqual('members'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /members/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/members/), {emails: UC.bob.email}),
        (res) => expect(UC.clean(res)).toMatchObject({
            "stream": [{
            "account_id": "<account:Alice Adamson>",
            "conversation_id": "<conv:members>",
            "edit_account_id": "<account:Alice Adamson>",
            "edited_time": "...",
            "flow_message_nr": 2,
            "inbox_nr": 0,
            "message": {
            "members": [
            "<account:Bob Dylan>",
            ],
            "org_name": null,
            "organisation_id": null,
            "topic": "members",
            },
            "message_nr": 1,
            "mk_message_type": "create",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 0,
            "profile_id": "<account:Alice Adamson>",
            "tags": [],
            },
            {
            "account_id": "<account:Bob Dylan>",
            "conversation_id": "<conv:members>",
            "join_message_nr": 1,
            "mk_rec_type": "activity",
            },
            ],
            "header": {
            "conversation_id": "<conv:members>",
            "inbox_message_nr": 1,
            "inbox_time": "...",
            "join_message_nr": 1,
            "last_inbox_nr": 0,
            "last_message_nr": 2,
            "last_message_time": "...",
            "leavers": [],
            "members": [
            "<account:Alice Adamson>",
            "<account:Bob Dylan>",
            ],
            "mk_alert_level": "default",
            "mk_rec_type": "conv",
            "profile_id": "<account:Alice Adamson>",
            "read_message_nr": 1,
            "send_message_nr": 1,
            "show_message_nr": 1,
            "snooze_interval": 0,
            "snooze_time": 0,
            "unread_count": 0,
            }})
    ]);
});

test('remove members from conversation', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'removeMember'}),
        (res) => expect(res.header.topic).toEqual('removeMember'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /removeMember/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/removeMember/), {emails: UC.bob.email}),
        () => client.api_call("api/conversation/remove_members/" + client.getConvId(/removeMember/), {emails: UC.bob.email}),
        (res) => expect(UC.clean(res.header)).toEqual(after_bob_removed),
    ]);
});

test('should leave the conversation', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'leaveConvo'}),
        (res) => expect(res.header.topic).toEqual('leaveConvo'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /leaveConvo/}),
        () => client.api_call("api/conversation/leave/" + client.getConvId(/leaveConvo/), {}),
        (res) => expect(UC.clean(res, {result_message_nr: null})).toEqual({
                "stream": [{
                "account_id": "<account:Alice Adamson>",
                "conversation_id": "<conv:leaveConvo>",
                "inbox_nr": 0,
                "message": "",
                "message_nr": 2,
                "mk_message_state": "urn:fleep:message:mk_message_state:system",
                "mk_message_type": "leave",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 1,
                "profile_id": "<account:Alice Adamson>",
                "tags": [],
                },
                ],
                "result_message_nr": '...',
                "header": {
                "admins": [],
                "can_post": false,
                "conversation_id": "<conv:leaveConvo>",
                "creator_id": "<account:Alice Adamson>",
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
                "label_ids": [],
                "last_inbox_nr": 0,
                "last_message_nr": 2,
                "last_message_time": "...",
                "leavers": ["<account:Alice Adamson>"],
                "members": [],
                "mk_alert_level": "default",
                "mk_conv_type": "cct_default",
                "mk_rec_type": "conv",
                "organisation_id": null,
                "profile_id": "<account:Alice Adamson>",
                "read_message_nr": 2,
                "send_message_nr": 2,
                "show_message_nr": 2,
                "snooze_interval": 0,
                "snooze_time": 0,
                "teams": [],
                "topic": "leaveConvo",
                "topic_message_nr": 1,
                "unread_count": 0,
                }}),
    ]);
});
