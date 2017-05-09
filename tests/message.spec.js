import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

// storing messages, editing them with edit and with store
describe('store and edit messages', () => {
    it('should store and edit messages',
        () => UC.alice.api_call("api/conversation/create", {topic: 'greetings'})
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
                        return UC.alice.poll_filter({mk_rec_type: 'message', message: 'How are you?', message_nr: res.result_message_nr});
                    })
                    .then(function () {
                        return res;
                    });
            })
            .then(function (res) {
                return UC.alice.api_call("api/message/store/" + res.header.conversation_id, {
                           message: 'How you doing?',
                           message_nr: res.result_message_nr})
                    .then(function () {
                        return UC.alice.poll_filter({mk_rec_type: 'message', message: 'How you doing?', message_nr: res.result_message_nr});
                    })
                    .then(function () {
                        let msg = UC.alice.cache.message[res.header.conversation_id][res.result_message_nr];
                        expect(msg.message).toEqual("<msg><p>How you doing?</p></msg>");
                    });
            })

);
});