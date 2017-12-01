import {thenSequence} from '../../lib';
import {randomUUID} from '../../lib/utils';

let et = {
    SECTION_TASK_ADD               : "urn:fleep:client:section:task:add",
    SECTION_TASK_SET__POSITION     : "urn:fleep:client:section:task:set_position",
    SECTION_TASK_DELETE            : "urn:fleep:client:section:task:delete",
    SECTION_TASK_RENAME            : "urn:fleep:client:section:task:rename",
    SECTION_TASK_ARCHIVE__DONE     : "urn:fleep:client:section:task:archive_done",

    SECTION_MY__TASK_ADD           : "urn:fleep:client:section:my_task:add",
    SECTION_MY__TASK_SET__POSITION : "urn:fleep:client:section:my_task:set_position",
    SECTION_MY__TASK_DELETE        : "urn:fleep:client:section:my_task:delete",
    SECTION_MY__TASK_RENAME        : "urn:fleep:client:section:my_task:rename",
    SECTION_MY__TASK_SYNC          : "urn:fleep:client:section:my_task:sync",

    MESSAGE_ADD__PLAIN             : "urn:fleep:client:message:add_plain",
    MESSAGE_ADD__TODO              : "urn:fleep:client:message:add_todo",
    MESSAGE_ADD__PINNED            : "urn:fleep:client:message:add_pinned",
    MESSAGE_EDIT                   : "urn:fleep:client:message:edit",
    MESSAGE_EDIT__BODY             : "urn:fleep:client:message:edit_body",
    MESSAGE_EDIT__SUBJECT          : "urn:fleep:client:message:edit_subject",
    MESSAGE_EDIT__ATTACHMENTS      : "urn:fleep:client:message:edit_attachments",
    MESSAGE_DELETE__ATTACHMENTS    : "urn:fleep:client:message:delete_attachments",

    MESSAGE_DELETE                 : "urn:fleep:client:message:delete",
    MESSAGE_SET__PLAIN             : "urn:fleep:client:message:set_plain",
    MESSAGE_SET__TODO              : "urn:fleep:client:message:set_todo",
    MESSAGE_SET__DONE              : "urn:fleep:client:message:set_done",
    MESSAGE_SET__PINNED            : "urn:fleep:client:message:set_pinned",
    MESSAGE_SET__UNPINNED          : "urn:fleep:client:message:set_unpinned",
    MESSAGE_TASK_SET__POSITION     : "urn:fleep:client:message:task:set_position",
    MESSAGE_PIN_SET__POSITION      : "urn:fleep:client:message:pin:set_position",
    MESSAGE_SET__ASSIGNEES         : "urn:fleep:client:message:set_assignees",
    MESSAGE_DISABLE__PREVIEW       : "urn:fleep:client:message:disable_preview",
    MESSAGE_COPY                   : "urn:fleep:client:message:copy",
    MESSAGE_MARK__SPAM             : "urn:fleep:client:message:mark_spam",
    MESSAGE_UNMARK__SPAM           : "urn:fleep:client:message:unmark_spam",

    CONV_PIN_SYNC                  : "urn:fleep:client:conv:pin:sync",
    SECTION_TASK_SYNC              : "urn:fleep:client:section:task:sync",

    CONV_UPLOAD__EXTERNAL          : "urn:fleep:client:conv:upload_external",

    CONTACT_GET__DIALOG            : "urn:fleep:client:contact:get_dialog",
    CONTACT_LOOKUP__BY__EMAIL      : "urn:fleep:client:contact:lookup_by_email",
    CONTACT_GET                    : "urn:fleep:client:contact:get",

    CONV_ENABLE__DONE__NOTIFICATIONS  : "urn:fleep:client:conv:enable_done_notifications",
    CONV_DISABLE__DONE__NOTIFICATIONS : "urn:fleep:client:conv:disable_done_notifications",
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

    SECTION_SUBTYPE_USER     : 'urn:fleep:section:mk_section_subtype:user',
    SECTION_SUBTYPE_DEFAULT  : 'urn:fleep:section:mk_section_subtype:default',
    SECTION_SUBTYPE_ARCHIVED : 'urn:fleep:section:mk_section_subtype:archived',
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
            state.r_request = client.matchRequests({
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

    if (state.client_req_id) {
        console.log('replace client_req_id');
        client_req_id = state.client_req_id;
    }
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
        (res) => state.res = res,
        () => {
            state.client_req_id = null;
            state.r_request = client.matchRequests({
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
