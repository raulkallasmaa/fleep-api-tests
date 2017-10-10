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

let meg_is_admin = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:businessConfigure>",
    "organisation_name": "businessConfigure",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 3,
    "active_member_count": "...",
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    }],
};

let meg_not_admin = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:businessConfigure>",
    "organisation_name": "businessConfigure",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 5,
    "active_member_count": "...",
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    }],
};

let meg_account_closed = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:businessConfigure>",
    "organisation_name": "businessConfigure",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 6,
    "active_member_count": "...",
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_closed",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    }],
};

let jil_account_suspended = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:businessConfigure>",
    "organisation_name": "businessConfigure",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 8,
    "active_member_count": "...",
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_suspended",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_closed",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_closed",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    }],
};

let jil_account_activated = {
    "stream": [{
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:businessConfigure>",
    "organisation_name": "businessConfigure",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 9,
    "active_member_count": "...",
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_closed",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_closed",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:businessConfigure>",
    }],
};

let org_changelog = {
    "stream": [{
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "organisation_name": "newBusinessConfigure",
    },
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 10,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "activate_account_ids": [
    "<account:Jil Smith>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 9,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "suspend_account_ids": [
    "<account:Jil Smith>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 8,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "close_account_ids": [
    "<account:Jon Lajoie>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 7,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "close_account_ids": [
    "<account:Meg Griffin>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 6,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "remove_admin_ids": [
    "<account:Meg Griffin>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 5,
    },
    {
    "account_id": "<account:Meg Griffin>",
    "event_data": {
    "member_account_id": "<account:Meg Griffin>",
    },
    "event_time": "...",
    "event_type": "activate_member",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 4,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "add_admin_ids": [
    "<account:Meg Griffin>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 3,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "add_account_ids": [
    "<account:Jil Smith>",
    "<account:Jon Lajoie>",
    "<account:Meg Griffin>",
    ]},
    "event_time": "...",
    "event_type": "configure_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 2,
    },
    {
    "account_id": "<account:Bob Marley>",
    "event_data": {
    "account_id": "<account:Bob Marley>",
    "organisation_name": "businessConfigure",
    },
    "event_time": "...",
    "event_type": "create_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:businessConfigure>",
    "version_nr": 1,
    }]
};

test('business configure parameters', function () {
    let client = UC.bob;
    let org_name = 'businessConfigure';
    let org_name2 = 'newBusinessConfigure';
    return thenSequence([
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: '<my_ip>',
            mk_time_action: 'clear_reset_velo',
        }),

        () => UC.meg.initial_poll(),
        () => UC.jil.initial_poll(),

        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // promote meg to org admin
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.meg.account_id, UC.jil.account_id, UC.jon.account_id],
            add_admin_ids: [UC.meg.account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual(meg_is_admin),

        // meg joins the org
        () => UC.meg.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.meg.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),

        // remove admin rights from meg
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            remove_admin_ids: [UC.meg.account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual(meg_not_admin),

        // close megs org account
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            close_account_ids: [UC.meg.account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual(meg_account_closed),

        // check that meg got an email for closed account
        () => UC.meg.waitMail({
            subject: /Your Fleep account has been deleted/,
            body: /has deleted your Fleep account/,
        }),

        // close johns org account
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            close_account_ids: [UC.jon.account_id]
        }),

        // jon tries to join the org after his account has been closed
        () => UC.jon.login(),
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)})
            .then(() => Promise.reject(new Error('Unauthorized - Expired token, please relogin.')),
                (r) => expect(r.statusCode).toEqual(401)),

        // suspend jils account
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            suspend_account_ids: [UC.jil.account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual(jil_account_suspended),

        // activate jils account
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            activate_account_ids: [UC.jil.account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual(jil_account_activated),

        // change orgs name
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {organisation_name: org_name2}),
        () => client.getRecord('org_header', 'organisation_name', org_name2),
        (res) => expect(UC.clean(res.organisation_name)).toEqual(org_name2),

        // sync org changelog
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name2), {}),
        (res) => expect(UC.clean(res)).toEqual(org_changelog),
    ]);
});
