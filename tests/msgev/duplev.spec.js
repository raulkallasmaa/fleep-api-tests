import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test duplicate mk_event_type="${et.MESSAGE_ADD_PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post plain message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1</p></msg>');
        },
        () => state.client_req_id = state.r_request.client_req_id,
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage2",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1</p></msg>');
        },
    ]);
});

test(`Test duplicate mk_event_type="${et.MESSAGE_ADD_PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post plain message.', UC.alice, [UC.bob]),
        () => console.log('conversation_id: ' + state.conversation_id),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1</p></msg>');
        },
        // Alice edits a message
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
            conversation_id: state.conversation_id,
            message_nr: state.r_request.identifier.message_nr,
            message: "PlainMessage1After1Edit",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1After1Edit</p></msg>');
        },
        // Alice edits a message
        () => state.client_req_id = state.r_request.client_req_id,
        // Alice edits a message
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
            conversation_id: state.conversation_id,
            message_nr: state.r_request.identifier.message_nr,
            message: "PlainMessage1After2Edit",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1After1Edit</p></msg>');
        },
    ]);
});
