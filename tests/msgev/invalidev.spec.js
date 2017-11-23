import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test mk_event_type="${et.MESSAGE_EDIT}" with unknown message_nr`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Edit plain message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>PlainMessage1</p></msg>',
            });
        },
        // try to edit with unexisting message_nr
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
            conversation_id: state.conversation_id,
            message_nr: 10,
            message: "Edit with unknown message nr",
        }, true),
        () => {
            expect(state.r_request).toMatchObject({
                status_code: 430,
                error_id: 'not_found',
                error_message: 'Message not found.',
            });
        },
    ]);
});
