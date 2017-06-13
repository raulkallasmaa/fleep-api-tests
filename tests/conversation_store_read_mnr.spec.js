import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('read message number', function () {
    let client = UC.bob;
    let conv_topic = 'readMessageNr';

    return thenSequence([
        // create conversation and send a message
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'Message1'}),
        () => client.poke(client.getConvId(conv_topic), true),
        // bob marks the conv as read
        () => client.api_call("api/conversation/mark_read/" + client.getConvId(conv_topic), {}),
        () => expect(UC.clean(client.getConv(conv_topic).read_message_nr)).toEqual(2),
        // bob marks the conv as unread
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            from_message_nr: 2,
            read_message_nr: 1,
        }),
        (res) => expect(UC.clean(res.header.read_message_nr)).toEqual(1),
        // check from the conv record that the conv is marked unread for bob
        () => client.api_call("api/conversation/sync/" + client.getConvId(conv_topic), {}),
        () => expect(client.getConv(conv_topic).is_mark_unread).toEqual(true),
        // bob leaves the conv and tries to mark the conv as read and gets an error
        () => client.api_call("api/conversation/leave/" + client.getConvId(conv_topic), {}),
        () => client.api_call("api/conversation/mark_read/" + client.getConvId(conv_topic), {})
            .then(() => Promise.reject(new Error('Business logic error: Member has left the conversation')),
                (r) => expect(r.statusCode).toEqual(431)),
    ]);
});