import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org1_admin_sync = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:organisationSync1>",
    "organisation_name": "organisationSync1",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 1,
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:organisationSync1>",
    },
    {
    "mk_rec_type": "billing",
    "organisation_id": "<org:organisationSync1>",
    }]
};

let org2_admin_sync = {
    "stream": [{
    "grace_time": "...",
    "is_member": false,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:organisationSync1>",
    "organisation_name": "organisationSync1",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 1,
    }]
};

let org1_member_sync = {
    "stream": [{
    "grace_time": "...",
    "is_member": false,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:organisationSync1>",
    "organisation_name": "organisationSync1",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 1,
    }]
};

let org2_member_sync = {
    "stream": [{
    "grace_time": "...",
    "is_member": false,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:organisationSync1>",
    "organisation_name": "organisationSync1",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 1,
    }]
};

let non_member_sync = {
    "stream": [{
        "grace_time": "...",
        "is_member": false,
        "mk_rec_type": "org_header",
        "organisation_founder_id": "<account:Bob Marley>",
        "organisation_id": "<org:organisationSync1>",
        "organisation_name": "organisationSync1",
        "status": "bos_new",
        "trial_time": "...",
        "version_nr": 1,
    }]
};

test('organisation sync should return full sync only for active org admins', function () {
    let org_name1 = 'organisationSync1';
    let org_name2 = 'organisationSync2';

    return thenSequence([
        // create org1 and add meg, jil
        () => UC.bob.api_call("api/business/create", {
            organisation_name: org_name1,
            add_account_ids: [UC.meg.account_id, UC.jil.account_id]
        }),
        () => UC.bob.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name1}),
        // check that org1 active admin bob can see the entire sync log(header, members)
        () => UC.bob.api_call("api/business/sync/" + UC.bob.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(org1_admin_sync),

        // create org2 and add ron, jon
        () => UC.don.api_call("api/business/create", {
            organisation_name: org_name2,
            add_account_ids: [UC.ron.account_id, UC.jon.account_id]
        }),
        () => UC.don.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name2}),
        // check that org2 active admin don can only see the header sync log for org1
        () => UC.don.api_call("api/business/sync/" + UC.bob.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(org2_admin_sync),

        // check that org1 member meg can only see the header sync log for org1
        () => UC.meg.api_call("api/business/sync/" + UC.bob.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(org1_member_sync),

        // check that org2 member jon can only see the header sync log for org1
        () => UC.jon.api_call("api/business/sync/" + UC.bob.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(org2_member_sync),

        // check that non member can only see the header sync log for org1
        () => UC.bill.api_call("api/business/sync/" + UC.bob.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(non_member_sync),
    ]);
});
