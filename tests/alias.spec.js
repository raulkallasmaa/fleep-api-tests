import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Snoop Dogg',
    'Michael Jackson@',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

it('should add, confirm, remove and sync alias', function () {
    let client = UC.snoop;
    let client2 = UC.michael;
    return thenSequence([
        () => client.api_call("api/alias/add", {emails: client2.email}),
        () => client2.waitMail({
            subject: /Alternate email address/,
            body: /confirm it as your alternate email address/
        }),
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            let nfid = /confirm_id=([^=&]+)/.exec(link)[1];
            //expect({link:link, nfid:nfid}).toEqual({});
            return nfid;
        },
        (nfid) => client.api_call("api/alias/confirm", {notification_id: nfid}),
        () => client.api_call("api/alias/remove", {emails: client2.email}),
        () => client.api_call("api/alias/sync", {}),
        (res) => expect(UC.clean((res))).toEqual({
            "failed": null,
            "stream": [{
                "account_id": "<account:Snoop Dogg>",
                "activated_time": "...",
                "alias_account_ids": [],
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Snoop Dogg",
                "email": "<email:Snoop Dogg>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Snoop Dogg>",
                "fleep_autogen": "<flautogen:Snoop Dogg>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_hidden_for_add": true,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "never",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "trial_end_time": "...",
            }],
        }),
    ]);
});