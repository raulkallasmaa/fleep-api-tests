import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

// storing messages, editing them with edit and with store and adding & removing subject
describe('store & edit messages and add & remove subject', function () {
    it('should store & edit messages and add & remove subject', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'greetings'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('greetings');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')});
            })
            .then(function (res) {
                    return UC.alice.poke(res.header.conversation_id, true)
                        .then(function () {
                            return res.header.conversation_id;
                        });
                })
            .then(function (conversation_id) {
                    return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'Greetings, friend!'})
                        .then(function () {
                            return conversation_id;
                        });
                })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'How are you doing?'});
            })
            .then(function (res) {
                return UC.alice.api_call("api/message/edit/" + res.header.conversation_id, {message: 'How are you?', message_nr: res.result_message_nr})
                    .then(function () {
                        return UC.alice.poll_filter({mk_rec_type: 'message', message: /How are you\?/, message_nr: res.result_message_nr});
                    })
                    .then(function () {
                        return res;
                    });
            })
            // change message and add subject
            .then(function (res) {
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                           message: 'How you doing?',
                           message_nr: res.result_message_nr,
                           subject: 'hello there'})
                    .then(function () {
                        return UC.alice.poll_filter({mk_rec_type: 'message', message: /How you doing\?/, message_nr: res.result_message_nr});
                    })
                    .then(function () {
                        let msg = UC.alice.cache.message[res.header.conversation_id][res.result_message_nr];
                        expect(msg.message).toEqual("<msg><p>How you doing?</p></msg>");
                    })
                    .then(function () {
                        return res;
                    });
            })
            // remove subject
            .then(function (res) {
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                    message_nr: res.result_message_nr,
                    subject: ''});
            });
});
});

describe('pin and unpin message', function () {
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
});
