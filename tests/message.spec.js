import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

// storing messages, editing them with edit and with store and adding & removing subject
it('should store & edit messages and add & remove subject', function () {
    return UC.alice.api_call("api/conversation/create", {topic: 'topic1'})
        .then(function (res) {
            UC.clean(res, {});
            expect(res.header.topic).toEqual('topic1');
            return res.header.conversation_id;
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {
                emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')
            });
        })
        .then(function (res) {
            return UC.alice.poke(res.header.conversation_id, true)
                .then(function () {
                    return res.header.conversation_id;
                });
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'message1'})
                .then(function () {
                    return conversation_id;
                });
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'message2'});
        })
        .then(function (res) {
            return UC.alice.api_call("api/message/edit/" + res.header.conversation_id, {
                message: 'message3',
                message_nr: res.result_message_nr
            })
                .then(function () {
                    return UC.alice.poll_filter({
                        mk_rec_type: 'message',
                        message: /message3/,
                        message_nr: res.result_message_nr
                    });
                })
                .then(function () {
                    return res;
                });
        })
        // change message and add subject
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message: 'message4',
                message_nr: res.result_message_nr,
                subject: 'subject1'
            })
                .then(function () {
                    return UC.alice.poll_filter({
                        mk_rec_type: 'message',
                        message: /message4/,
                        message_nr: res.result_message_nr
                    });
                })
                .then(function () {
                    let msg = UC.alice.cache.message[res.header.conversation_id][res.result_message_nr];
                    expect(msg.message).toEqual("<msg><p>message4</p></msg>");
                })
                .then(function () {
                    return res;
                });
        })
        // remove subject and message
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                subject: '',
                tags: ['is_deleted']
            });
        });
});

it('should let other user delete message but not edit', function () {
    return UC.alice.api_call("api/conversation/create", {topic: 'topic1'})
        .then(function (res) {
            UC.clean(res, {});
            expect(res.header.topic).toEqual('topic1');
            return res.header.conversation_id;
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {
                emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')
            });
        })
        .then(function (res) {
            return UC.alice.poke(res.header.conversation_id, true)
                .then(function () {
                    return res.header.conversation_id;
                });
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'message1'});
        })
        .then(function (res) {
            return UC.bob.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                message: 'message2'
            })
                .then(function () {
                    return Promise.reject(new Error('Error 431'));
                })
                .catch(function (r) {
                    expect(r.statusCode).toEqual(431);
                })
                .then(function () {
                    return res;
                });
        })
        .then(function (res) {
            return UC.bob.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                tags: ['is_deleted']
            });
        });
});

it('should pin and unpin message', function () {
    return UC.alice.api_call("api/conversation/create", {topic: 'pin1alice'})
        .then(function (res) {
            UC.clean(res, {});
            expect(res.header.topic).toEqual('pin1alice');
            return res.header.conversation_id;
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {
                message: 'pin1alice'
            });
        })
        // pin message
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message: 'pin1alice',
                tags: ['pin'],
                message_nr: res.result_message_nr
            })
                .then(function () {
                    return res;
                });
        })
        // unpin message and change message text
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                message: 'pin2',
                tags: ['pin', 'is_archived']
            })
                .then(function (res2) {
                    let msg = UC.alice.cache.message[res.header.conversation_id][res.result_message_nr];
                    expect(msg.message).toEqual('<msg><p>pin2</p></msg>');
                });
        });
});

it('should assign task, set task done & undone and archive task', function () {
    return UC.alice.api_call("api/conversation/create", {topic: 'tasks'})
        .then(function (res) {
            UC.clean(res, {});
            expect(res.header.topic).toEqual('tasks');
            return res.header.conversation_id;
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {
                message: 'task1'
            });
        })
        // assign task to alice
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message: 'task1',
                tags: ['is_todo'],
                message_nr: res.result_message_nr,
                assignee_ids: [UC.alice.account_id]
            })
                .then(function () {
                    return res;
                });
        })
        // task complete
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                message: 'task1',
                tags: ['is_done']
            });
        })
        // task incomplete
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                message: 'task1',
                tags: ['is_todo']
            });
        })
        // task archive
        .then(function (res) {
            return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                message_nr: res.result_message_nr,
                message: 'task2',
                tags: ['is_todo', 'is_archived']
            })
                .then(function (res2) {
                    let msg = UC.alice.cache.message[res.header.conversation_id][res.result_message_nr];
                    expect(msg.message).toEqual('<msg><p>task2</p></msg>');
                });
        });
});

it('should copy a message from another conversation', function () {
    return UC.alice.api_call("api/conversation/create", {topic: 'topic1'})
        .then(function (res) {
            expect(res.header.topic).toEqual('topic1');
            return res.header.conversation_id;
        })
        .then(function (conversation_id) {
            return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'message1'});
        })
        .then(function () {
            return UC.alice.api_call("api/conversation/create", {topic: 'topic2'});
        })
        .then(function () {
            let fromConv = UC.alice.getConvId('topic1');
            let toConv = UC.alice.getConvId('topic2');
            let msgNr = UC.alice.getMessageNr(/message1/);
            return UC.alice.api_call("api/message/copy/" + fromConv, {
                message_nr: msgNr,
                to_conv_id: toConv
            })
                .then(function () {
                    return UC.alice.poll_filter({
                        mk_rec_type: 'message',
                        message_nr: msgNr,
                        conversation_id: toConv
                    });
                });
        });
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
