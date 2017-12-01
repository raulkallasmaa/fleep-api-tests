import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test my taskboard sync`, function () {
    let state = {};
    return thenSequence([
        // do initial poll
        () => UC.alice.initial_poll(),
        // check my taskboard default section
        () => {
            state.r_section_default = UC.alice.matchStream({
                mk_rec_type: 'section',
                mk_section_type: 'urn:fleep:section:mk_section_type:my_task',
                mk_section_subtype: 'urn:fleep:section:mk_section_subtype:default',
            });
            expect(UC.clean(state.r_section_default)).toMatchObject({
               section_id: '<section:To Do>',
            });
        },
        // check my taskboard archived section
        () => {
            state.r_section_archived = UC.alice.matchStream({
                mk_rec_type: 'section',
                mk_section_type: 'urn:fleep:section:mk_section_type:my_task',
                mk_section_subtype: 'urn:fleep:section:mk_section_subtype:archived',
            });
            expect(UC.clean(state.r_section_archived)).toMatchObject({
               section_id: '<section:Archived>',
            });
        },
        () => setupConv(state, 'Create task', UC.alice, [UC.bob]),
        // post a "todo" message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage1",
            assignee_ids: [UC.alice.account_id],
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
        // wait for event sender to process the message
        () => UC.alice.poll_filter({mk_rec_type: 'message', message_nr: state.r_message1.message_nr}),
        // sync default section tasks on my taskboard
        () => addEvent(state, UC.alice, et.SECTION_MY__TASK_SYNC, {
            section_id: state.r_section_default.section_id,
        }),
        () => {
            state.r_message_my_task = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_message1.conversation_id,
                message_nr: state.r_message1.message_nr,
            });
            expect(state.r_message_my_task).toMatchObject({
                mk_message_state: ms.TODO,
                message: '<msg><p>TodoMessage1</p></msg>',
            });
            expect(UC.clean(state.r_message_my_task.task_state)).toMatchObject({
                mk_section_type: 'urn:fleep:section:mk_section_type:my_task',
                section_id: '<section:To Do>',
                task_weight: 4294967296,
            });
        },
    ]);
});
