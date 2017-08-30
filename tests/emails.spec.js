import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton@',
    'Botox User@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let first_email_conv_rec = {
    "admins": [],
    "autojoin_url": "<autojoin:Bill Clinton>",
    "begin_message_nr": 1,
    "bw_message_nr": 1,
    "can_post": true,
    "cmail": "<cmail:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "creator_id": "<account:Bill Clinton>",
    "default_members": [
    "<account:Bill Clinton>",
    ],
    "default_topic": "Bill Clinton",
    "export_files": [],
    "export_progress": "1",
    "fw_message_nr": 2,
    "guests": [],
    "has_email_subject": true,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 2,
    "inbox_time": "...",
    "is_automute": true,
    "is_init": true,
    "is_list": false,
    "is_managed": false,
    "is_premium": false,
    "is_tiny": false,
    "join_message_nr": 1,
    "label_ids": [
    "<label:1:1 Conversations>",
    ],
    "last_inbox_nr": 1,
    "last_message_nr": 2,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Bill Clinton>",
    "<account:Bob Marley>",
    ],
    "mk_alert_level": "never",
    "mk_conv_type": "cct_default",
    "mk_init_mode": "ic_full",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 0,
    "send_message_nr": 1,
    "show_message_nr": 2,
    "snooze_interval": -1,
    "snooze_time": 0,
    "teams": [],
    "topic": "",
    "topic_message_nr": 1,
    "unread_count": 1,
};

let first_email_msg_rec = {
    "account_id": "<account:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "inbox_nr": 1,
    "message": "<msg><p>email text 1</p></msg>",
    "message_nr": 2,
    "mk_message_state": "urn:fleep:message:mk_message_state:plain",
    "mk_message_type": "email",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 1,
    "profile_id": "<account:Bob Marley>",
    "sender_name": "Bill Clinton",
    "subject": "emailTest1",
    "tags": [],
};

let second_email_conv_rec = {
    "conversation_id": "<dlg:Bill Clinton>",
    "export_files": [],
    "export_progress": "1",
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 2,
    "inbox_time": "...",
    "is_automute": true,
    "is_list": false,
    "join_message_nr": 1,
    "last_inbox_nr": 2,
    "last_message_nr": 3,
    "last_message_time": "...",
    "mk_alert_level": "never",
    "mk_rec_type": "conv",
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 0,
    "send_message_nr": 1,
    "show_message_nr": 3,
    "snooze_interval": -1,
    "snooze_time": 0,
    "unread_count": 2,
};

let second_email_msg_rec = {
    "account_id": "<account:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "inbox_nr": 2,
    "message": "<msg><p>email text 2</p></msg>",
    "message_nr": 3,
    "mk_message_state": "urn:fleep:message:mk_message_state:plain",
    "mk_message_type": "email",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 2,
    "profile_id": "<account:Bob Marley>",
    "sender_name": "Bill Clinton",
    "subject": "emailTest1",
    "tags": [],
};

let third_email_conv_rec = {
    "conversation_id": "<dlg:Bill Clinton>",
    "export_files": [],
    "export_progress": "1",
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 2,
    "inbox_time": "...",
    "is_automute": true,
    "is_list": false,
    "join_message_nr": 1,
    "last_inbox_nr": 3,
    "last_message_nr": 4,
    "last_message_time": "...",
    "mk_alert_level": "never",
    "mk_rec_type": "conv",
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 0,
    "send_message_nr": 1,
    "show_message_nr": 4,
    "snooze_interval": -1,
    "snooze_time": 0,
    "unread_count": 3,
};

let third_email_msg_rec = {
    "account_id": "<account:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "inbox_nr": 3,
    "message": "<msg><p>email text 3</p></msg>",
    "message_nr": 4,
    "mk_message_state": "urn:fleep:message:mk_message_state:plain",
    "mk_message_type": "email",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 3,
    "profile_id": "<account:Bob Marley>",
    "sender_name": "Bill Clinton",
    "subject": "emailTest2",
    "tags": [],
};

let meg_added_to_conv = {
    "admins": [],
    "can_post": true,
    "conversation_id": "<dlg:Bill Clinton>",
    "creator_id": "<account:Bill Clinton>",
    "default_members": [
    "<account:Bill Clinton>",
    "<account:Meg Griffin>",
    ],
    "default_topic": "Bill and Meg",
    "export_files": [],
    "export_progress": "1",
    "guests": [],
    "has_email_subject": true,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 4,
    "inbox_time": "...",
    "is_automute": true,
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
    "<account:Bill Clinton>",
    "<account:Bob Marley>",
    "<account:Meg Griffin>",
    ],
    "mk_alert_level": "never",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 5,
    "send_message_nr": 1,
    "show_message_nr": 5,
    "snooze_interval": -1,
    "snooze_time": 0,
    "teams": [],
    "topic": "",
    "topic_message_nr": 1,
    "unread_count": 0,
};

let bob_and_bills_new_email_conv = {
    "admins": [],
    "autojoin_url": "<autojoin:Bill Clinton>",
    "begin_message_nr": 1,
    "bw_message_nr": 1,
    "can_post": true,
    "cmail": "<cmail:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "creator_id": "<account:Bill Clinton>",
    "default_members": [
    "<account:Bill Clinton>",
    ],
    "default_topic": "Bill Clinton",
    "export_files": [],
    "export_progress": "1",
    "fw_message_nr": 2,
    "guests": [],
    "has_email_subject": true,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 2,
    "inbox_time": "...",
    "is_automute": true,
    "is_init": true,
    "is_list": false,
    "is_managed": false,
    "is_premium": false,
    "is_tiny": false,
    "join_message_nr": 1,
    "label_ids": [
    "<label:1:1 Conversations>",
    ],
    "last_inbox_nr": 1,
    "last_message_nr": 2,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Bill Clinton>",
    "<account:Bob Marley>",
    ],
    "mk_alert_level": "never",
    "mk_conv_type": "cct_default",
    "mk_init_mode": "ic_full",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "profile_id": "<account:Bob Marley>",
    "read_message_nr": 0,
    "send_message_nr": 1,
    "show_message_nr": 2,
    "snooze_interval": -1,
    "snooze_time": 0,
    "teams": [],
    "topic": "",
    "topic_message_nr": 1,
    "unread_count": 1,
};

let bills_email_to_bob = {
    "account_id": "<account:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "inbox_nr": 6,
    "message": "<msg><p>Group mail message 1</p></msg>",
    "message_nr": 8,
    "mk_message_state": "urn:fleep:message:mk_message_state:plain",
    "mk_message_type": "email",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 7,
    "profile_id": "<account:Bob Marley>",
    "sender_name": "Bill Clinton",
    "subject": "Group mail subject 1",
    "tags": [],
};

let bills_email_to_meg = {
    "account_id": "<account:Bill Clinton>",
    "conversation_id": "<dlg:Bill Clinton>",
    "inbox_nr": 6,
    "message": "<msg><p>Group mail message 1</p></msg>",
    "message_nr": 8,
    "mk_message_state": "urn:fleep:message:mk_message_state:plain",
    "mk_message_type": "email",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 7,
    "profile_id": "<account:Meg Griffin>",
    "sender_name": "Bill Clinton",
    "subject": "Group mail subject 1",
    "tags": [],
};
test('send email from email account to fleep account', function () {
    let client = UC.bob;
    let emailer = UC.bill;

    return thenSequence([
        // email user bill sends an email to fleep user bob
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: client.fleep_email,
            subject: 'emailTest1',
            text: 'email text 1'
        }),
        // bob receives the email in a fleep convo
        () => client.poll_filter({mk_rec_type: 'conv', default_topic: 'Bill Clinton'}),
        () => client.getRecord('conv', 'default_topic', 'Bill Clinton'),
        (res) => expect(UC.clean(res)).toEqual(first_email_conv_rec),
        () => client.getMessage(/text 1/),
        (res) => expect(UC.clean(res)).toEqual(first_email_msg_rec),
    ]);
});

test('send email with same subject and check that the message is sent to the same conversation', function () {
    let client = UC.bob;
    let emailer = UC.bill;

    return thenSequence([
        // email user bill sends a second email with the same subject to fleep user bob
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: client.fleep_email,
            subject: 'emailTest1',
            text: 'email text 2'
        }),
        // bob receives the email in the same fleep convo
        () => client.poll_filter({mk_rec_type: 'message', message: /text 2/}),
        () => client.getMessage(/text 2/),
        (res) => expect(UC.clean(res)).toEqual(second_email_msg_rec),
        () => client.getRecord('conv', 'unread_count', 2),
        (res) => expect(UC.clean(res)).toEqual(second_email_conv_rec),
    ]);
});

test('send email with a different subject and check that the message is sent to the same conversation', function () {
    let client = UC.bob;
    let emailer = UC.bill;

    return thenSequence([
        // email user bill sends a third email with a different subject to fleep user bob
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: client.fleep_email,
            subject: 'emailTest2',
            text: 'email text 3'
        }),
        // bob receives the email in the same fleep convo
        () => client.poll_filter({mk_rec_type: 'message', message: /text 3/}),
        () => client.getMessage(/text 3/),
        (res) => expect(UC.clean(res)).toEqual(third_email_msg_rec),
        () => client.getRecord('conv', 'unread_count', 3),
        (res) => expect(UC.clean(res)).toEqual(third_email_conv_rec),
    ]);
});

test('add new fleep user to the convo and check that email messages get a new convo', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let conversation_id = client.getRecord('conv', 'unread_count', 3).conversation_id;

    return thenSequence([
        // fleep user bob adds another fleep user meg to the convo
        () => UC.meg.initial_poll(),
        () => client.api_call("api/conversation/add_members/" + conversation_id, {emails: UC.meg.fleep_email}),
        // email user bill sends another email message to fleep user bob
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: client.fleep_email,
            subject: 'emailTest3',
            text: 'email text 4'
        }),
        // check that a new convo is created after meg is added to the old one and bill sends a new email
        () => client.poll_filter({mk_rec_type: 'conv', conversation_id: conversation_id}),
        () => client.getRecord('conv', 'default_topic', 'Bill and Meg'),
        (res) => expect(UC.clean(res)).toEqual(meg_added_to_conv),
        () => client.poll_filter({mk_rec_type: 'conv', default_topic: 'Bill Clinton'}),
        () => client.getRecord('conv', 'default_topic', 'Bill Clinton'),
        (res) => expect(UC.clean(res)).toEqual(bob_and_bills_new_email_conv)
    ]);
});

test('send a fleep message to the first chat and check for corresponding email', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let conversation_id = client.getRecord('conv', 'default_topic', 'Bill and Meg').conversation_id;

    return thenSequence([
        // bob sends a message to the old chat with meg and bill
        () => client.api_call("api/message/store/" + conversation_id, {
            message: 'fleepMessage1',
            subject: 'fleepSubject1',
        }),
        // check that bill got an email about bobs message
        () => emailer.waitMail({
            subject: /Subject1/,
            body: /Message1/,
        }),
    ]);
});

test('send another fleep message to the first chat with the same subject and check for corresponding email', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let conversation_id = client.getRecord('conv', 'default_topic', 'Bill and Meg').conversation_id;

    return thenSequence([
        // bob sends another message to the old chat with meg and bill
        () => client.api_call("api/message/store/" + conversation_id, {
            message: 'fleepMessage2',
            subject: 'fleepSubject1',
        }),
        // check that bill got an email about bobs message
        () => emailer.waitMail({
            subject: /Subject1/,
            body: /Message2/,
        }),
    ]);
});

test('send an email to 2 fleep users', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let bobs_conv_id = null;
    let megs_conv_id = null;

    return thenSequence([
        // bill sends an email to bob and meg
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: [client.fleep_email, UC.meg.fleep_email],
            subject: 'Group mail subject 1',
            text: 'Group mail message 1'
        }),
        // bob receives the email message
        () => client.poll_filter({mk_rec_type: 'message', message: /Group mail/}),
        () => client.getRecord('message', 'subject', /Group mail/),
        (res) => expect(UC.clean(res)).toEqual(bills_email_to_bob),
        // meg receives the email message
        () => UC.meg.poll_filter({mk_rec_type: 'message', message: /Group mail/}),
        () => UC.meg.getRecord('message', 'subject', /Group mail/),
        (res) => expect(UC.clean(res)).toEqual(bills_email_to_meg),
        // check that bills email goes to the same conv where bob and meg are
        () => {
            bobs_conv_id = client.getRecord('message', 'subject', /Group mail/).conversation_id;
            megs_conv_id = UC.meg.getRecord('message', 'subject', /Group mail/).conversation_id;
            expect(bobs_conv_id).toEqual(megs_conv_id);
        },
    ]);
});

test('send an email to 199(MAX) recipients', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let email = UC.botox.email;
    let emails_list = [];

    for (let i = 1; i < 198; i++) {
            let unique = email.replace('botox', i);
            emails_list.push(unique);
    }

    return thenSequence([
        // email user bill sends an email to 199 recipients
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: [client.fleep_email, UC.meg.fleep_email, emails_list.join(', ')],
            envelope: {
                to: [client.fleep_email, UC.meg.fleep_email]
            },
            subject: 'Mail to 199 recipients',
            text: 'Mail to 199 recipients'
        }),
        // check that bob is in the conv with bill, meg and 197 email addresses
        () => client.poll_filter({mk_rec_type: 'conv', default_topic: /Bill,/}),
        () => expect(client.getRecord('conv', 'default_topic', /Bill,/).members.length).toEqual(200)
    ]);
});

test.skip('send an email to 200(MAXED OUT) recipients - member limit exceeded', function () {
    let client = UC.bob;
    let emailer = UC.bill;
    let email = UC.botox.email;
    let emails_list = [];

    for (let i = 200; i < 398; i++) {
            let unique = email.replace('botox', i);
            emails_list.push(unique);
        }

    return thenSequence([
        // email user bill tries to send an email to 200 recipients
        () => emailer.send_mail({
            from: emailer.email_fullname,
            to: [client.fleep_email, UC.meg.fleep_email, emails_list.join(', ')],
            envelope: {
              to: [client.fleep_email, UC.meg.fleep_email]
            },
            subject: 'Mail to 200 recipients',
            text: 'Mail to 200 recipients'
        }),
        // this part needs to be debugged: waitMail doesnt receive the "member limit exceeded" email
        () => emailer.waitMail()
    ]);
});
