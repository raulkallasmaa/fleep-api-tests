import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms, sect} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Reposition todo messages.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Reposition todo messages', UC.alice, []),

        () => {
            state.r_archived_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                conversation_id: state.conversation_id,
                mk_section_sub_type: sect.SECTION_SUB_TYPE_ARCHIVED,
            });
            console.log(state.r_archived_section);
            state.r_default_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                conversation_id: state.conversation_id,
                mk_section_sub_type: sect.SECTION_SUB_TYPE_DEFAULT,
            });
            console.log(state.r_default_section);
        },

        // todo1
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "todo1",
        }),
        () => {
            state.r_todo1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_todo1.mk_message_state).toEqual(ms.TODO);
        },
        // todo2
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "todo2",
        }),
        () => {
            state.r_todo2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_todo2.mk_message_state).toEqual(ms.TODO);
        },
        // todo3
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "todo3",
        }),
        () => {
            state.r_todo3 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_todo3.mk_message_state).toEqual(ms.TODO);
        },
        // todo4
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "todo4",
        }),
        () => {
            state.r_todo4 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_todo4.mk_message_state).toEqual(ms.TODO);
        },
        // tasks before reorder
        () => {
            expect([
                { message: state.r_todo1.message, task_weight: state.r_todo1.task_weight },
                { message: state.r_todo2.message, task_weight: state.r_todo2.task_weight },
                { message: state.r_todo3.message, task_weight: state.r_todo3.task_weight },
                { message: state.r_todo4.message, task_weight: state.r_todo4.task_weight },
            ].sort((a, b) => a.task_weight < b.task_weight)).toEqual([
                { message: '<msg><p>todo4</p></msg>', task_weight: 4295163904 },
                { message: '<msg><p>todo3</p></msg>', task_weight: 4295098368 },
                { message: '<msg><p>todo2</p></msg>', task_weight: 4295032832 },
                { message: '<msg><p>todo1</p></msg>', task_weight: 4294967296 },
            ]);
        },
        // reorder
        () => addEvent(state, UC.alice, et.MESSAGE_POS_TASK, {
            "conversation_id": state.conversation_id,
            "message_nr": state.r_todo1.message_nr,
            "prev_message_nr": state.r_todo4.message_nr,
            "section_id": state.r_todo1.section_id,
        }),
        () => {
            state.r_todo1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_todo1.mk_message_state).toEqual(ms.TODO);
        },
        // tasks after reorder
        () => {
            expect([
                { message: state.r_todo1.message, task_weight: state.r_todo1.task_weight },
                { message: state.r_todo2.message, task_weight: state.r_todo2.task_weight },
                { message: state.r_todo3.message, task_weight: state.r_todo3.task_weight },
                { message: state.r_todo4.message, task_weight: state.r_todo4.task_weight },
            ].sort((a, b) => a.task_weight < b.task_weight)).toEqual([
                { message: '<msg><p>todo4</p></msg>', task_weight: 4295163904 },
                { message: '<msg><p>todo1</p></msg>', task_weight: 4295131136 },
                { message: '<msg><p>todo3</p></msg>', task_weight: 4295098368 },
                { message: '<msg><p>todo2</p></msg>', task_weight: 4295032832 },
            ]);
        },
    ]);
});
