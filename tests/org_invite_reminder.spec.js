import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

let UC = new UserCache([
    'John Abruzzi',
    'Theodore Bagwell',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_after_create = {
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:John Abruzzi>",
    "organisation_id": "<org:organisationName>",
    "organisation_name": "organisationName",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 2,
};

let reminder_rec = {
   "account_id": "<account:Theodore Bagwell>",
   "creator_id": "<account:John Abruzzi>",
   "expire_time": "...",
   "is_active": true,
   "mk_rec_type": "reminder",
   "mk_reminder_type": "org_invite",
   "organisation_id": "<org:organisationName>",
   "remind_time": "...",
   "reminder_id": "<reminder:org_invite>",
};

let sync_changelog = {
   "stream": [
     {
       "account_id": "<account:Theodore Bagwell>",
       "event_data": {
         "member_account_id": "<account:Theodore Bagwell>",
       },
       "event_time": "...",
       "event_type": "activate_member",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:organisationName>",
       "version_nr": 3,
     },
     {
       "account_id": "<account:John Abruzzi>",
       "event_data": {
         "account_id": "<account:John Abruzzi>",
         "activate_account_ids": null,
         "add_account_ids": [
           "<account:Theodore Bagwell>",
         ],
         "add_admin_ids": null,
         "close_account_ids": null,
         "kick_account_ids": null,
         "organisation_name": null,
         "remove_account_ids": null,
         "remove_admin_ids": null,
         "suspend_account_ids": null,
       },
       "event_time": "...",
       "event_type": "configure_org",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:organisationName>",
       "version_nr": 2,
     },
     {
       "account_id": "<account:John Abruzzi>",
       "event_data": {
         "account_id": "<account:John Abruzzi>",
         "organisation_name": "organisationName",
       },
       "event_time": "...",
       "event_type": "create_org",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:organisationName>",
       "version_nr": 1,
     },
   ],
};

test('join org via invite', function () {
    let client = UC.john;
    let conv_topic = 'inviteReminder';
    let org_name = 'organisationName';

    return thenSequence([

        // create conversation for the organisation
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.theodore.account_id]}),
        () => expect(UC.clean(client.getOrg(org_name))).toEqual(org_after_create),

        // get theodore into org via event reminder
        () => UC.theodore.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.theodore.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => expect(UC.clean(res)).toEqual(reminder_rec),
        () => UC.theodore.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.theodore.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: res.reminder_id}),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(/organisationName/), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog),
    ]);
});
