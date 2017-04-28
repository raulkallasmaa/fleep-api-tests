import {UserCache} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
beforeAll(() => UC.setup());

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
                        "account_id": "",
                        "admins": [],
                        "autojoin_url": "<autojoin:test>",
                        "begin_message_nr": 1,
                        "bw_message_nr": 1,
                        "can_post": true,
                        "cmail": "<cmail:test>",
                        "conversation_id": "<conv:test>",
                        "creator_id": "<account:alice>",
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
                        "members": ["<account:alice>"],
                        "mk_alert_level": "default",
                        "mk_conv_type": "cct_default",
                        "mk_init_mode": "ic_full",
                        "mk_rec_type": "conv",
                        "organisation_id": null,
                        "profile_id": "<account:alice>",
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
})
    );
});
