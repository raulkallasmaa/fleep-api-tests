import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Fernando Sucre',
    'Alex Mahone',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let sync_changelog = {
   "stream": [{
   "account_id": "<account:Alex Mahone>",
   "event_data": {
   "member_account_id": "<account:Alex Mahone>",
   },
   "event_time": "...",
   "event_type": "member_declines",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:organisationName>",
   "version_nr": 3,
   },
   {
   "account_id": "<account:Fernando Sucre>",
   "event_data": {
   "account_id": "<account:Fernando Sucre>",
   "add_account_ids": [
   "<account:Alex Mahone>",
   ],
   },
   "event_time": "...",
   "event_type": "configure_org",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:organisationName>",
   "version_nr": 2,
   },
   {
   "account_id": "<account:Fernando Sucre>",
   "event_data": {
   "account_id": "<account:Fernando Sucre>",
   "organisation_name": "organisationName",
   },
   "event_time": "...",
   "event_type": "create_org",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:organisationName>",
   "version_nr": 1,
   }],
};

test('decline org invite reminder', function () {
    let client = UC.fernando;
    let conv_topic = 'declineReminder';
    let org_name = 'organisationName';

    return thenSequence([
        () => UC.alex.initial_poll(),
        // create conversation for the organisation
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // send alex invite reminder
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.alex.account_id]}),
        () => UC.alex.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.alex.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name), account_id: UC.alex.account_id}),
        (res) => UC.alex.api_call("api/account/click_reminder", {reminder_id: res.reminder_id}),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(/organisationName/), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog),
    ]);
});