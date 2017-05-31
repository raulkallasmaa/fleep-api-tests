import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_after_create = {
    "stream": [{
        "is_admin": true,
        "is_member": true,
        "mk_rec_type": "org_header",
        "organisation_founder_id": "<account:Meg Griffin>",
        "organisation_id": "<org:organisationName1>",
        "organisation_name": "organisationName1",
        "status": "bos_new",
        "trial_time": "...",
        "version_nr": 2,
    },
    {
        "account_id": "<account:Don Johnson>",
        "inviter_id": "<account:Meg Griffin>",
        "is_admin": false,
        "mk_member_status": "bms_pending",
        "mk_rec_type": "org_member",
        "organisation_id": "<org:organisationName1>",
    },
    {
        "account_id": "<account:Ron Jeremy>",
        "inviter_id": "<account:Meg Griffin>",
        "is_admin": true,
        "mk_member_status": "bms_pending",
        "mk_rec_type": "org_member",
        "organisation_id": "<org:organisationName1>",
    },
]};

let conv_after_create = {
    "stream": [{
    "admins": [
        "<account:Meg Griffin>",
        ],
        "autojoin_url": "<autojoin:sharedManagedConv>",
        "cmail": "<cmail:sharedManagedConv>",
        "conversation_id": "<conv:sharedManagedConv>",
        "creator_id": "<account:Meg Griffin>",
        "default_members": [],
        "guests": [],
        "has_email_subject": false,
        "is_deletable": true,
        "is_list": true,
        "is_managed": true,
        "leavers": [],
        "managed_time": "...",
        "members": [
            "<account:Jil Smith>",
            "<account:Jon Lajoie>",
            "<account:Meg Griffin>",
            "<account:Ron Jeremy>",
        ],
        "mk_conv_type": "cct_list",
        "mk_rec_type": "org_conv",
        "organisation_id": "<org:organisationName1>",
        "teams": [],
        "topic": "sharedManagedConv",
}]};

let jon_conv_admin = {
    "stream": [{
    "admins": [
        "<account:Jon Lajoie>",
        "<account:Meg Griffin>",
        ],
        "autojoin_url": "<autojoin:sharedManagedConv>",
        "cmail": "<cmail:sharedManagedConv>",
        "conversation_id": "<conv:sharedManagedConv>",
        "creator_id": "<account:Meg Griffin>",
        "default_members": [],
        "guests": [],
        "has_email_subject": false,
        "is_deletable": true,
        "is_list": true,
        "is_managed": true,
        "leavers": [],
        "managed_time": "...",
        "members": [
            "<account:Don Johnson>",
            "<account:Jil Smith>",
            "<account:Jon Lajoie>",
            "<account:Meg Griffin>",
            "<account:Ron Jeremy>",
        ],
        "mk_conv_type": "cct_list",
        "mk_rec_type": "org_conv",
        "organisation_id": "<org:organisationName1>",
        "teams": [],
        "topic": "sharedManagedConv",
}]};

let all_in_conv = {
    "stream": [{
    "admins": [
        "<account:Jon Lajoie>",
        "<account:Meg Griffin>",
        ],
        "autojoin_url": "<autojoin:sharedManagedConv>",
        "cmail": "<cmail:sharedManagedConv>",
        "conversation_id": "<conv:sharedManagedConv>",
        "creator_id": "<account:Meg Griffin>",
        "default_members": [],
        "guests": [],
        "has_email_subject": false,
        "is_deletable": true,
        "is_list": true,
        "is_managed": true,
        "leavers": [],
        "managed_time": "...",
        "members": [
        "<account:Bob Marley>",
            "<account:Don Johnson>",
            "<account:Jil Smith>",
            "<account:Jon Lajoie>",
            "<account:Meg Griffin>",
            "<account:Ron Jeremy>",
        ],
        "mk_conv_type": "cct_list",
        "mk_rec_type": "org_conv",
        "organisation_id": "<org:organisationName1>",
        "teams": [],
        "topic": "sharedManagedConv",
}],
"sync_cursor": "{}",
};

test('two orgs and one shared managed conv between them', function () {
    let conv_topic = 'sharedManagedConv';
    let org_name1 = 'organisationName1';
    let org_name2 = 'organisationName2';

    return thenSequence([
        // meg creates org and adds ron and don
        () => UC.jon.initial_poll(),
        () => UC.meg.api_call("api/business/create", {organisation_name: org_name1}),
        () => UC.meg.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name1}),
        () => UC.meg.api_call("api/business/configure/" + UC.meg.getOrgId(org_name1), {
            add_account_ids: [UC.ron.account_id, UC.don.account_id],
            add_admin_ids: [UC.ron.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(org_after_create),

        // ron accepts org invite
        () => UC.ron.poll_filter({mk_rec_type: 'reminder', organisation_id: UC.meg.getOrgId(org_name1)}),
        () => UC.ron.matchStream({mk_rec_type: 'reminder', organisation_id: UC.meg.getOrgId(org_name1)}),
        (res) => UC.ron.api_call("api/business/join/" + UC.meg.getOrgId(org_name1), {reminder_id: res.reminder_id}),

        // jil creates org and adds jon and bob
        () => UC.jil.api_call("api/business/create", {organisation_name: org_name2}),
        () => UC.jil.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name2}),
        () => UC.jil.api_call("api/business/configure/" + UC.jil.getOrgId(org_name2), {
            add_account_ids: [UC.jon.account_id, UC.bob.account_id],
            add_admin_ids: [UC.jon.account_id, UC.jil.account_id]}),

        // jon accepts org invite
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: UC.jil.getOrgId(org_name2)}),
        () => UC.jon.matchStream({mk_rec_type: 'reminder', organisation_id: UC.jil.getOrgId(org_name2)}),
        (res) => UC.jon.api_call("api/business/join/" + UC.jil.getOrgId(org_name2), {reminder_id: res.reminder_id}),

        // meg creates managed conv and adds ron, jil and jon
        () => UC.meg.api_call("api/business/create_conversation/" + UC.meg.getOrgId(org_name1), {
            topic: conv_topic,
            account_ids: [UC.ron.account_id, UC.jil.account_id, UC.jon.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(conv_after_create),

        // !!! ron isn't authorized to add don to conv even if he is org1 member and conv admin !!!

        // ron adds don to conv
        () => UC.meg.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.ron.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            add_account_ids: [UC.don.account_id]}),

        // jil tries to add bob
        () => UC.meg.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jil.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            add_account_ids: [UC.bob.account_id]})
            .then(() => Promise.reject(new Error('Unauthorized!')),
                 (r) => expect(r.statusCode).toEqual(401)),

        // meg sets jon as conv admin
        () => UC.meg.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            admins: [UC.jon.account_id, UC.meg.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(jon_conv_admin),

        // jon isn't authorized to add bob to conv. jon is org2 admin and conv admin
        () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jon.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            add_account_ids: [UC.bob.account_id]})
            .then(() => Promise.reject(new Error('Unauthorized!')),
                (r) => expect(r.statusCode).toEqual(401)),

        // // meg adds bob to conv
        () => UC.meg.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.meg.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            add_account_ids: [UC.bob.account_id]}),

        // meg checks that all 6 members are in the managed conv
        () => UC.meg.api_call("api/business/sync_conversations/" + UC.meg.getOrgId(org_name1), {}),
        (res) => expect(UC.clean(res)).toEqual(all_in_conv)
    ]);
});
