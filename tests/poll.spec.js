
import {UserCache} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('polling in new conversation', function () {
    it('should send message to 3 participants', function () {
        return Promise.all([
            UC.alice.initial_poll(),
            UC.bob.initial_poll(),
            UC.charlie.initial_poll(),
        ])
        .then(function () {
            return UC.alice.api_call("api/conversation/create", {
                topic: 'test',
                emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')
            });
        })
        .then(function (res) {
            return UC.alice.api_call("api/message/send/" + res.header.conversation_id, {message: 'hello'});
        })
        .then(function () {
            return Promise.all([
                UC.alice.poll_filter({mk_rec_type: 'message', message: /hello/}),
                UC.bob.poll_filter({mk_rec_type: 'message', message: /hello/}),
                UC.charlie.poll_filter({mk_rec_type: 'message', message: /hello/}),
            ]);
        })
        .then(function (res) {
            return true;
        });
    });
});