import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Ben Dover',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

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
        // check that meg's my msg nr is 3
        () => expect(UC.clean(UC.meg.getConv(conv_topic)).my_message_nr).toEqual(3),
        // edit the message and mention ben instead
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 3,
            message: '@' + UC.ben.info.fleep_address,
        }),
        // check that ben's my msg nr is 3
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(UC.ben.getConv(conv_topic)).my_message_nr).toEqual(3),
        // check that megs my msg nr is now 0
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(UC.meg.getConv(conv_topic)).my_message_nr).toEqual(0),
        // delete the mention message
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 3,
            tags: ['is_deleted'],
        }),
        // check that bens my msg nr is now 0
        () => UC.ben.poke(client.getConvId(conv_topic), true),
        () => UC.ben.poke(client.getConvId(conv_topic), true),
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
