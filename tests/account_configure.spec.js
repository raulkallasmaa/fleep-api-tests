import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy@',
    'Jon Lajoie@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('account configure parameters', function () {
    it('should change display name', function () {
        let conv_topic = 'displayName';
        return thenSequence([
            // create conv and add meg
            () => UC.bob.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.meg.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // set bob's display name to batman
            () => UC.bob.api_call("api/account/configure", {display_name: 'Batman'}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', display_name: 'Batman'}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', display_name: 'Batman'}),
            // check that bob sees his name as batman
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_hidden_for_add": true,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "never",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "trial_end_time": "...",
            }),
            () => UC.meg.poll_filter({mk_rec_type: 'contact', display_name: 'Batman'}),
            () => UC.meg.matchStream({mk_rec_type: 'contact', display_name: 'Batman'}),
            // check that meg sees bobs name as batman
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activity_time": "...",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "fleep_address": "<fladdr:Bob Marley>",
                "is_hidden_for_add": false,
                "mk_account_status": "active",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "sort_rank": 1,
            })
        ]);
    });

    it('should set new password', function () {

        return thenSequence([
            // set new password for bob
            () => UC.bob.api_call("api/account/configure", {
                old_password: UC.bob.password,
                password: UC.bob.password + 'dsgg54gfdg'
            }),
            // () => UC.bob.poll_filter({mk_rec_type: 'contact', password: UC.bob.password}),
            // () => UC.bob.matchStream({mk_rec_type: 'contact', password: UC.bob.password}),
            // (res) => expect(UC.clean(res)).toEqual({})
        ]);
    });

    it('should set phone number', function () {
        let conv_topic = 'phoneNumber';
        return thenSequence([
            // create conv and add jil
            () => UC.bob.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.jil.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // set a phone number for bob
            () => UC.bob.api_call("api/account/configure", {phone_nr: '12345'}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', phone_nr: '12345'}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', phone_nr: '12345'}),
            // check that bob sees his phone number
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_hidden_for_add": true,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "never",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "trial_end_time": "...",
            }),
            () => UC.meg.poll_filter({mk_rec_type: 'contact', phone_nr: '12345'}),
            () => UC.meg.matchStream({mk_rec_type: 'contact', phone_nr: '12345'}),
            // check that meg sees bobs phone number
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activity_time": "...",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "fleep_address": "<fladdr:Bob Marley>",
                "is_hidden_for_add": false,
                "mk_account_status": "active",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "sort_rank": 1,
            })
        ]);
    });

    it('should set email interval', function () {

        return thenSequence([
            // set bobs email interval to daily
            () => UC.bob.api_call("api/account/configure", {email_interval: 'daily'}),
            // () => UC.bob.poll_filter({mk_rec_type: 'contact', mk_email_interval: 'never'}),
            // () => UC.bob.matchStream({mk_rec_type: 'contact', mk_email_interval: 'never'}),
            // check that bobs email interval is daily
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_hidden_for_add": true,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "daily",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "trial_end_time": "...",
            })
        ]);
    });

    it('should set full privacy off', function () {

        return thenSequence([
            // set full privacy false for bob
            () => UC.bob.api_call("api/account/configure", {is_full_privacy: false}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', is_full_privacy: false}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', is_full_privacy: false}),
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_full_privacy": false,
                "is_hidden_for_add": true,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "daily",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "trial_end_time": "...",
            })
        ]);
    });

    it('should set newsletters on', function () {

        return thenSequence([
            // set newsletters on for bob
            () => UC.bob.api_call("api/account/configure", {is_newsletter_disabled: false}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', is_newsletter_disabled: false}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', is_newsletter_disabled: false}),
            // check that newsletters are enabled for bob
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": true,
                "is_full_privacy": false,
                "is_hidden_for_add": true,
                "is_newsletter_disabled": false,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "daily",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "trial_end_time": "...",
            })
        ]);
    });

    it('should set automute off', function () {

        return thenSequence([
            // set automute off for bob
            () => UC.bob.api_call("api/account/configure", {is_automute_enabled: false}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', is_automute_enabled: false}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', is_automute_enabled: false}),
            // check that automute is off for bob
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activated_time": "...",
                "client_flags": [
                    "emoticons_old",
                    "show_onboarding",
                    ],
                "connected_email": "",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Bob Marley>",
                "export_files": [],
                "export_progress": "1",
                "fleep_address": "<fladdr:Bob Marley>",
                "fleep_autogen": "<flautogen:Bob Marley>",
                "has_password": true,
                "is_automute_enabled": false,
                "is_full_privacy": false,
                "is_hidden_for_add": true,
                "is_newsletter_disabled": false,
                "is_premium": false,
                "mk_account_status": "active",
                "mk_email_interval": "daily",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "trial_end_time": "...",
            })
        ]);
    });
    //
    // it('should change client settings', function () {
    //
    //     return thenSequence([
    //         () => UC.bob.api_call("api/account/configure", {client_settings: }),
    //         (res) => expect(UC.clean(res)).toEqual({})
    //     ]);
    // });
    //
    it.skip('should set new primary email', function () { // alias_account_ids must be fixed with magic
        let conv_topic = 'newPrimaryEmail';
        return thenSequence([
            // create conv and add jil
            () => UC.bob.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.jil.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // add ron as bobs alias
            () => UC.bob.api_call("api/alias/add", {emails: UC.ron.email}),
            () => UC.ron.waitMail({
                subject: /Alternate email address/,
                body: /confirm it as your alternate email address/
            }),
            // get the notification id from the email
            (res) => {
                let link = /https:[^\s]+/.exec(res.body)[0];
                let nfid = /confirm_id=([^=&]+)/.exec(link)[1];
                return nfid;
            },
            // bob confirms ron as his alias
            (nfid) => UC.bob.api_call("api/alias/confirm", {notification_id: nfid}),
            () => UC.bob.api_call("api/alias/sync", {}),
            // bob sets his primary email to rons email
            () => UC.bob.api_call("api/account/configure", {primary_email: UC.ron.email}),
            () => UC.bob.poll_filter({mk_rec_type: 'contact', display_name: "Batman"}),
            () => UC.bob.matchStream({mk_rec_type: 'contact', display_name: "Batman"}),
            // check that bobs new primary email is rons email
            // alias_account_ids must be fixed with magic
            // (res) => expect(UC.clean(res)).toEqual({
            //     "account_id": "<account:Bob Marley>",
            //     "activated_time": "...",
            //     "alias_account_ids": [
            //         "<account:Bob Marley>",
            //         ],
            //     "client_flags": [
            //         "emoticons_old",
            //         "show_onboarding",
            //         ],
            //     "connected_email": "",
            //     "dialog_id": null,
            //     "display_name": "Batman",
            //     "email": "<email:Ron Jeremy>",
            //     "export_files": [],
            //     "export_progress": "1",
            //     "fleep_address": "<fladdr:Bob Marley>",
            //     "fleep_autogen": "<flautogen:Bob Marley>",
            //     "has_password": true,
            //     "is_automute_enabled": false,
            //     "is_full_privacy": false,
            //     "is_hidden_for_add": true,
            //     "is_newsletter_disabled": false,
            //     "is_premium": false,
            //     "mk_account_status": "active",
            //     "mk_email_interval": "daily",
            //     "mk_rec_type": "contact",
            //     "organisation_id": null,
            //     "phone_nr": "12345",
            //     "trial_end_time": "...",
            // }),
            () => UC.jil.poll_filter({mk_rec_type: 'contact', display_name: "Batman"}),
            () => UC.jil.matchStream({mk_rec_type: 'contact', display_name: "Batman"}),
            // jil checks that bobs new primary email is rons email
            (res) => expect(UC.clean(res)).toEqual({
                "account_id": "<account:Bob Marley>",
                "activity_time": "...",
                "dialog_id": null,
                "display_name": "Batman",
                "email": "<email:Ron Jeremy>",
                "fleep_address": "<fladdr:Bob Marley>",
                "is_hidden_for_add": false,
                "mk_account_status": "active",
                "mk_rec_type": "contact",
                "organisation_id": null,
                "phone_nr": "12345",
                "sort_rank": 1,
            })
        ]);
    });

    it.skip('should set fleep address', function () {
        let conv_topic = 'fleepAddress';
        return thenSequence([
            // do a lookup for jons email
            () => UC.bob.api_call("api/account/lookup", {lookup_list: [UC.jon.email], ignore_list: []}),
            // create conv and invite jon by email
            () => UC.bob.api_call("api/conversation/create", {
                topic: conv_topic,
                account_ids: [UC.bob.getRecord('contact', 'email', UC.jon.email).account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => UC.bob.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            () => UC.jon.waitMail({}),
            (res) => console.log(res)
            // () => UC.jon.raw_api_call("api/account/configure", {fleep_address: UC.jon.fleep_address}),
            // (res) => expect(UC.clean(res)).toEqual({})
        ]);
    });
});