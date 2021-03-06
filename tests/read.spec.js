import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice In Wonderland',
    'Bob Geldof',
    'Charlie Sheen',
], __filename, jasmine);

let alice_create_header = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
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
   "is_full": true,
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
   "members": [
   "<account:Alice In Wonderland>",
   "<account:Bob Geldof>",
   "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "pin_cursor": null,
   "pin_sync_state": null,
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
   "conversation_id": "<conv:readings>",
   "inbox_message_nr": 4,
   "is_mark_unread": false,
   "join_message_nr": 1,
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "mk_alert_level": "default",
   "mk_rec_type": "conv",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
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
   "default_members": [],
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
   "is_full": true,
   "is_init": true,
   "is_list": false,
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
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "pin_cursor": null,
   "pin_sync_state": null,
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
   "conversation_id": "<conv:readings>",
   "inbox_message_nr": 4,
   "is_mark_unread": false,
   "join_message_nr": 1,
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "mk_alert_level": "default",
   "mk_rec_type": "conv",
   "profile_id": "<account:Bob Geldof>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
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
   "default_members": [],
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
   "is_full": true,
   "is_init": true,
   "is_list": false,
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
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "pin_cursor": null,
   "pin_sync_state": null,
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
   "default_members": [],
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
   "is_full": true,
   "is_init": true,
   "is_list": false,
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
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_tiny",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Sheen>",
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
   "conversation_id": "<conv:readings>",
   "inbox_message_nr": 2,
   "is_mark_unread": true,
   "join_message_nr": 1,
   "last_inbox_nr": 3,
   "last_message_nr": 4,
   "mk_alert_level": "default",
   "mk_rec_type": "conv",
   "profile_id": "<account:Charlie Sheen>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "unread_count": 3,
};

let charlie_after_leave = {
   "admins": [],
   "can_post": false,
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 4,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 3,
   "last_message_nr": 5,
   "last_message_time": "...",
   "leavers": [
   "<account:Charlie Sheen>",
   ],
   "members": [
   "<account:Alice In Wonderland>",
   "<account:Bob Geldof>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Sheen>",
   "read_message_nr": 5,
   "send_message_nr": 5,
   "show_message_nr": 5,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let alice_final_header = {
   "conversation_id": "<conv:readings>",
   "export_files": [],
   "export_progress": "1",
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 8,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_mark_unread": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 5,
   "last_message_nr": 8,
   "last_message_time": "...",
   "mk_alert_level": "default",
   "mk_rec_type": "conv",
   "profile_id": "<account:Alice In Wonderland>",
   "read_message_nr": 8,
   "send_message_nr": 1,
   "show_message_nr": 8,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "unread_count": 0,
};

let charlie_final_header = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 7,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 8,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 8,
   "inbox_time": "...",
   "is_automute": false,
   "is_full": true,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 5,
   "last_message_nr": 8,
   "last_message_time": "...",
   "leavers": [],
   "members": [
   "<account:Alice In Wonderland>",
   "<account:Bob Geldof>",
   "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "pin_cursor": null,
   "pin_sync_state": null,
   "profile_id": "<account:Charlie Sheen>",
   "read_message_nr": 6,
   "send_message_nr": 7,
   "show_message_nr": 8,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 1,
};

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('mark messages read', function () {
    return thenSequence([
        () => UC.alice.initial_poll(),
        () => UC.bob.initial_poll(),
        () => UC.charlie.initial_poll(),
        // alice creates a conv and adds bob and charlie
        () => UC.alice.api_call("api/conversation/create", {
            topic: 'readings',
            account_ids: [UC.bob.info.account_id, UC.charlie.info.account_id],
        }),
        (res) => expect(UC.clean(res.header)).toMatchObject(alice_create_header),
        // send some messages
        () => UC.alice.api_call("api/message/store/" + UC.alice.getConvId(/readings/), {message: 'Greetings, friend!'}),
        () => UC.alice.api_call("api/message/store/" + UC.alice.getConvId(/readings/), {message: 'How are you doing?'}),
        () => UC.alice.api_call("api/message/store/" + UC.alice.getConvId(/readings/), {message: 'Talk'}),
        (res) => expect(UC.clean(res.header)).toMatchObject(alice_first_header),
        // wait until bg jobs have done their things
        () => UC.alice.poke(UC.alice.getConvId(/readings/), true),
        // read conversation for bob
        () => UC.bob.poll_filter({mk_rec_type: 'message', message: /Talk/}),
        // find header from response
        () => expect(UC.clean(UC.bob.matchStream({mk_rec_type: 'conv', topic: 'readings'}))).toMatchObject(bob_first_header),
        // mark messages read
        () => UC.bob.api_call("api/conversation/store/" + UC.alice.getConvId(/readings/), {
            read_message_nr: UC.bob.getRecord('conv', 'topic', 'readings').last_message_nr}),
        (res) => expect(UC.clean(res.header)).toMatchObject(bob_header_after_read),
        // get state for charlie
        () => UC.charlie.poll_filter({mk_rec_type: 'message', message: /Talk/}),
        // find conversation header
        () => expect(UC.clean(UC.charlie.matchStream({mk_rec_type: 'conv', topic: 'readings'})))
            .toMatchObject(charlie_first_header),
        // mark conversation read
        () => UC.charlie.api_call("api/conversation/mark_read/" + UC.alice.getConvId(/readings/), {}),
        (res) => expect(UC.clean(res.header)).toMatchObject(charlie_header_after_read),
        // mark some messages unread
        () => UC.charlie.api_call("api/conversation/store/" + UC.alice.getConvId(/readings/), {
            read_message_nr: 1}),
        (res) => expect(UC.clean(res.header)).toMatchObject(charlie_after_mark_unread),
        // charlie leaves
        () => UC.charlie.api_call("api/conversation/leave/" + UC.alice.getConvId(/readings/), {}),
        (res) => expect(UC.clean(res.header)).toMatchObject(charlie_after_leave),
        // send some messages while charlie is gone
        () => UC.alice.api_call("api/message/store/" + UC.alice.getConvId(/readings/), {
            message: 'Where did Charlie go?'}),
        // add charlie back
        () => UC.alice.api_call("api/conversation/store/" + UC.alice.getConvId(/readings/), {
            add_account_ids: [UC.charlie.account_id]}),
        // send some messages while charlie is gone
        () => UC.alice.api_call("api/message/store/" + UC.alice.getConvId(/readings/), {
            message: 'Welcome back!'}),
        (res) => expect(UC.clean(res.header)).toMatchObject(alice_final_header),
        // get final state for charlie
        () => UC.charlie.poll_filter({mk_rec_type: 'message', message: /back/}),
        // find conversation header
        () => expect(UC.clean(UC.charlie.matchStream({mk_rec_type: 'conv', topic: 'readings'})))
            .toMatchObject(charlie_final_header),
    ]);
});
