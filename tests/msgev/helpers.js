import {thenSequence} from '../../lib';
import {randomUUID} from '../../lib/utils';

let et = {
    CONV_TASK_SECTION_ADD         : "urn:fleep:client:section:task:add",
    CONV_TASK_SECTION_POS         : "urn:fleep:client:section:task:pos",
    CONV_TASK_SECTION_DEL         : "urn:fleep:client:section:task:del",
    CONV_TASK_SECTION_RENAME      : "urn:fleep:client:section:task:rename",
    MESSAGE_ADD_PLAIN             : "urn:fleep:client:message:add_plain",
    MESSAGE_ADD_TODO              : "urn:fleep:client:message:add_todo",
    MESSAGE_ADD_PINNED            : "urn:fleep:client:message:add_pinned",
    MESSAGE_EDIT                  : "urn:fleep:client:message:edit",
    MESSAGE_DEL                   : "urn:fleep:client:message:del",
    MESSAGE_SET_PLAIN             : "urn:fleep:client:message:set_plain",
    MESSAGE_SET_TODO              : "urn:fleep:client:message:set_todo",
    MESSAGE_SET_DONE              : "urn:fleep:client:message:set_done",
    MESSAGE_SET_PINNED            : "urn:fleep:client:message:set_pinned",
    MESSAGE_SET_UNPINNED          : "urn:fleep:client:message:set_unpinned",
    MESSAGE_POS_TASK              : "urn:fleep:client:message:pos_task",
    MESSAGE_POS_PINNED            : "urn:fleep:client:message:pos_pinned",
    MESSAGE_SET_ASSIGNEES         : "urn:fleep:client:message:set_assignees",
    MESSAGE_DISABLE_PREVIEW       : "urn:fleep:client:message:disable_preview",
    MESSAGE_COPY                  : "urn:fleep:client:message:copy",

    MESSAGE_SYNC_PINBOARD         : "urn:fleep:client:message:sync_pinboard",
    MESSAGE_SYNC_TASKBOARD        : "urn:fleep:client:message:sync_taskboard",
};

let ms = {
    PLAIN    : 'urn:fleep:message:mk_message_state:plain',
    SYSTEM   : 'urn:fleep:message:mk_message_state:system',
    DELETED  : 'urn:fleep:message:mk_message_state:deleted',
    PINNED   : 'urn:fleep:message:mk_message_state:pinned',
    UNPINNED : 'urn:fleep:message:mk_message_state:unpinned',
    TODO     : 'urn:fleep:message:mk_message_state:todo',
    DONE     : 'urn:fleep:message:mk_message_state:done',
};

let sect = {
    SECTION_TYPE_TASK : 'urn:fleep:section:mk_section_type:task',

    SECTION_SUB_TYPE_USER     : 'urn:fleep:section:mk_section_sub_type:user',
    SECTION_SUB_TYPE_DEFAULT  : 'urn:fleep:section:mk_section_sub_type:default',
    SECTION_SUB_TYPE_ARCHIVED : 'urn:fleep:section:mk_section_sub_type:archived',
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

export {setupConv, addMessage, addEvent, et, ms, sect};
