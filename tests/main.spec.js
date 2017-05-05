import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.setup());

describe('test account setup', () => {
    it('should login',
        () => UC.alice.login()
            .then((res) => {
                expect(res.display_name).toEqual("Alice Adamson");
            }));
    it('should sync alice contacts',
        () => UC.alice.api_call("api/contact/sync/all")
            .then((res) => {
                let xres = UC.clean(res);
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "organisation_id": null,
                        "sort_rank": "..."
                    }]
                });
            }));
    it('should sync bob contacts',
        () => UC.bob.api_call("api/contact/sync/all")
            .then((res) => {
                let xres = UC.clean(res);
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "organisation_id": null,
                        "sort_rank": "..."
                    }]
                });
            }));
    it('should sync charlie contacts',
        () => UC.charlie.api_call("api/contact/sync/all")
            .then((res) => {
                let xres = UC.clean(res);
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "organisation_id": null,
                        "sort_rank": "..."
                    }]
                });
            }));
});

describe('initial poll', () => {
    it('should poll',
        () => UC.charlie.initial_poll()
            .then((res) => {
                let xres = UC.clean(res, {
                    event_horizon: null,
                    static_version: null,
                });
                xres.stream = [];
                expect(xres).toEqual({
                    "event_horizon": "...",
                    "limit_time": 0,
                    "static_version": "...",
                    "stream": []
                });
            }));
});

describe('create new conversation', () => {
    it('should create new conversation',
        () => UC.alice.api_call("api/conversation/create", {topic: 'test'})
            .then((res) => {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "header": {
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
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "leavers": [],
                        "members": ["<account:Alice Adamson>"],
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_init_mode": "ic_full",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "test",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }
                });
            })
    );
});

describe('', () => {
    it('should send message to flow',
        () => UC.alice.api_call("api/conversation/create", {topic: 'hello'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello'}))
            .then((res) => {
                let xres = UC.clean(res, {result_message_nr: null});
                xres.stream = [];
                expect(xres).toEqual({
                    "stream": [],
                    "result_message_nr": '...',
                    "header": {
                        "admins": [],
                        "can_post": true,
                        "conversation_id": "<conv:hello>",
                        "creator_id": "<account:Alice Adamson>",
                        "export_files": [],
                        "export_progress": "1",
                        "has_email_subject": false,
                        "has_pinboard": false,
                        "has_task_archive": false,
                        "has_taskboard": false,
                        "inbox_message_nr": 2,
                        "inbox_time": "...",
                        "is_automute": false,
                        "is_list": false,
                        "is_managed": false,
                        "is_mark_unread": false,
                        "is_premium": false,
                        "join_message_nr": 1,
                        "label_ids": [],
                        "last_inbox_nr": 1,
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "hello",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }


                });
            })
    );
});

describe('', () => {
    it('should add members to conversation',
        () => UC.alice.api_call("api/conversation/create", {topic: 'members'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('members');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/conversation/add_members/" + conversation_id, {emails: 'UC.Bob.email'})
            )
            .then((res) => {
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
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "members",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    },

                });
            })
    )
    ;
})
;

describe('', () => {
    it('should set conversation topic',
        () => UC.alice.api_call("api/conversation/create", {topic: 'hey'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hey');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/conversation/set_topic/" + conversation_id, {topic: 'testing'})
            )
            .then((res) => {
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
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "leavers": [],
                        "members": ["<account:Alice Adamson>"],
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "testing",
                        "topic_message_nr": 2,
                        "unread_count": 0,
                    },

                });
            })
    )
    ;
})
;

describe('', () => {
    it('should remove members from conversation',
        () => UC.alice.api_call("api/conversation/create", {topic: 'test'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('test');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/conversation/add_members/" + conversation_id, {emails: 'UC.Bob.email'})
            )
            .then((res) => {
                UC.clean(res, {});
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/conversation/remove_members/" + conversation_id, {emails: 'UC.Bob.email'})
            )
            .then((res) => {
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
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "test",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }
                });
            })
    )
    ;
})
;

describe('', () => {
    it('should leave the conversation',
        () => UC.alice.api_call("api/conversation/create", {topic: 'test'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('test');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/conversation/leave/" + conversation_id, {})
            )
            .then((res) => {
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
                        "last_message_nr": '...',
                        "last_message_time": "...",
                        "leavers": ["<account:Alice Adamson>"],
                        "members": [],
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:Alice Adamson>",
                        "read_message_nr": '...',
                        "send_message_nr": '...',
                        "show_message_nr": '...',
                        "snooze_interval": 0,
                        "snooze_time": 0,
                        "teams": [],
                        "topic": "test",
                        "topic_message_nr": 1,
                        "unread_count": 0,
                    }
                });


            })
    );
})
;
