import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('Test plain message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test plain message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PLAIN, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, et.MESSAGE_EDIT, {
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
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>edit from bob</p></msg>');
        },
    ]);
});

test('Test task message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test task message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>edit1</p></msg>');
        },
        // Bob tries to edit the message posted by alice
        () => addEvent(state, UC.bob, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>edit from bob</p></msg>');
        },
    ]);
});

test('Test deleted message edit.', function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test text message edit', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PLAIN, {
            conversation_id: state.conversation_id,
            message: "message1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>message1</p></msg>');
        },
        // Alice deletes the message
        () => addEvent(state, UC.alice, et.MESSAGE_DEL, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.DELETED);
            expect(state.r_message1.message).toEqual('');
        },
        // Alice tries to edit deleted message
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
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
            expect(state.r_message1.mk_message_state).toEqual(ms.DELETED);
            expect(state.r_message1.message).toEqual('');
        },
    ]);
});
