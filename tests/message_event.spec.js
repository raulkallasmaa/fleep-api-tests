import {UserCache, thenSequence} from '../lib';
import {randomUUID} from '../lib/utils';

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
        // add text message
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": "urn:fleep:client:conversation:message:add_text",
                    "client_req_id": randomUUID(),
                    "params": {
                        "conversation_id": client.getConvId(/topic1/),
                        "message": "message1",
                    },
                },
            ],
        }),

        // check poll & message state
        () => client.poll_filter({mk_rec_type: 'message', message: /message1/}),
        () => expect(client.getMessage(/message1/).mk_message_state).toEqual("urn:fleep:msgstate:text"),

        // pin message
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": "urn:fleep:client:conversation:message:set_pin",
                    "client_req_id": randomUUID(),
                    "params": {
                        "conversation_id": client.getConvId(/topic1/),
                        "message_nr": client.getMessageNr(/message1/),
                    },
                },
            ],
        }),

        // check poll & message state
        () => client.poll_filter({mk_rec_type: 'message', message: /message1/}),
        () => expect(client.getMessage(/message1/).mk_message_state).toEqual("urn:fleep:msgstate:pinned"),

        // del message
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": "urn:fleep:client:conversation:message:del",
                    "client_req_id": randomUUID(),
                    "params": {
                        "conversation_id": client.getConvId(/topic1/),
                        "message_nr": client.getMessageNr(/message1/),
                    },
                },
            ],
        }),

        // check poll & message state
        () => client.poll_filter({mk_rec_type: 'message', message: /message1/}),
        () => expect(client.getMessage(/message1/).mk_message_state).toEqual("urn:fleep:msgstate:deleted"),
    ]);
});
