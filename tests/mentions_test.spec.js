import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Ben Dover',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let meg_mentioned = {
    "admins": [],
    "autojoin_url": "<autojoin:mentionsInMessages>",
    "begin_message_nr": 1,
    "bw_message_nr": 1,
    "can_post": true,
    "cmail": "<cmail:mentionsInMessages>",
    "conversation_id": "<conv:mentionsInMessages>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "export_files": [],
    "export_progress": "1",
    "fw_message_nr": 3,
    "guests": [],
    "has_email_subject": false,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 3,
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
    "last_inbox_nr": 1,
    "last_message_nr": 3,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Ben Dover>",
    "<account:Bob Marley>",
    "<account:Meg Griffin>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_init_mode": "ic_full",
    "mk_rec_type": "conv",
    "my_message_nr": 3,
    "organisation_id": null,
    "profile_id": "<account:Meg Griffin>",
    "read_message_nr": 0,
    "send_message_nr": 1,
    "show_message_nr": 3,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [],
    "topic": "mentionsInMessages",
    "topic_message_nr": 2,
    "unread_count": 1,
};

test('mentions in messages - creating, editing and removing', function () {
    let client = UC.bob;
    let conv_topic = 'mentionsInMessages';
    let members = [UC.meg.fleep_email, UC.ben.fleep_email].join(', ');

    return thenSequence([
        // create conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // add meg and ben to the conv
        () => client.api_call("api/conversation/add_members/" + client.getConvId(conv_topic), {emails: members}),
        () => client.poke(client.getConvId(conv_topic), true),
        // mention meg in the conv
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: '@' + UC.meg.info.fleep_address,
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        // check that meg sees the mention
        () => expect(UC.clean(UC.meg.getConv(conv_topic))).toEqual(meg_mentioned),
        // edit the message and mention ben instead
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 3,
            message: '@' + UC.ben.info.fleep_address,
        }),
        // check that ben sees the mention
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(UC.ben.getConv(conv_topic)).my_message_nr).toEqual(3),
        // check that megs my msg nr is now 0
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(UC.meg.getConv(conv_topic)).my_message_nr).toEqual(0),
        // delete the mention message
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 3,
            tags: ['is_deleted'],
        }),
        // check that bens my msg nr is now 0
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(UC.ben.getConv(conv_topic)).my_message_nr).toEqual(0),
        // check that the message is deleted
        () => expect(UC.clean(UC.ben.getRecord('message', 'message_nr', 3))).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:mentionsInMessages>",
            "edit_account_id": "<account:Bob Marley>",
            "edited_time": "...",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:deleted",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Ben Dover>",
            "tags": [
            "is_deleted",
            "is_deleted",
            ],
        }),
    ]);
});
