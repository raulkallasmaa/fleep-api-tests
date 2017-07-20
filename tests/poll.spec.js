import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('send message to 3 participants and polling', function () {
    return thenSequence([
        () => Promise.all([
            UC.alice.initial_poll(),
            UC.bob.initial_poll(),
            UC.charlie.initial_poll(),
        ]),
        () => UC.alice.api_call("api/conversation/create", {
            topic: 'test',
            emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')
        }),
        () => UC.alice.api_call("api/message/send/" + UC.alice.getConvId(/test/), {message: 'hello'}),
        () => Promise.all([
            UC.alice.poll_filter({mk_rec_type: 'message', message: /hello/}),
            UC.bob.poll_filter({mk_rec_type: 'message', message: /hello/}),
            UC.charlie.poll_filter({mk_rec_type: 'message', message: /hello/}),
        ]),
    ])
        .then(function (res) {
            return true;
        });
});