import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test mk_event_type="${et.MESSAGE_ADD__PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post plain message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage",
        }),
        () => {
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>PlainMessage</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_ADD__PINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post pinned message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage",
        }),
        () => {
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message).toMatchObject({
                mk_message_state: ms.PINNED,
                message: '<msg><p>PinnedMessage</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_ADD__TODO}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post todo message.', UC.alice, [UC.bob]),
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage",
        }),
        () => {
            state.r_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message).toMatchObject({
                mk_message_state: ms.TODO,
                message: '<msg><p>TodoMessage</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_EDIT}"`, function () {
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
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>PlainMessage1AfterEdit</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_DELETE}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Delete plain message.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_DELETE, {
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
                mk_message_state: ms.DELETED,
                message: '',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET__PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change pinned message state to plain.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PINNED,
                message: '<msg><p>PinnedMessage1</p></msg>',
            });
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET__PLAIN, {
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
                message: '<msg><p>PinnedMessage1</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET__TODO}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change plain message state to todo.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_SET__TODO, {
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
                mk_message_state: ms.TODO,
                message: '<msg><p>PlainMessage1</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET__DONE}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change todo message state to done.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__TODO, {
            conversation_id: state.conversation_id,
            message: "TodoMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.TODO,
                message: '<msg><p>TodoMessage1</p></msg>',
            });
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET__DONE, {
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
                mk_message_state: ms.DONE,
                message: '<msg><p>TodoMessage1</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET__PINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change plain message state to pinned.', UC.alice, [UC.bob]),
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
        () => addEvent(state, UC.alice, et.MESSAGE_SET__PINNED, {
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
                mk_message_state: ms.PINNED,
                message: '<msg><p>PlainMessage1</p></msg>',
            });
        },
    ]);
});

test(`Test mk_event_type="${et.MESSAGE_SET__UNPINNED}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Change pinned message state to unpinned.', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PINNED, {
            conversation_id: state.conversation_id,
            message: "PinnedMessage1",
        }),
        () => {
            state.r_message1 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message1).toMatchObject({
                mk_message_state: ms.PINNED,
                message: '<msg><p>PinnedMessage1</p></msg>',
            });
        },
        () => addEvent(state, UC.alice, et.MESSAGE_SET__UNPINNED, {
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
                mk_message_state: ms.UNPINNED,
                message: '<msg><p>PinnedMessage1</p></msg>',
            });
        },
    ]);
});

test(`Test duplicate mk_event_type="${et.MESSAGE_ADD__PLAIN}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Post plain message.', UC.alice, [UC.bob]),
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
        () => state.client_req_id = state.r_request.client_req_id,
        // Alice posts a message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage2",
        }),
        () => {
            state.r_message2 = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                message_nr: state.r_request.identifier.message_nr,
            });
            expect(state.r_message2).toMatchObject({
                mk_message_state: ms.PLAIN,
                message: '<msg><p>PlainMessage1</p></msg>',
            });
            expect(state.r_message1).toMatchObject(state.r_message2);
        },
    ]);
});
