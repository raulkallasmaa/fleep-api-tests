import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, MK_EVENT_TYPES, MK_MESSAGE_STATES} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Reposition pins insice default section.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Reposition pinned messages', UC.alice, []),
        // pin1
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addPin, {
            conversation_id: state.conversation_id,
            message: "pin1",
        }),
        () => {
            state.r_pin1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
        },
        // pin2
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addPin, {
            conversation_id: state.conversation_id,
            message: "pin2",
        }),
        () => {
            state.r_pin2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
        },
        // pin3
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addPin, {
            conversation_id: state.conversation_id,
            message: "pin3",
        }),
        () => {
            state.r_pin3 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
        },
        // pin4
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addPin, {
            conversation_id: state.conversation_id,
            message: "pin4",
        }),
        () => {
            state.r_pin4 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
        },
        // pins before reorder
        () => {
            expect([
                { message: state.r_pin1.message, pin_weight: state.r_pin1.pin_weight },
                { message: state.r_pin2.message, pin_weight: state.r_pin2.pin_weight },
                { message: state.r_pin3.message, pin_weight: state.r_pin3.pin_weight },
                { message: state.r_pin4.message, pin_weight: state.r_pin4.pin_weight },
            ].sort((a, b) => a.pin_weight < b.pin_weight)).toEqual([
                { message: '<msg><p>pin4</p></msg>', pin_weight: 4295163904 },
                { message: '<msg><p>pin3</p></msg>', pin_weight: 4295098368 },
                { message: '<msg><p>pin2</p></msg>', pin_weight: 4295032832 },
                { message: '<msg><p>pin1</p></msg>', pin_weight: 4294967296 },
            ]);
        },
        // reorder
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.posPin, {
            "conversation_id": state.conversation_id,
            "message_nr": state.r_pin1.message_nr,
            "prev_message_nr": state.r_pin4.message_nr,
        }),
        () => {
            state.r_pin1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_pin1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
        },
        // pins after reorder
        () => {
            expect([
                { message: state.r_pin1.message, pin_weight: state.r_pin1.pin_weight },
                { message: state.r_pin2.message, pin_weight: state.r_pin2.pin_weight },
                { message: state.r_pin3.message, pin_weight: state.r_pin3.pin_weight },
                { message: state.r_pin4.message, pin_weight: state.r_pin4.pin_weight },
            ].sort((a, b) => a.pin_weight < b.pin_weight)).toEqual([
                { message: '<msg><p>pin4</p></msg>', pin_weight: 4295163904 },
                { message: '<msg><p>pin1</p></msg>', pin_weight: 4295131136 },
                { message: '<msg><p>pin3</p></msg>', pin_weight: 4295098368 },
                { message: '<msg><p>pin2</p></msg>', pin_weight: 4295032832 },
            ]);
        },
    ]);
});
