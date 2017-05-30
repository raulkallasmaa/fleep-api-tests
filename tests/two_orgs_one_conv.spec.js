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

test('two orgs and one shared managed conv between them', function () {
    let conv_topic = 'sharedManagedConv';
    let org_name1 = 'organisationName1';
    let org_name2 = 'organisationName2';

    return thenSequence([
        // meg creates org and adds ron and don
        () => UC.meg.api_call("api/business/create", {organisation_name: org_name1}),
        () => UC.meg.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name1}),
        () => UC.meg.api_call("api/business/configure/" + UC.meg.getOrgId(org_name1), {
            add_account_ids: [UC.ron.account_id, UC.don.account_id]}),

        // jil creates org and adds jon and bob
        () => UC.jil.api_call("api/business/create", {organisation_name: org_name2}),
        () => UC.jil.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name2}),
        () => UC.jil.api_call("api/business/configure/" + UC.jil.getOrgId(org_name2), {
            add_account_ids: [UC.jon.account_id, UC.bob.account_id]}),

        // meg creates managed conv and adds ron, jil and jon
        () => UC.meg.api_call("api/business/create_conversation/" + UC.meg.getOrgId(org_name1), {
            topic: conv_topic,
            account_ids: [UC.ron.account_id, UC.jil.account_id, UC.jon.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(conv_after_create),

        // ron tries to add don
        () => UC.meg.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.ron.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.meg.getConvId(conv_topic),
            add_account_ids: [UC.don.account_id]})
            .then(() => Promise.reject(new Error('Unauthorized!')),
                (r) => expect(r.statusCode).toEqual(401)),

        // jil tries to add bob
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

        // jon adds bob and don to conv
        () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jon.api_call("api/business/store_conversation/" + UC.meg.getOrgId(org_name1), {
            conversation_id: UC.jon.getConvId(conv_topic),
            add_account_ids: [UC.don.account_id, UC.bob.account_id]}),
    ]);
});