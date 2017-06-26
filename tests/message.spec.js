import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

// storing messages, editing them with edit and with store and adding & removing subject
it('should store & edit messages and add & remove subject', function () {
    let client = UC.alice;
    let members = [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ');
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'topic1'}),
        (res) => expect(res.header.topic).toEqual('topic1'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /topic1/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/topic1/), {emails: members}),
        () => client.poke(client.getConvId(/topic1/), true),
        () => client.api_call("api/message/store/" + client.getConvId(/topic1/), {message: 'message1'}),
        () => client.api_call("api/message/store/" + client.getConvId(/topic1/), {message: 'message2'}),
        () => client.api_call("api/message/edit/" + client.getConvId(/topic1/), {
            message: 'message3',
            message_nr: client.getMessageNr(/message2/)
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /message3/}),
        () => client.api_call("api/message/store/" + client.getConvId(/topic1/), {
            message: 'message4',
            subject: 'subject1',
            message_nr: client.getMessageNr(/message2/)
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /message4/}),
        () => expect(client.getMessage(/message4/).message).toEqual("<msg><p>message4</p></msg>"),
        () => client.api_call("api/message/store/" + client.getConvId(/topic1/), {
            message_nr: client.getMessageNr(/message2/),
            subject: '',
            tags: ['is_deleted']
        })
    ]);
});

it('should let other user delete message but not edit', function () {
    let client = UC.alice;
    let client2 = UC.bob;
    let emails = [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ');
    let conversation_id = null;
    let message_nr = null;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'deleteReject'}),
        (res) => {
            expect(res.header.topic).toEqual('deleteReject');
            conversation_id = res.header.conversation_id;
        },
        () => client.poll_filter({mk_rec_type: 'conv', topic: /deleteReject/}),
        () => client.api_call("api/conversation/add_members/" + conversation_id, {emails: emails}),
        () => client.api_call("api/message/store/" + conversation_id, {message: 'rejectDelete'}),
        (xres) => message_nr = xres.result_message_nr,
        () => client.poke(conversation_id, true),
        () => client2.poll_filter({mk_rec_type: 'message', message: /rejectDelete/}),
        () => client2.api_call("api/message/store/" + conversation_id, {
            message_nr: message_nr,
            message: 'newRejectDelete'
        }),
    ])
        .then(function () {
            return Promise.reject(new Error('Error 431'));
        })
        .catch(function (r) {
            expect(r.statusCode).toEqual(431);
            return thenSequence([
                () => client2.api_call("api/message/store/" + conversation_id, {
                    message_nr: message_nr,
                    tags: ['is_deleted']
                }),
                () => expect(message_nr).toEqual(3),
                () => expect(message_nr).toEqual(3),
            ]);
        });
});

it('should pin and unpin message', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'pin1alice'}),
        (res) => expect(res.header.topic).toEqual('pin1alice'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /pin1alice/}),
        () => client.api_call("api/message/store/" + client.getConvId(/pin1alice/), {message: 'pin1Msg'}),
        () => client.api_call("api/message/store/" + client.getConvId(/pin1alice/), {tags: ['pin'], message_nr: client.getMessageNr(/pin1Msg/)}),
        () => client.api_call("api/message/store/" + client.getConvId(/pin1alice/), {
            message_nr: client.getMessageNr(/pin1Msg/),
            message: 'unpinMsg',
            tags: ['pin', 'is_archived']
        }),
        (res) => expect(UC.clean(res, {}).stream).toEqual([{
            "account_id": "<account:Alice Adamson>",
            "conversation_id": "<conv:pin1alice>",
            "edit_account_id": "<account:Alice Adamson>",
            "edited_time": '...',
            "flow_message_nr": 4,
            "inbox_nr": 1,
            "message": "<msg><p>unpinMsg</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_msg_sub_type": "mst_unpin",
            "mk_rec_type": "message",
            "pin_weight": '...',
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Alice Adamson>",
            "ref_message_nr": 2,
            "tags": [
            "is_archived",
            "is_shared",
            "unpin"]
            }])
    ]);
});

it('should assign task, set task done & undone and archive task', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'tasks'}),
        (res) => expect(res.header.topic).toEqual('tasks'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /tasks/}),
        () => client.api_call("api/message/store/" + client.getConvId(/tasks/), {message: 'task1'}),
        () => client.api_call("api/message/store/" + client.getConvId(/tasks/), {
            message: 'task1',
            tags: ['is_todo'],
            message_nr: client.getMessageNr(/task1/),
            assignee_ids: [UC.alice.account_id]
        }),
        () => client.api_call("api/message/store/" + client.getConvId(/tasks/), {
            message_nr: client.getMessageNr(/task1/),
            message: 'task1',
            tags: ['is_done']
        }),
        () => client.api_call("api/message/store/" + client.getConvId(/tasks/), {
            message_nr: client.getMessageNr(/task1/),
            message: 'task1',
            tags: ['is_todo']
        }),
        () => client.api_call("api/message/store/" + client.getConvId(/tasks/), {
            message_nr: client.getMessageNr(/task1/),
            message: 'task2',
            tags: ['is_todo', 'is_archived']
        }),
        () => expect(client.getMessage(/task2/).tags).toEqual(["is_shared", "is_task", "is_todo", "is_archived"])
    ]);
});

it('should copy a message from another conversation', function () {
    let client = UC.alice;
    let fromConv = null;
    let toConv = null;
    let msgNr = null;
    let msgInfo = null;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'copyFrom'}),
        (res) => expect(res.header.topic).toEqual('copyFrom'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /copyFrom/}),
        () => client.api_call("api/message/store/" + client.getConvId(/copyFrom/), {message: 'copyMsg'}),
        () => client.api_call("api/conversation/create", {topic: 'pasteTo'}),
        () => {
             fromConv = client.getConvId('copyFrom');
             toConv = client.getConvId('pasteTo');
             msgNr = client.getMessageNr(/copyMsg/);
        },
        () => client.api_call("api/message/copy/" + fromConv, {message_nr: msgNr, to_conv_id: toConv}),
        () => client.poll_filter({mk_rec_type: 'message', message_nr: msgNr, conversation_id: toConv}),
        () => {
            msgInfo = client.matchStream({
            mk_rec_type: 'message',
            message: /copyMsg/,
            conversation_id: toConv,
            message_nr: msgNr
        });
        },
        () => expect(UC.clean(msgInfo, {})).toEqual({
            "account_id": "<account:Alice Adamson>",
            "conversation_id": "<conv:pasteTo>",
            "inbox_nr": 1,
            "message": "<msg><p>copyMsg</p></msg>",
            "message_nr": 2,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Alice Adamson>",
            "tags": [],
        })
    ]);
});

test('should try to copy a deleted message', function () {
    let client = UC.bob;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'copyDeletedMsg'}),
        (res) => expect(res.header.topic).toEqual('copyDeletedMsg'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /copyDeletedMsg/}),
        () => client.api_call("api/message/store/" + client.getConvId('copyDeletedMsg'),
            {message: 'deletedMessage'}),
        () => client.api_call("api/message/store/" + client.getConvId('copyDeletedMsg'),
            {message_nr: client.getMessageNr(/deletedMessage/), tags: ['is_deleted']}),
        () => client.api_call("api/message/copy/" + client.getConvId('copyDeletedMsg'),
            {message_nr: client.getMessageNr(/deletedMessage/), to_conv_id: client.getConvId('copyDeletedMsg')}),
    ])
        .then(function () {
            return Promise.reject(new Error('Error 431'));
        })
        .catch(function (r) {
            expect(r.statusCode).toEqual(431);
        });
});