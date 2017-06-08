import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms, sect} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Test pinboard syncs.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test pinboard sync', UC.alice, []),

        () => addEvent(state, UC.alice, et.MESSAGE_SYNC_PINBOARD, {
            conversation_id: state.conversation_id,
            sync_cursor: JSON.stringify({
                conversation_id: state.conversation_id, 
                pin_weight: 0,
            }),
        }, true),
        () => console.log(state.r_request),
    ]);
});

test('Test pinboard syncs.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test taskboard sync', UC.alice, []),

        () => addEvent(state, UC.alice, et.MESSAGE_SYNC_TASKBOARD, {
            conversation_id: state.conversation_id,
            sync_cursor: JSON.stringify({
                conversation_id: state.conversation_id,
                pin_weight: 0,
            }),
        }, true),
        () => console.log(state.r_request),
    ]);
});
