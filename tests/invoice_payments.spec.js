import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('invoice payments test', function () {
    let client = UC.bob;
    let org_name = 'invoicePayments';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => UC.sysclient.sys_call("sys/business/start_invoice_payments", {
            organisation_id: client.getOrgId(org_name)
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "grace_time": "...",
            "invoice_payments": true,
            "is_admin": true,
            "is_member": true,
            "mk_rec_type": "org_header",
            "organisation_founder_id": "<account:Bob Marley>",
            "organisation_id": "<org:invoicePayments>",
            "organisation_name": "invoicePayments",
            "status": "bos_paying",
            "trial_time": "...",
            "version_nr": 2,
            "active_member_count": "...",
            },
            {
            "account_id": "<account:Bob Marley>",
            "is_admin": true,
            "mk_member_status": "bms_active",
            "mk_rec_type": "org_member",
            "organisation_id": "<org:invoicePayments>",
            }],
        }),
    ]);
});
