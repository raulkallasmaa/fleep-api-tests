import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, MK_EVENT_TYPES, MK_MESSAGE_STATES} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Test text message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test text message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addText, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.text);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit1",
        }),
        // Alice edits the message
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.text);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit from bob",
        }, true),
        () => {
            expect(state.r_request.status_code).toEqual(431);
            expect(state.r_request.error_id).toEqual('invalid_edit');
        },
    ]);
});

test('Test pinned message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test pinned message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addPin, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit1",
        }),
        // Alice edits the message
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit from bob",
        }),
        () => {
            state.r_message1 = UC.bob.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.pinned);
            expect(state.r_message1.message).toEqual('<msg><p>edit from bob</p></msg>');
        },
    ]);
});

test('Test task message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test task message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addTodo, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.todo);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit1",
        }),
        // Alice edits the message
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.todo);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit from bob",
        }),
        () => {
            state.r_message1 = UC.bob.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.todo);
            expect(state.r_message1.message).toEqual('<msg><p>edit from bob</p></msg>');
        },
    ]);
});

test('Test deleted message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test text message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.addText, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.text);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        // Alice deletes the message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.deleteMessage, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.deleted);
            expect(state.r_message1.message).toEqual('');
        },
        // Alice tries to edit deleted message
        () => addEvent(state, UC.alice, MK_EVENT_TYPES.edit, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "edit from alice",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_message1.conversation_id,
                message_nr: state.r_message1.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(MK_MESSAGE_STATES.deleted);
            expect(state.r_message1.message).toEqual('');
        },
    ]);
});
