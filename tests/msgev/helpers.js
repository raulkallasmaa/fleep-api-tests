import {thenSequence} from '../../lib';
import {randomUUID} from '../../lib/utils';

let MK_EVENT_TYPES = {
    addText : "urn:fleep:client:conversation:message:add_text",
    addTodo : "urn:fleep:client:conversation:message:add_todo",
    edit : "urn:fleep:client:conversation:message:edit",
    addPin : "urn:fleep:client:conversation:message:add_pin",
    posPin : "urn:fleep:client:conversation:message:pos_pin",
};

let MK_MESSAGE_STATES = {
    pinned: "urn:fleep:msgstate:pinned",
    text: "urn:fleep:msgstate:text",
    todo: "urn:fleep:msgstate:todo",
};

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
            for (let member of members) {
                if (member.account_id) {
                    member.poll_filter({mk_rec_type: 'conv', topic: topic});
                }
            }
        },
        () => {
            r_conversation = client.matchStream({
                mk_rec_type: 'conv',
                topic: topic,
            });
            state.conversation_id = r_conversation.conversation_id;
        },
    ]);
}

function addMessage(state, client, ev) {
    return thenSequence([
        () => {
            state.client_req_id = randomUUID();
            state.mk_event_type = ev.mk_event_type;
        },
        () => client.api_call("api/event/store/", {
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
            state.r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: state.client_req_id,
                mk_event_type: state.mk_event_type,
            });
            expect(state.r_request.status_code).toEqual(200);
            state.r_message = client.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message.mk_message_state).toEqual(ev.mk_message_state);
        },
    ]);
}

function addEvent(state, client, mk_event_type, params, nocheck) {
    let client_req_id = randomUUID();
    return thenSequence([
        () => client.api_call("api/event/store/", {
            stream: [
                {
                    "mk_event_type": mk_event_type,
                    "client_req_id": client_req_id,
                    "params": params,
                },
            ],
        }),
        () => {
            state.r_request = client.matchStream({
                mk_rec_type: 'request',
                client_req_id: client_req_id,
                mk_event_type: mk_event_type,
            });
        },
        () => {
            if (nocheck !== true) { // status code check disabled
                expect(state.r_request.status_code).toEqual(200);
            }
        },
    ]);
}

export {setupConv, addMessage, addEvent, MK_EVENT_TYPES, MK_MESSAGE_STATES};
