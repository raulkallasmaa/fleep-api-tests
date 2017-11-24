import {UserCache, thenSequence} from '../lib';
import {waitAsync} from "../lib/utils";

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin@',
    'Ben Dover',
    'Don Johnson@',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('active member count tests', function () {
    let client = UC.bob;
    let org_name = 'activeMemberCount';
    let nfid = null;
    let nfid2 = null;

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // do a lookup for the email user meg
        () => client.api_call("api/account/lookup", {lookup_list: [UC.meg.email], ignore_list: []}),
        // invite email user meg to org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [client.getRecord('contact', 'email', UC.meg.email).account_id]
        }),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // meg receives the org invite through email
        () => UC.meg.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),
        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },
        // prepare and confirm meg's registration and joining the organisation
        () => UC.meg.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.meg.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.meg.info.display_name,
            password: UC.meg.password,
            fleep_address: res.suggestions[0]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(2),
        // suspend meg's account
        () => client.api_call("api/account/lookup", {lookup_list: [UC.meg.email], ignore_list: []}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            suspend_account_ids: [client.getContact(UC.meg.info.display_name).account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // activate meg's account
        () => client.api_call("api/account/lookup", {lookup_list: [UC.meg.email], ignore_list: []}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            activate_account_ids: [client.getContact(UC.meg.info.display_name).account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(2),
        // remove meg from the org
        () => client.api_call("api/account/lookup", {lookup_list: [UC.meg.email], ignore_list: []}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            remove_account_ids: [client.getContact(UC.meg.info.display_name).account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // invite fleep user ben to the org
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ben.email], ignore_list: []}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.ben.account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // ben declines the org invite
        () => UC.ben.api_call('api/account/sync_reminders'),
        () => UC.ben.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.ben.api_call("api/account/click_reminder", {reminder_id: res.reminder_id}),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // do a lookup for the email contact don
        () => client.api_call("api/account/lookup", {lookup_list: [UC.don.email], ignore_list: []}),
        // invite email user don to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [client.getRecord('contact', 'email', UC.don.email).account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        () => waitAsync(10 * 1000),
        () => UC.don.waitMail({
            subject: /Invitation to/,
            body: /invites you to join the organization/
        }),
        // get the notification id from the link from the email
        (res) => {
            let link2 = /https:[^\s]+/.exec(res.body)[0];
            nfid2 = /notification_id=([^=&]+)/.exec(link2)[1];
            return nfid2;
        },
        // don declines the email invite from the org
        () => UC.don.raw_api_call("api/business/decline_invite/", {notification_id: nfid2}),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // do a lookup for jon
        () => client.api_call("api/account/lookup", {lookup_list: [UC.jon.email], ignore_list: []}),
        // invite fleep user jon to the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.jon.account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // jon joins the org
        () => UC.jon.api_call('api/account/sync_reminders'),
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.jon.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.jon.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: res.reminder_id}),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(2),
        // kick jon from the org
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            kick_account_ids: [UC.jon.account_id]
        }),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(1),
        // close the org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
        () => client.api_call("api/business/sync/" + client.getOrgId(org_name)),
        () => expect(client.getOrg(org_name).active_member_count).toEqual(0),
    ]);
});
