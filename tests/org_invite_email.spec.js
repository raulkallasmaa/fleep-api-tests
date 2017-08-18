import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Michael Scofield',
    'Lincoln Burrows@',
    'Bob Dylan',
    'Ben Dover@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let business_sync_changelog = {
    "stream": [{
    "account_id": "<account:Lincoln Burrows>",
    "event_data": {
    "email_account_id": "<account:Lincoln Burrows>",
    "member_account_id": "<account:Lincoln Burrows>",
    },
    "event_time": "...",
    "event_type": "activate_member",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName>",
    "version_nr": 3,
    },
    {
    "account_id": "<account:Michael Scofield>",
    "event_data":  {
    "account_id": "<account:Michael Scofield>",
    "add_account_ids": [
    "<account:Lincoln Burrows>",
    ],
    },
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName>",
    "version_nr": 2,
    },
    {
    "account_id": "<account:Michael Scofield>",
    "event_data": {
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

let business_sync_changelog_2 = {
    "stream": [{
    "account_id": "<account:Ben Dover>",
    "event_data": {
    "email_account_id": "<account:Ben Dover>",
    "member_account_id": "<account:Ben Dover>",
    },
    "event_time": "...",
    "event_type": "activate_member",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName2>",
    "version_nr": 4,
    },
    {
    "account_id": "<account:Bob Dylan>",
    "event_data": {
    "account_id": "<account:Bob Dylan>",
    "add_account_ids": [
    "<account:Ben Dover>",
    ],
    },
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName2>",
    "version_nr": 2,
    },
    {
    "account_id": "<account:Bob Dylan>",
    "event_data": {
    "account_id": "<account:Bob Dylan>",
    "organisation_name": "organisationName2",
    },
    "event_time": "...",
    "event_type": "create_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName2>",
    "version_nr": 1,
    }],
};

test('join org via email invite', function () {
    let client = UC.michael;
    let conv_topic = 'joinViaEmail';
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

        // invite email user lincoln to org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [
                client.getRecord('contact', 'email', UC.lincoln.email).account_id]
        }),
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

        // prepare and confirm Lincoln's registration and joining the organisation
        () => UC.lincoln.raw_api_call("api/account/prepare/v2", {notification_id: nfid1}),
        (res) => UC.lincoln.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid1,
            display_name: UC.lincoln.info.display_name,
            password: UC.lincoln.password,
            fleep_address: res.suggestions[0]
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(business_sync_changelog)
    ]);
});

test('join org via reinvite notification id', function () {
    let client = UC.bob;
    let conv_topic = 'reinviteToOrg';
    let org_name = 'organisationName2';
    let nfid1 = null;
    let nfid2 = null;

    return thenSequence([
        // create conversation for the organisation
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // do a lookup for the email contacts
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ben.email], ignore_list: []}),

        // invite email user ben to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [
                client.getRecord('contact', 'email', UC.ben.email).account_id]
        }),

        () => UC.ben.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/,
        }),

        // get the notification id 1 from the link from the 1st email
        (res) => {
            let link1 = /https:[^\s]+/.exec(res.body)[0];
            nfid1 = /notification_id=([^=&]+)/.exec(link1)[1];
            return nfid1;
        },

        // reinvite email user ben to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.ben.email).account_id]
        }),

        () => UC.ben.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/,
        }),

        // get the notification id 2 from the link from the 2nd email
        (res) => {
            let link2 = /https:[^\s]+/.exec(res.body)[0];
            nfid2 = /notification_id=([^=&]+)/.exec(link2)[1];
            return nfid2;
        },

        // prepare and confirm Ben's registration and joining the organisation using notification id 2
        () => UC.ben.raw_api_call("api/account/prepare/v2", {notification_id: nfid2}),
        (res) => UC.ben.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid2,
            display_name: UC.ben.info.display_name,
            password: UC.ben.password,
            fleep_address: res.suggestions[0]
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(business_sync_changelog_2),
        // try to prepare using notification id 1
        () => UC.ben.raw_api_call("api/account/prepare/v2", {notification_id: nfid1})
            .then(() => Promise.reject(new Error('Notification expired.')),
                (r) => expect(r.statusCode).toEqual(431)),
        // try to prepare using notification id 2 again
        () => UC.ben.raw_api_call("api/account/prepare/v2", {notification_id: nfid2})
            .then(() => Promise.reject(new Error('Notification expired.')),
                (r) => expect(r.statusCode).toEqual(431)),
    ]);
});
