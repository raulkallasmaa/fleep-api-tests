import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms, sect} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Test pinboard sync.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test pinboard sync', UC.alice, []),
        // pin1
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "pin1",
        }),
        () => {
            state.r_pin1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(ms.PINNED);
        },
        // pin2
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "pin2",
        }),
        () => {
            state.r_pin2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(ms.PINNED);
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SYNC_PINBOARD, {
            conversation_id: state.conversation_id,
            limit: 1,
            sync_cursor: JSON.stringify({'conversation_id': state.conversation_id}),
        }, true),
        () => console.log(state.res),
        () => console.log(state.r_request),
    ]);
});

test('Test taskboard sync.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test taskboard sync', UC.alice, []),

        () => addEvent(state, UC.alice, et.MESSAGE_SYNC_TASKBOARD, {
            conversation_id: state.conversation_id,
            section_id: state.conversation_id,
            sync_cursor: JSON.stringify({
                conversation_id: state.conversation_id,
                section_id: state.conversation_id,
                task_weight: 0,
            }),
        }, true),
        () => console.log(state.r_request),
    ]);
});
