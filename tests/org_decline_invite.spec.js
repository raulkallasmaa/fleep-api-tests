import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

let UC = new UserCache([
    'Michael Scofield',
    'Lincoln Burrows@',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_after_create = {
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Michael Scofield>",
    "organisation_id": "<org:organisationName>",
    "organisation_name": "organisationName",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 2,
};

let sync_changelog = {
    "stream": [{
    "account_id": "<account:Lincoln Burrows>",
        "event_data":  {
        "member_account_id": "<account:Lincoln Burrows>",
    },
    "event_time": "...",
        "event_type": "member_declines",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 3,
},
 {
    "account_id": "<account:Michael Scofield>",
        "event_data":  {
        "account_id": "<account:Michael Scofield>",
            "activate_account_ids": null,
            "add_account_ids": [
            "<account:Lincoln Burrows>",
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
    "account_id": "<account:Michael Scofield>",
        "event_data":  {
        "account_id": "<account:Michael Scofield>",
            "organisation_name": "organisationName",
    },
    "event_time": "...",
        "event_type": "create_org",
        "mk_rec_type": "org_changelog",
        "organisation_id": "<org:organisationName>",
        "version_nr": 1,
}]
};

test('decline org email invite', function () {
    let client = UC.michael;
    let conv_topic = 'declineInvite';
    let org_name = 'organisationName';
    let nfid1 = null;

    return thenSequence([
        // create conversation for the organisation
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // do a lookup for the email contacts
        () => client.api_call("api/account/lookup", {lookup_list: [UC.lincoln.email], ignore_list: []}),

        // add email users
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [
                client.getRecord('contact', 'email', UC.lincoln.email).account_id]
        }),
        () => expect(UC.clean(client.getOrg(org_name))).toEqual(org_after_create),
        () => UC.lincoln.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),

        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid1 = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid1;
        },

        // decline the email invite from the org
        () => UC.lincoln.raw_api_call("api/business/decline_invite/", {notification_id: nfid1}),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(/organisationName/), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog)
    ]);
});