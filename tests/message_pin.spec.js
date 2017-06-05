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




test(`Reposition pins.`, function () {
    let state = {};
    let r_pin1 = {};
    let r_pin2 = {};
    let r_pin3 = {};
    let r_pin4 = {};
    return thenSequence([
        () => setupConv(state, 'Reposition pinned messages', UC.alice, [UC.bob, UC.charlie]),
        () => addMessage(state, UC.alice, {
            mk_event_type : "urn:fleep:client:conversation:message:add_pin",
            message: "pin1",
            mk_message_state: "urn:fleep:msgstate:pinned",
        }),
        () => Object.assign(r_pin1, state.r_message),
        () => addMessage(state, UC.alice, {
            mk_event_type : "urn:fleep:client:conversation:message:add_pin",
            message: "pin2",
            mk_message_state: "urn:fleep:msgstate:pinned",
        }),
        () => Object.assign(r_pin2, state.r_message),
        () => addMessage(state, UC.alice, {
            mk_event_type : "urn:fleep:client:conversation:message:add_pin",
            message: "pin3",
            mk_message_state: "urn:fleep:msgstate:pinned",
        }),
        () => Object.assign(r_pin3, state.r_message),
        () => addMessage(state, UC.alice, {
            mk_event_type : "urn:fleep:client:conversation:message:add_pin",
            message: "pin4",
            mk_message_state: "urn:fleep:msgstate:pinned",
        }),
        () => Object.assign(r_pin4, state.r_message),
        () => UC.alice.api_call("api/account/sync_pinboard/", {
            conversation_id: state.conversation_id,
        }),
        () => {
            expect([
                { message: r_pin1.message, pin_weight: r_pin1.pin_weight },
                { message: r_pin2.message, pin_weight: r_pin2.pin_weight },
                { message: r_pin3.message, pin_weight: r_pin3.pin_weight },
                { message: r_pin4.message, pin_weight: r_pin4.pin_weight },
            ].sort((a, b) => a.pin_weight < b.pin_weight)).toEqual([
                { message: '<msg><p>pin4</p></msg>', pin_weight: 4295163904 },
                { message: '<msg><p>pin3</p></msg>', pin_weight: 4295098368 },
                { message: '<msg><p>pin2</p></msg>', pin_weight: 4295032832 },
                { message: '<msg><p>pin1</p></msg>', pin_weight: 4294967296 },
            ]);
        },
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = "urn:fleep:client:conversation:message:pos_pin";
        },
        () => UC.alice.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": state.mk_event_type,
                    "client_req_id": state.client_req_id,
                    "params": {
                        "conversation_id": state.conversation_id,
                        "message_nr": r_pin1.message_nr,
                        "prev_message_nr": r_pin4.message_nr,
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
        },
        () => Object.assign(r_pin1, state.r_message),
        () => {
            expect([
                { message: r_pin1.message, pin_weight: r_pin1.pin_weight },
                { message: r_pin2.message, pin_weight: r_pin2.pin_weight },
                { message: r_pin3.message, pin_weight: r_pin3.pin_weight },
                { message: r_pin4.message, pin_weight: r_pin4.pin_weight },
            ].sort((a, b) => a.pin_weight < b.pin_weight)).toEqual([
                { message: '<msg><p>pin4</p></msg>', pin_weight: 4295163904 },
                { message: '<msg><p>pin1</p></msg>', pin_weight: 4295131136 },
                { message: '<msg><p>pin3</p></msg>', pin_weight: 4295098368 },
                { message: '<msg><p>pin2</p></msg>', pin_weight: 4295032832 },
            ]);
        },
    ]);
});
