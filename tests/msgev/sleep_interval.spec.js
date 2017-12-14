import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test.skip(`Test mk_event_type="${et.ACCOUNT_SET__SLEEP__INTERVAL}"`, function () {
    let state = {};
    return thenSequence([
        () => addEvent(state, UC.alice, et.ACCOUNT_SET__SLEEP__INTERVAL, {
            sleep_interval: 0,
        }),
        () => {
            state.r_account = UC.alice.matchStream({
                mk_rec_type: 'contact',
                account_id: state.r_request.identifier.account_id,
            });
            expect(state.r_account).toMatchObject({
                sleep_interval: 0,
            });
        },
        () => addEvent(state, UC.alice, et.ACCOUNT_SET__SLEEP__INTERVAL, {
            sleep_interval: 1,
        }),
        () => {
            state.r_account = UC.alice.matchStream({
                mk_rec_type: 'contact',
                account_id: state.r_request.identifier.account_id,
            });
            expect(state.r_account).toMatchObject({
                sleep_interval: 1,
            });
        },
        () => addEvent(state, UC.alice, et.ACCOUNT_SET__SLEEP__INTERVAL, {
            sleep_interval: 100,
        }, true),
        () => {
            expect(state.r_request).toMatchObject({
                status_code: 400,
                error_message: 'Invalid sleep interval.',
            });
        },
    ]);
});
