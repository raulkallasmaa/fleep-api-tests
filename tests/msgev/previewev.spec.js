import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test url previews`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test url previews', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "First message with url: www.google.com",
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.conversation_id,
            });

            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });

            state.r_preview1 = UC.alice.matchStream({
                mk_rec_type: 'preview',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });

            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>First message with url: <a href="http://www.google.com">www.google.com</a></p></msg>',
                message_nr: 2
            });

            expect(state.r_preview1).toMatchObject({
                conversation_id: state.r_message1.conversation_id,
                message_nr: state.r_message1.message_nr,
            });
        },
        // disable url previews in conversation
        () => UC.alice.api_call(`api/conversation/store/${state.conversation_id}`, {is_url_preview_disabled: true}),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.conversation_id,
            });
            expect(state.r_header).toMatchObject({
                is_url_preview_disabled: true,
            });
        },
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "Second message with url: www.google.com",
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.conversation_id,
            });

            state.r_message2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });

            state.r_preview2 = UC.alice.matchStream({
                mk_rec_type: 'preview',
                conversation_id: state.r_message2.conversation_id,
                message_nr: state.r_message2.message_nr,
            });

            expect(state.r_message2).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>Second message with url: <a href="http://www.google.com">www.google.com</a></p></msg>',
                message_nr: 4,
                is_url_preview_disabled: true,
            });

            // no prevew rec
            expect(state.r_preview2).toBeNull();
        },
        // Remove url preview from the first message
        () => addEvent(state, UC.alice, et.MESSAGE_DISABLE__PREVIEW, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>First message with url: <a href="http://www.google.com">www.google.com</a></p></msg>',
                message_nr: 2,
                is_url_preview_disabled: true,
            });
        },
    ]);
});
