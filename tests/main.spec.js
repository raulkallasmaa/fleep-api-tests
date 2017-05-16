import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('create new conversation', function () {
    it('should create new conversation', function () {
        let client = UC.alice;
        return thenSequence([
            () => client.api_call("api/conversation/create", {topic: 'test'}),
            (res) => expect(UC.clean(res, {}).header).toEqual({
                    "admins": [],
                    "autojoin_url": "<autojoin:test>",
                    "begin_message_nr": 1,
                    "bw_message_nr": 1,
                    "can_post": true,
                    "cmail": "<cmail:test>",
                    "conversation_id": "<conv:test>",
                    "creator_id": "<account:Alice Adamson>",
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
                    "members": ["<account:Alice Adamson>"],
                    "mk_alert_level": "default",
                    "mk_conv_type": "cct_default",
                    "mk_init_mode": "ic_full",
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
            }),
        ]);
    });
});

describe('message send', function () {
    it('should send message to flow', function () {
        return UC.alice.api_call("api/conversation/create", {
                topic: 'hello',
                account_ids: [UC.bob.info.account_id, UC.charlie.info.account_id],
            })
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello');
                expect(res.header.members.length).toEqual(3);
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello'});
            })
            .then(function (res) {
                let xres = UC.clean(res, {result_message_nr: null});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "result_message_nr": '...',
                    "header": {
                        "conversation_id": "<conv:hello>",
                        "export_files": [],
                        "export_progress": "1",
                        "has_pinboard": false,
                        "has_task_archive": false,
                        "has_taskboard": false,
                        "inbox_message_nr": 2,
                        "inbox_time": "...",
                        "is_automute": false,
                        "is_list": true,
                        "is_mark_unread": false,
                        "join_message_nr": 1,
                        "label_ids": [],
                        "last_inbox_nr": 1,
                        "last_message_nr": 2,
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_rec_type": "conv",
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": 2,
                        "send_message_nr": 1,
                        "show_message_nr": 2,
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "unread_count": 0,
                    }
                });
            });
    });
});

describe('topic', function () {
    it('should set conversation topic', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'hey'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hey');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/set_topic/" + conversation_id, {topic: 'testing'});
            })
            .then(function (res) {
                let xres = UC.clean(res, {result_message_nr: null});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "result_message_nr": '...',
                    "header": {
                        "admins": [],
                        "can_post": true,
                        "conversation_id": "<conv:hey>",
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
                        "leavers": [],
                        "members": ["<account:Alice Adamson>"],
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
                        "topic": "testing",
                        "topic_message_nr": 2,
                        "unread_count": 0,
                    },
                });
            });
    });
});

