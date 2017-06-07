import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test mk_event_type="${et.MESSAGE_ADD_PLAIN}"`, function () {
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
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_ADD_PINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post pinned message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>PinnedMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_ADD_TODO}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post todo message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>TodoMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_EDIT}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Edit plain message.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_EDIT, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
            message: "PlainMessage1AfterEdit",
        }),
        // Alice edits the message
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1AfterEdit</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_DEL}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Delete plain message.', UC.alice, [UC.bob]),
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
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET_PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change message state to plain.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>PinnedMessage1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET_PLAIN, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PLAIN);
            expect(state.r_message1.message).toEqual('<msg><p>PinnedMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET_TODO}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change message state to todo.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_SET_TODO, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET_DONE}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change message state to done.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.TODO);
            expect(state.r_message1.message).toEqual('<msg><p>TodoMessage1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET_DONE, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.DONE);
            expect(state.r_message1.message).toEqual('<msg><p>TodoMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET_PINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change message state to pinned.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_SET_PINNED, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>PlainMessage1</p></msg>');
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET_UNPINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change message state to unpinned.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD_PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.PINNED);
            expect(state.r_message1.message).toEqual('<msg><p>PinnedMessage1</p></msg>');
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET_UNPINNED, {
            conversation_id: state.conversation_id,
            message_nr: state.r_message1.message_nr,
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1.mk_message_state).toEqual(ms.UNPINNED);
            expect(state.r_message1.message).toEqual('<msg><p>PinnedMessage1</p></msg>');
        },
    ]);
});
