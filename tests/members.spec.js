import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('member adding', function () {
    it('should add members to conversation', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'members'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('members');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {emails: 'UC.Bob.email'});
            })
            .then(function (res) {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "header": {
                        "admins": [],
                        "can_post": true,
                        "conversation_id": "<conv:members>",
                        "creator_id": "<account:Alice Adamson>",
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
                        "is_managed": false,
                        "is_mark_unread": false,
                        "is_premium": false,
                        "join_message_nr": 1,
                        "label_ids": [],
                        "last_inbox_nr": 0,
                        "last_message_nr": 1,
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": 1,
                        "send_message_nr": 1,
                        "show_message_nr": 1,
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "members",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    },
                });
            });
    });
});

describe('member removal', function () {
    it('should remove members from conversation',
        function () {
            return UC.alice.api_call("api/conversation/create", {topic: 'test'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('test');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {emails: 'UC.Bob.email'});
            })
            .then(function (res) {
                UC.clean(res, {});
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/remove_members/" + conversation_id, {emails: 'UC.Bob.email'});
            })
            .then(function (res) {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "header": {
                        "admins": [],
                        "can_post": true,
                        "conversation_id": "<conv:test>",
                        "creator_id": "<account:Alice Adamson>",
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
                        "is_managed": false,
                        "is_mark_unread": false,
                        "is_premium": false,
                        "join_message_nr": 1,
                        "label_ids": [],
                        "last_inbox_nr": 0,
                        "last_message_nr": 1,
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": 1,
                        "send_message_nr": 1,
                        "show_message_nr": 1,
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "test",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }
                });
            });
        });

    it('should leave the conversation', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'test'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('test');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/leave/" + conversation_id, {});
            })
            .then(function (res) {
                let xres = UC.clean(res, {result_message_nr: null});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "result_message_nr": '...',
                    "header": {
                        "admins": [],
                        "can_post": false,
                        "conversation_id": "<conv:test>",
                        "creator_id": "<account:Alice Adamson>",
                        "default_members": [],
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
                        "topic": "test",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }
                });
            });
    });
});
