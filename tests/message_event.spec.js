import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

it('should store text message using stream api', function () {
    let client = UC.alice;
    let members = [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ');
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'topic1'}),
        (res) => expect(res.header.topic).toEqual('topic1'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /topic1/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/topic1/), {emails: members}),
        () => client.poke(client.getConvId(/topic1/), true),
        // store text message
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": "urn:fleep:client:conversation:message:add_text",
                    "client_req_id": "54710943-1473-4d03-938b-ea028e270909",
                    "params": {
                        "conversation_id": client.getConvId(/topic1/),
                        "message": "message1",
                    },
                },
            ],
        }),
        // check text message
        () => client.poll_filter({mk_rec_type: 'message', message: /message1/}),
    ]);
});
