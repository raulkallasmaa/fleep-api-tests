import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test mk_event_type="${et.MESSAGE_COPY}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Origin conversation.', UC.alice, []),
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
        () => setupConv(state, 'Target conversation.', UC.alice, []),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_COPY, {
            conversation_id: state.conversation_id,
            copy_conversation_id: state.r_message1.conversation_id,
            copy_message_nr: state.r_message1.message_nr
        }),
        () => {
            state.r_message2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(UC.clean(state.r_message1)).toMatchObject({
                account_id: '<account:Alice Adamson>',
                conversation_id: '<conv:Origin conversation.>',
                message: '<msg><p>PlainMessage1</p></msg>',
                message_nr: 2,
                mk_message_state: ms.PLAIN,
            });
            expect(UC.clean(state.r_message2)).toMatchObject({
                account_id: '<account:Alice Adamson>',
                conversation_id: '<conv:Target conversation.>',
                message: '<msg><p>PlainMessage1</p></msg>',
                message_nr: 2,
                mk_message_state: ms.PLAIN,
            });
        },
    ]);
});
