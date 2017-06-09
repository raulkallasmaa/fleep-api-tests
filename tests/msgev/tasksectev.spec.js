import {UserCache, thenSequence} from '../../lib';
import {setupConv, addEvent, et} from './helpers';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test(`Test task sections`, function () {
    let state = {};
    return thenSequence([
        () => setupConv(state, 'Test task sections.', UC.alice, [UC.bob]),
        // add first user section
        () => addEvent(state, UC.alice, et.CONV_TASK_SECTION_ADD, {
            conversation_id: state.conversation_id,
            section_name: "My section",
        }),
        () => {
            state.r_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                conversation_id: state.r_request.identifier.conversation_id,
                section_id: state.r_request.identifier.section_id,
            });
            console.log(state.r_section);
            expect(UC.clean(state.r_section)).toEqual({
                conversation_id: '<conv:Test task sections.>',
                is_deleted: false,
                mk_rec_type: 'section',
                mk_section_subtype: 'urn:fleep:section:mk_section_subtype:user',
                mk_section_type: 'urn:fleep:section:mk_section_type:task',
                name: 'My section',
                section_id: '<section:My section>',
                weight: 4294901760,
            });
        },
        // add duplicate event
        () => state.client_req_id = state.r_request.client_req_id,
        () => addEvent(state, UC.alice, et.CONV_TASK_SECTION_ADD, {
            conversation_id: state.conversation_id,
            section_name: "My duplicate section",
        }),
        () => {
            state.r_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                conversation_id: state.r_request.identifier.conversation_id,
                section_id: state.r_request.identifier.section_id,
            });
            console.log(state.r_section);
            expect(UC.clean(state.r_section)).toEqual({
                conversation_id: '<conv:Test task sections.>',
                is_deleted: false,
                mk_rec_type: 'section',
                mk_section_subtype: 'urn:fleep:section:mk_section_subtype:user',
                mk_section_type: 'urn:fleep:section:mk_section_type:task',
                name: 'My section',
                section_id: '<section:My section>',
                weight: 4294901760,
            });
        },

        () => addEvent(state, UC.alice, et.CONV_TASK_SECTION_RENAME, {
            conversation_id: state.conversation_id,
            section_id: state.r_section.section_id,
            section_name: 'My renamed section',
        }),
        () => {
            state.r_section = UC.alice.matchStream({
                mk_rec_type: 'section',
                conversation_id: state.r_request.identifier.conversation_id,
                section_id: state.r_request.identifier.section_id,
            });
            expect(UC.clean(state.r_section)).toEqual({
                conversation_id: '<conv:Test task sections.>',
                is_deleted: false,
                mk_rec_type: 'section',
                mk_section_subtype: 'urn:fleep:section:mk_section_subtype:user',
                mk_section_type: 'urn:fleep:section:mk_section_type:task',
                name: 'My renamed section',
                section_id: '<section:My section>',
                weight: 4294901760,
            });
        },
    ]);
});
