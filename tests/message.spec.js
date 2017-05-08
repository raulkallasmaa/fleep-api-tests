import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('receive messages', () => {
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
                return UC.alice.api_call("api/message/store/" + conversation_id, {message: 'How are you doing?'})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/edit/" + conversation_id, {message: 'How are you?', message_nr: 4})
                    .then(function () {
                        return conversation_id;
                    });
                // to be continued:
                // - edit own message
                // - delete own message
                // - check that other user cannot edit senders message
                // - check that other user can delete others message
                // - test message copy api call
            // .then(function (res) {
            //     let xres = UC.clean(res, {});
            //     xres.stream = [];
            //     expect(xres).toEqual({});
            // });
            })
);
});