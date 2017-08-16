import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let after_org_conv_create = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDisclose>",
    "cmail": "<cmail:managedConvDisclose>",
    "conversation_id": "<conv:managedConvDisclose>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "guests": [],
    "has_email_subject": false,
    "is_deletable": true,
    "is_list": false,
    "is_managed": true,
    "leavers": [],
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    ],
    "mk_conv_type": "cct_default",
    "mk_rec_type": "org_conv",
    "organisation_id": "<org:orgDisclose>",
    "teams": [],
    "topic": "managedConvDisclose",
    }],
};

let meg_added_to_conv = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDisclose>",
    "cmail": "<cmail:managedConvDisclose>",
    "conversation_id": "<conv:managedConvDisclose>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "guests": [],
    "has_email_subject": false,
    "is_deletable": true,
    "is_list": false,
    "is_managed": true,
    "leavers": [],
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Meg Griffin>",
    ],
    "mk_conv_type": "cct_default",
    "mk_rec_type": "org_conv",
    "organisation_id": "<org:orgDisclose>",
    "teams": [],
    "topic": "managedConvDisclose",
    }],
};

let jon_added_to_conv = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDisclose>",
    "cmail": "<cmail:managedConvDisclose>",
    "conversation_id": "<conv:managedConvDisclose>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "guests": [],
    "has_email_subject": false,
    "is_deletable": true,
    "is_list": false,
    "is_managed": true,
    "leavers": [],
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Jon Lajoie>",
    "<account:Meg Griffin>",
    ],
    "mk_conv_type": "cct_default",
    "mk_rec_type": "org_conv",
    "organisation_id": "<org:orgDisclose>",
    "teams": [],
    "topic": "managedConvDisclose",
    }],
};

let don_added_to_conv = {
    "header": {
    "admins": [],
    "can_post": true,
    "conversation_id": "<conv:freeConvDisclose>",
    "creator_id": "<account:Bob Marley>",
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
    "leavers": [],
    "members": [
    "<account:Bob Marley>",
    "<account:Don Johnson>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 5,
    "send_message_nr": 1,
    "show_message_nr": 5,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [],
    "topic": "freeConvDisclose",
    "topic_message_nr": 1,
    "unread_count": 0,
    },
    "stream": [{
    "account_id": "<account:Bob Marley>",
    "conversation_id": "<conv:freeConvDisclose>",
    "inbox_nr": -3,
    "message": {
    "members": [
    "<account:Don Johnson>",
    ]
    },
    "message_nr": 5,
    "mk_message_type": "add",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 4,
    "profile_id": "<account:Bob Marley>",
    "tags": [],
    },
    {
    "account_id": "<account:Don Johnson>",
    "conversation_id": "<conv:freeConvDisclose>",
    "join_message_nr": 5,
    "mk_rec_type": "activity",
    }],
};

let jil_added_to_conv = {
    "header": {
    "admins": [],
    "can_post": true,
    "conversation_id": "<conv:freeConvDisclose>",
    "creator_id": "<account:Bob Marley>",
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
    "last_message_nr": 7,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Bob Marley>",
    "<account:Don Johnson>",
    "<account:Jil Smith>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 7,
    "send_message_nr": 1,
    "show_message_nr": 7,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [],
    "topic": "freeConvDisclose",
    "topic_message_nr": 1,
    "unread_count": 0,
    },
    "stream": [{
    "account_id": "<account:Bob Marley>",
    "conversation_id": "<conv:freeConvDisclose>",
    "inbox_nr": -3,
    "message": {
    "members": [
    "<account:Jil Smith>",
    ],
    },
    "message_nr": 7,
    "mk_message_type": "add",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 6,
    "profile_id": "<account:Bob Marley>",
    "tags": [],
    },
    {
    "account_id": "<account:Jil Smith>",
    "conversation_id": "<conv:freeConvDisclose>",
    "join_message_nr": 7,
    "mk_rec_type": "activity",
    }],
};

test('conversation disclose and disclose all in managed conversation', function () {
    let client = UC.bob;
    let conv_topic = 'managedConvDisclose';
    let org_name = 'orgDisclose';

    return thenSequence([
        // create org and add meg
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.meg.account_id],
        }),
        // meg joins the org
        () => UC.meg.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.meg.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: res.reminder_id}),
        // create managed conv
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
        }),
        (res) => expect(UC.clean(res)).toEqual(after_org_conv_create),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send 3 messages to conv
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
           message: 'msg1',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'msg2',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'msg3',
        }),
        // add meg to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_account_ids: [UC.meg.account_id],
        }),
        (res) => expect(UC.clean(res)).toEqual(meg_added_to_conv),
        // check that meg does not see the 3 messages before disclose
        () => UC.meg.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'msg3'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose the conv messages to meg
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            emails: UC.meg.email,
            message_nr: 2,
        }),
        // check that meg now sees the 3 messages
        () => UC.meg.poll_filter({mk_rec_type: 'message', message: /msg1/}),
        () => UC.meg.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 1,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        () => UC.meg.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 2,
            "message": "<msg><p>msg2</p></msg>",
            "message_nr": 3,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        () => UC.meg.getMessage(/msg3/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 3,
            "message": "<msg><p>msg3</p></msg>",
            "message_nr": 4,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 3,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        // invite jon to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id],
        }),
        // jon joins the org
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.jon.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.jon.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: res.reminder_id
        }),
        // add jon to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_account_ids: [UC.jon.account_id],
        }),
        (res) => expect(UC.clean(res)).toEqual(jon_added_to_conv),
        // check that jon does not see the 3 messages before disclose all
        () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg3'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose all the conv messages to jon
        () => client.api_call("api/conversation/disclose_all/" + client.getConvId(conv_topic), {
            emails: UC.jon.email,
        }),
        // check that jon now sees the 3 messages
        () => UC.jon.poll_filter({mk_rec_type: 'message', message: /msg1/}),
        () => UC.jon.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 1,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
        () => UC.jon.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 2,
            "message": "<msg><p>msg2</p></msg>",
            "message_nr": 3,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
        () => UC.jon.getMessage(/msg3/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDisclose>",
            "inbox_nr": 3,
            "message": "<msg><p>msg3</p></msg>",
            "message_nr": 4,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 3,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
    ]);
});

test('conversation disclose and disclose all in free conversation', function () {
    let client = UC.bob;
    let conv_topic = 'freeConvDisclose';

    return thenSequence([
        // create free conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send 3 messages to conv
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'message1',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'message2',
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'message3',
        }),
        // add don to the free conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_account_ids: [UC.don.account_id],
        }),
        (res) => expect(UC.clean(res)).toEqual(don_added_to_conv),
        // check that don does not see the 3 messages before disclose
        () => UC.don.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.don.matchStream({mk_rec_type: 'message', message: /message1/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.don.matchStream({mk_rec_type: 'message', message: /message2/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.don.matchStream({mk_rec_type: 'message', message: /message3/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose the conv messages to don
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            emails: UC.don.email,
            message_nr: 2,
        }),
        // check that don now sees the 3 messages
        () => UC.don.poll_filter({mk_rec_type: 'message', message: /message1/}),
        () => UC.don.getMessage(/message1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 1,
            "message": "<msg><p>message1</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        () => UC.don.getMessage(/message2/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 2,
            "message": "<msg><p>message2</p></msg>",
            "message_nr": 3,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        () => UC.don.getMessage(/message3/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 3,
            "message": "<msg><p>message3</p></msg>",
            "message_nr": 4,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 3,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        // add jil to the free conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_account_ids: [UC.jil.account_id],
        }),
        (res) => expect(UC.clean(res)).toEqual(jil_added_to_conv),
        // check that jil does not see the 3 messages before disclose all
        () => UC.jil.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: /message1/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: /message2/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: /message3/}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose all the conv messages to jil
        () => client.api_call("api/conversation/disclose_all/" + client.getConvId(conv_topic), {
            emails: UC.jil.email,
        }),
        // check that jil now sees the 3 messages
        () => UC.jil.poll_filter({mk_rec_type: 'message', message: /message1/}),
        () => UC.jil.getMessage(/message1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 1,
            "message": "<msg><p>message1</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        () => UC.jil.getMessage(/message2/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 2,
            "message": "<msg><p>message2</p></msg>",
            "message_nr": 3,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        () => UC.jil.getMessage(/message3/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:freeConvDisclose>",
            "inbox_nr": 3,
            "message": "<msg><p>message3</p></msg>",
            "message_nr": 4,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 3,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
    ]);
});
