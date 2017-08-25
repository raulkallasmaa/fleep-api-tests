import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Ben Dover',
    'Bill Clintill',
    'Jon Snow',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('invite fleep user to org and check that they get an email', function () {
    let client = UC.bob;
    let org_name = 'organisationName';

    return thenSequence([
        () => UC.ben.login(),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // do a lookup for the fleep user ben
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ben.email], ignore_list: []}),

        // invite fleep user ben to org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [
                client.getRecord('contact', 'email', UC.ben.email).account_id]
        }),
        // ben gets an email about the invite to the org
        () => UC.ben.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),

        // re-invite fleep user ben to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.ben.email).account_id]
        }),
        // ben gets an email about the invite to the org
        () => UC.ben.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),
    ]);
});

test('re-invite user velocity test', function () {
    let client = UC.jon;
    let org_name = 'organisationName2';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // do a lookup for the fleep user bill
        () => client.api_call("api/account/lookup", {lookup_list: [UC.bill.email], ignore_list: []}),

        // invite fleep user bill to org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        // bill gets an email about the invite to the org
        () => UC.bill.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),

        // re-invite fleep user bill to the org 6 times in a row till it hits velocity
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        }),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            reinvite_account_ids: [
                client.getRecord('contact', 'email', UC.bill.email).account_id]
        })
            .then(() => Promise.reject(new Error('Too many invite attempts per hour')),
                (r) => expect(r.statusCode).toEqual(431)),
    ]);
});
