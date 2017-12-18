import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Angela Merkel',
    'Donald Trump',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test.skip(`Test mk_event_type="${et.CONV_ADD__MEMBERS}"`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test add members', UC.alice, [UC.bob]),
        () => addEvent(state, UC.alice, et.CONV_ADD__MEMBERS, {
            conversation_id: state.conversation_id,
            account_ids: [UC.angela.account_id, UC.donald.account_id],
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.r_request.identifier.conversation_id,
            });

            expect(UC.clean(state.r_header)).toMatchObject({
                conversation_id: '<conv:Test add members>',
                members: [
                    '<account:Alice Adamson>',
                    '<account:Angela Merkel>',
                    '<account:Bob Dylan>',
                    '<account:Donald Trump>'],
            });
            state.r_create_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                mk_message_type: 'create',
            });
            expect(UC.clean(state.r_create_message)).toMatchObject({
                message: {
                    members:
                        ['<account:Angela Merkel>', '<account:Bob Dylan>', '<account:Donald Trump>'],
                    org_name: null,
                    organisation_id: null,
                    topic: 'Test add members'
                },
                message_nr: 1,
                mk_message_type: 'create',
                profile_id: '<account:Alice Adamson>',
            });
        },
    ]);
});

test.skip(`Test mk_event_type="${et.CONV_ADD__MEMBERS}" with message`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test add members', UC.alice, [UC.bob]),
        // Add message
        () => addEvent(state, UC.alice, et.MESSAGE_ADD__PLAIN, {
            conversation_id: state.conversation_id,
            message: "PlainMessage",
        }),
        // Add members
        () => addEvent(state, UC.alice, et.CONV_ADD__MEMBERS, {
            conversation_id: state.conversation_id,
            account_ids: [UC.angela.account_id, UC.donald.account_id],
        }),
        () => {
            state.r_header = UC.alice.matchStream({
                mk_rec_type: 'conv',
                conversation_id: state.r_request.identifier.conversation_id,
            });

            expect(UC.clean(state.r_header)).toMatchObject({
                conversation_id: '<conv:Test add members>',
                members: [
                    '<account:Alice Adamson>',
                    '<account:Angela Merkel>',
                    '<account:Bob Dylan>',
                    '<account:Donald Trump>'],
            });
            state.r_add_message = UC.alice.matchStream({
                mk_rec_type: 'message',
                conversation_id: state.r_request.identifier.conversation_id,
                mk_message_type: 'add',
            });
            expect(UC.clean(state.r_add_message)).toMatchObject({
                message: {
                    members:
                        ['<account:Angela Merkel>', '<account:Donald Trump>'],
                },
                message_nr: 3,
                mk_message_type: 'add',
                profile_id: '<account:Alice Adamson>',
            });
        },
    ]);
});
