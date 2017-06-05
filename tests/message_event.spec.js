import {UserCache, thenSequence} from '../lib';
import {randomUUID} from '../lib/utils';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

function setupConv(state, topic, client, members) {
    let r_conversation = null;
    let account_ids = [];
    for (let member of members) {
        account_ids.push(member.account_id);
    }
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: topic, account_ids: account_ids}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: topic}),
        () => {
            r_conversation = client.matchStream({
                mk_rec_type: 'conv',
                topic: topic,
            });
            state.conversation_id = r_conversation.conversation_id;
            state.client_req_id = null;
            state.mk_event_type = null;
            state.r_message = {};
            state.r_request = {};
        },
    ]);
}

function addMessage(state, client, ev) {
    return thenSequence([
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = ev.mk_event_type;
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": ev.message,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual(ev.mk_message_state);
        },
    ]);
}

test(`1. Add text message.`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic1', UC.alice, [UC.bob, UC.charlie]),
        () => addMessage(state, UC.alice, {
            mk_event_type : "urn:fleep:client:conversation:message:add_text",
            message: "message1",
            mk_message_state: "urn:fleep:msgstate:text",
        }),
    ]);
});

test(`2. Add pinned message.`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic2', UC.alice, [UC.bob, UC.charlie]),
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:add_pin";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:pinned");
        },
    ]);
});

test(`3. Add todo message.`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic3', UC.alice, [UC.bob, UC.charlie]),
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:add_todo";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:todo");
        },
    ]);
});

test(`Turn text message into pinned message.`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic4', UC.alice, [UC.bob, UC.charlie]),
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:add_text";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:text");
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:set_pin";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": state.r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:pinned");
        },
      ]);
});

test(`Turn text message todo message.`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic5', UC.alice, [UC.bob, UC.charlie]),
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:add_text";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:text");
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:set_todo";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": state.r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            console.log(state.r_request);
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:todo");
        },
    ]);
});

test(`Turn todo message into done message`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'topic4', UC.alice, [UC.bob, UC.charlie]),
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:add_todo";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message": "message1",
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:todo");
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:set_done";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": state.r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:done");
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:del";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": state.r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual("urn:fleep:msgstate:deleted");
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:set_pin";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": state.r_message.message_nr,
                    },
                },
            ],
        }),
        () => {
            state.r_request = UC.alice.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(400);
            expect(state.r_request.error_id).toEqual('invalid_call');
        },
    ]);
});
