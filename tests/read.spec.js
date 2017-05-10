import {UserCache, matchStream} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice In Wonderland',
    'Bob Geldof',
    'Charlie Sheen',
]);

let alice_create_header = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
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
   "members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Alice In Wonderland>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 1,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let alice_first_header = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "export_files": [],
   "export_progress": "1",
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 4,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": true,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Alice In Wonderland>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};


let bob_first_header = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [
     "<account:Alice In Wonderland>",
     "<account:Charlie Sheen>",
   ],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 4,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": true,
   "is_managed": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Bob Geldof>",
   "read_message_nr": 0,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 3,
};

let bob_header_after_read = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "export_files": [],
   "export_progress": "1",
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 4,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": true,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Bob Geldof>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let charlie_first_header = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
   ],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 4,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": true,
   "is_managed": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Sheen>",
   "read_message_nr": 0,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 3,
};

let charlie_header_after_read = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 4,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [
     "<account:Alice In Wonderland>",
     "<account:Charlie Sheen>",
   ],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 4,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 4,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": true,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": true,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_tiny",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Bob Geldof>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let charlie_after_mark_unread = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "export_files": [],
   "export_progress": "1",
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 2,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": true,
   "is_managed": false,
   "is_mark_unread": true,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Bob Geldof>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 3,
};


beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('mark read unread calls', function () {
    it('mark messages read', function () {
        return Promise.all([
                UC.alice.initial_poll(),
                UC.bob.initial_poll(),
                UC.charlie.initial_poll(),
            ])
            .then(function () {
                return UC.alice.api_call("api/conversation/create", {
                    topic: 'readings',
                    account_ids: [UC.bob.info.account_id, UC.charlie.info.account_id],
                });
            })
            .then(function (res) {
                let xres = UC.clean(res);
                expect(xres.header).toEqual(alice_create_header);
                return res;
            })
            .then(function (res) { // send some messages
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {message: 'Greetings, friend!'});
            })
            .then(function (res) {
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {message: 'How are you doing?'});
            })
            .then(function (res) {
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {message: "Talk"});
            })
            .then(function (res) {
                let xres = UC.clean(res);
                expect(xres.header).toEqual(alice_first_header);
                return res;
            })
            .then(function (res) { // wait until bg jobs have done their things
                return UC.alice.poke(res.header.conversation_id, true);
            })
            .then(function () {	// read conversation for bob
		return UC.bob.poll_filter({mk_rec_type: 'message', message: 'Talk'});
            })
            .then(function (res) { // find header from response
                let bob_header = matchStream(res.stream, {mk_rec_type: 'conv', topic: 'readings'});
                expect(UC.clean(bob_header)).toEqual(bob_first_header);
                return bob_header;
            })
            .then(function (bob_header) { // mark messages read
                return UC.bob.api_call("api/conversation/store/" + bob_header.conversation_id, {
			read_message_nr: bob_header.last_message_nr});
            })
            .then(function (res) {
                expect(UC.clean(res.header)).toEqual(bob_header_after_read);
                return res.header;
            })
            .then(function () { // get state for charlie
                return UC.charlie.poll_filter({mk_rec_type: 'message', message: 'Talk'});
            })
            .then(function (res) { // find conversation header
                let charlie_header = matchStream(res.stream, {mk_rec_type: 'conv', topic: 'readings'});
                expect(UC.clean(charlie_header)).toEqual(charlie_first_header);
                return charlie_header.conversation_id;
            })
            .then(function (conversation_id) { // mark conversation read
                return UC.bob.api_call("api/conversation/mark_read/" + conversation_id, {});
            })
            .then(function (res) {
                expect(UC.clean(res.header)).toEqual(charlie_header_after_read);
                return res.header;
            })
            .then(function (header) { // mark some messages unread
                return UC.bob.api_call("api/conversation/store/" + header.conversation_id, {
                        read_message_nr: 1});
            })
            .then(function (res) {
                expect(UC.clean(res.header)).toEqual(charlie_after_mark_unread);
                return res.header;
            })
            ;
    });
});
