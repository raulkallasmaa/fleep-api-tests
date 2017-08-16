import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_after_create = {
   "grace_time": "...",
   "is_admin": true,
   "is_member": true,
   "mk_rec_type": "org_header",
   "organisation_founder_id": "<account:Charlie Chaplin>",
   "organisation_id": "<org:test-org-name>",
   "organisation_name": "test-org-name",
   "status": "bos_new",
   "trial_time": "...",
   "version_nr": 2,
};

let mels_reminder_active = {
   "account_id": "<account:Mel Gibson>",
   "creator_id": "<account:Charlie Chaplin>",
   "expire_time": "...",
   "is_active": true,
   "mk_rec_type": "reminder",
   "mk_reminder_type": "org_invite",
   "organisation_id": "<org:test-org-name>",
   "remind_time": "...",
   "reminder_id": "<reminder:org_invite>",
};

let mels_org_join = {
       "stream": [{
       "grace_time": "...",
       "is_admin": false,
       "is_member": true,
       "mk_rec_type": "org_header",
       "organisation_founder_id": "<account:Charlie Chaplin>",
       "organisation_id": "<org:test-org-name>",
       "organisation_name": "test-org-name",
       "status": "bos_new",
       "trial_time": "...",
       "version_nr": 3,
       },
       {
       "account_id": "<account:Mel Gibson>",
       "activated_time": "...",
       "client_flags": [
       "emoticons_old",
       "show_onboarding",
       ],
       "connected_email": "",
       "dialog_id": null,
       "display_name": "Mel Gibson",
       "email": "<email:Mel Gibson>",
       "export_files": [],
       "export_progress": "1",
       "fleep_address": "<fladdr:Mel Gibson>",
       "fleep_autogen": "<flautogen:Mel Gibson>",
       "has_password": true,
       "is_automute_enabled": true,
       "is_hidden_for_add": true,
       "is_premium": false,
       "mk_account_status": "active",
       "mk_email_interval": "never",
       "mk_rec_type": "contact",
       "organisation_id": "<org:test-org-name>",
       "storage_used_bytes": 0,
       "trial_end_time": "...",
       },
       {
       "account_id": "<account:Mel Gibson>",
       "creator_id": "<account:Charlie Chaplin>",
       "expire_time": "...",
       "is_active": false,
       "mk_rec_type": "reminder",
       "mk_reminder_type": "org_invite",
       "organisation_id": "<org:test-org-name>",
       "remind_time": "...",
       "reminder_id": "<reminder:org_invite>",
       }],
};

test('create org and invite via reminder', function () {
    let client = UC.charlie;
    let conv_topic = 'test-org-topic';
    let org_name = 'test-org-name';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => UC.mel.initial_poll(),
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => expect(UC.clean(client.getOrg(org_name))).toEqual(org_after_create),

        // get mel into org
        () => UC.mel.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => expect(UC.clean(reminder)).toEqual(mels_reminder_active),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.mel.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),
        (res) => expect(UC.clean(res)).toEqual(mels_org_join),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
        () => client.poke(client.getConvId(conv_topic)),

        // check that the emails for the closer and for the member are different
        () => client.waitMail({
            subject: /You deleted the Fleep for Business organization/,
            body: /You have successfully deleted the organization/,
        }),
        () => UC.mel.waitMail({
            subject: /has been deleted on Fleep/,
            body: /has deleted the organization/,
        }),
    ]);
});