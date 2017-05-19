import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename);

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

describe('member adding', function () {
    it('should add members to conversation', function () {
        let client = UC.alice;
        return thenSequence([
            () => client.api_call("api/conversation/create", {topic: 'members'}),
            (res) => expect(res.header.topic).toEqual('members'),
            () => client.poll_filter({mk_rec_type: 'conv', topic: /members/}),
            () => client.api_call("api/conversation/add_members/" + client.getConvId(/members/), {emails: UC.bob.email}),
            (res) => {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toMatchObject({
                    "stream": [],
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
                    },
                });
            }
        ]);
    });
});

describe('member removal', function () {
    test('should remove members from conversation', function () {
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
});

test('should leave the conversation', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'leaveConvo'}),
        (res) => expect(res.header.topic).toEqual('leaveConvo'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /leaveConvo/}),
        () => client.api_call("api/conversation/leave/" + client.getConvId(/leaveConvo/), {}),
        (res) => {
            let xres = UC.clean(res, {result_message_nr: null});
            xres.stream = [];
            expect(xres).toEqual({
                "stream": [],
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
                },
            });
        }
    ]);
});