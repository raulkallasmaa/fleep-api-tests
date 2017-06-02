import {UserCache, thenSequence} from '../lib';
import {randomUUID} from '../lib/utils';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

it('should send message events using stream api', function () {
    let client = UC.alice;
    let members = [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ');
    let conversation_id = null;

    let client_req_id = null;
    let mk_event_type = null;
    let r_message = {};
    let r_request = {};
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'topic1'}),
        (res) => {
            expect(res.header.topic).toEqual('topic1');
            conversation_id = res.header.conversation_id;
        },
        () => client.poll_filter({mk_rec_type: 'conv', topic: /topic1/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/topic1/), {emails: members}),
        () => client.poke(client.getConvId(/topic1/), true),

        /*
         *  Add text message
         */

        () => {
            client_req_id = randomUUID();
            mk_event_type = "urn:fleep:client:conversation:message:add_text";
        },
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": mk_event_type,
                    "client_req_id": client_req_id,
                    "params": {
                        "conversation_id": conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: client_req_id,
                mk_event_type: mk_event_type,
            });
            expect(r_request.status_code).toEqual(200);

            r_message = client.matchStream({
                mk_rec_type: 'message',
                conversation_id: r_request.identifier.conversation_id,
                message_nr: r_request.identifier.message_nr
            });
            expect(r_message.mk_message_state).toEqual("urn:fleep:msgstate:text");

            console.log(r_request);
            console.log(r_message);
        },

        /*
         *  Pin message
         */
        () => {
            client_req_id = randomUUID();
            mk_event_type = "urn:fleep:client:conversation:message:set_pin";
        },

        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": mk_event_type,
                    "client_req_id": client_req_id,
                    "params": {
                        "conversation_id": conversation_id,
                        "message_nr": r_message.message_nr,
                    },
                },
            ],
        }),

        () => {
            r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: client_req_id,
                mk_event_type: mk_event_type,
            });
            console.log(r_request);
            expect(r_request.status_code).toEqual(200);

            r_message = client.matchStream({
                mk_rec_type: 'message',
                conversation_id: r_request.identifier.conversation_id,
                message_nr: r_message.message_nr
            });
            console.log(r_message);
            expect(r_message.mk_message_state).toEqual("urn:fleep:msgstate:pinned");
        },

        /*
         *  Del message
         */
        () => {
            client_req_id = randomUUID();
            mk_event_type = "urn:fleep:client:conversation:message:del";
        },


        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": mk_event_type,
                    "client_req_id": client_req_id,
                    "params": {
                        "conversation_id": conversation_id,
                        "message_nr": r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: client_req_id,
                mk_event_type: mk_event_type,
            });
            console.log(r_request);
            expect(r_request.status_code).toEqual(200);

            r_message = client.matchStream({
                mk_rec_type: 'message',
                conversation_id: r_request.identifier.conversation_id,
                message_nr: r_message.message_nr
            });
            console.log(r_message);
            expect(r_message.mk_message_state).toEqual("urn:fleep:msgstate:deleted");
        },
        /*
         *  Pin deleted message
         */
        () => {
            client_req_id = randomUUID();
            mk_event_type = "urn:fleep:client:conversation:message:set_pin";
        },

        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": mk_event_type,
                    "client_req_id": client_req_id,
                    "params": {
                        "conversation_id": conversation_id,
                        "message_nr": r_message.message_nr,
                    },
                },
            ],
        }),

        () => {
            r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: client_req_id,
                mk_event_type: mk_event_type,
            });
            console.log(r_request);
            expect(r_request.status_code).toEqual(400);
            expect(r_request.error_id).toEqual('invalid_call');
        },
    ]);
});
