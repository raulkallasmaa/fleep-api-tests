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
        },
    ]);
});
