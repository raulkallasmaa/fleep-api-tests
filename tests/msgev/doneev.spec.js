import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());


test(`Mark task as done`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Mark task as done', UC.alice, [UC.bob]),
        // enable done notifications
        () => addEvent(state, UC.alice, et.CONV_ENABLE__DONE__NOTIFICATIONS, {
            conversation_id: state.conversation_id,
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.r_request.identifier.conversation_id,
            });
            expect(state.r_header).toMatchObject({
                has_done_notifications: true,
            });
            state.r_system_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                mk_message_type: 'enable_done_notifs',
            });
            expect(state.r_system_message1).toMatchObject({
                mk_message_type: 'enable_done_notifs',
                mk_message_state: ms.SYSTEM,
                message: '{"sysmsg_text":"{author} enabled task notifications."}',
                message_nr: 2,
            });
        },
        // post a "todo" message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.TODO,
                message: '<msg><p>TodoMessage1</p></msg>',
            });
        },
        // mark message as "done"
        () => addEvent(state, UC.alice, et.MESSAGE_SET__DONE, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            from_message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.DONE,
                message: '<msg><p>TodoMessage1</p></msg>',
            });
            state.r_system_message2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                mk_message_type: 'task_completed',
            });
            expect(state.r_system_message2).toMatchObject({
                mk_message_type: 'task_completed',
                mk_message_state: ms.SYSTEM,
                message: '{"task_message_nr":3,"sysmsg_text":"{author} completed a task."}',
            });
        },
        // disable done notifications
        () => addEvent(state, UC.alice, et.CONV_DISABLE__DONE__NOTIFICATIONS, {
            conversation_id: state.conversation_id,
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.r_request.identifier.conversation_id,
            });
            expect(state.r_header).toMatchObject({
                has_done_notifications: false,
            });
            state.r_system_message3 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                mk_message_type: 'disable_done_notifs',
            });
            expect(state.r_system_message3).toMatchObject({
                mk_message_type: 'disable_done_notifs',
                mk_message_state: ms.SYSTEM,
                message: '{"sysmsg_text":"{author} disabled task notifications."}',
                message_nr: 6,
            });
        },
    ]);
});
