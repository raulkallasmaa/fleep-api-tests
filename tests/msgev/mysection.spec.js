import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et, ms} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test section creation on my taskboard`, function () {
    let state = {};
    return thenSequence([
        // create a section
        () => addEvent(state, UC.alice, et.SECTION_MY__TASK_ADD, {
            section_name: 'MyTestSection',
        }),
        () => {
            state.r_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                section_id: state.r_request.identifier.section_id,
            });
            //expect(state.r_message1).toMatchObject({
            //    mk_message_state: ms.TODO,
            //    message: '<msg><p>TodoMessage1</p></msg>',
            //});
            console.log(state.r_section);
        },
    ]);
});
