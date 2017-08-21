import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy@',
    'Jon Lajoie@',
    'King Kong@',
    'Bill Clinton',
    'Indiana Jones',
    'Mel Gibson@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test.skip('account/register/v2 resend registration code email', function () {
    let code1 = null;
    let code2 = null;
    return thenSequence([
        // register mel as new fleep account
        () => UC.mel.raw_api_call('api/account/register', {
            email: UC.mel.email,
            display_name: UC.mel.display_name,
            password: UC.mel.password,
            use_code: true,
        }),
        // mel gets registration code 1 on his email
        () => UC.mel.waitMail({subject: /Fleep confirmation code/}),
        (msg1) => {
            code1 = msg1.subject.split(': ')[1].replace('/-/g', '');
            return code1;
        },
        // trigger registration code email
        () => UC.mel.raw_api_call("api/account/register/v2", {email: UC.mel.email}),
        // mel gets registration code 2 on his email
        () => UC.mel.waitMail({subject: /Fleep confirmation code/}),
        (msg2) => {
            code2 = msg2.subject.split(': ')[1].replace('/-/g', '');
            return code2;
        },
        // use code2 to prepare mels account registration
        () => UC.mel.raw_api_call('api/account/prepare/v2', {
            registration_mail: UC.mel.email,
            registration_code: code2
        }),
        // !!! CODE1 SHOULDN'T WORK NOW THAT CODE2 HAS BEEN USED TO PREPARE ACCOUNT ALREADY! BUG, NEEDS TO BE FIXED !!!
        () => UC.mel.raw_api_call('api/account/prepare/v2', {
            registration_mail: UC.mel.email,
            registration_code: code1
        }),
    ]);
});

test('account/configure change display name', function () {
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
            "storage_used_bytes": 0,
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

test('account/configure set new password', function () {
    return thenSequence([
        // set new password for bob
        () => UC.bob.api_call("api/account/configure", {
            old_password: UC.bob.info.password,
            password: UC.bob.info.password + 'dsgg54gfdg'
        }),
        () => UC.bob.logout(),
        () => UC.bob.password = UC.bob.info.password + 'dsgg54gfdg',
        () => UC.bob.login(),
    ]);
});

test('account/configure set phone number', function () {
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
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
            "has_password": true,
            "is_automute_enabled": true,
            "is_hidden_for_add": true,
            "is_premium": false,
            "mk_account_status": "active",
            "mk_email_interval": "never",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "12345",
            "storage_used_bytes": 0,
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
            "fleep_address": "<fladdr:Batman>",
            "is_hidden_for_add": false,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "12345",
            "sort_rank": 1,
        })
    ]);
});

test('account/configure set email interval', function () {
    return thenSequence([
        // set bobs email interval to daily
        () => UC.bob.api_call("api/account/configure", {email_interval: 'daily'}),
        () => UC.bob.poll_filter({mk_rec_type: 'contact', mk_email_interval: 'daily'}),
        () => UC.bob.matchStream({mk_rec_type: 'contact', mk_email_interval: 'daily'}),
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
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
            "has_password": true,
            "is_automute_enabled": true,
            "is_hidden_for_add": true,
            "is_premium": false,
            "mk_account_status": "active",
            "mk_email_interval": "daily",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "12345",
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        })
    ]);
});

test('account/configure set full privacy off', function () {
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
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
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
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        })
    ]);
});

test('account/configure set newsletters on', function () {
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
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
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
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        })
    ]);
});

test('account/configure set automute off', function () {
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
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
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
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        })
    ]);
});

test('account/configure change client settings', function () {
    return thenSequence([
        () => UC.indiana.api_call("api/account/configure", {client_settings: '{"phone_nr": "12345"}'}),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Indiana Jones>",
            "activated_time": "...",
            "client_flags": [
            "emoticons_old",
            "show_onboarding",
            ],
            "client_settings": "{\"phone_nr\":\"12345\"}",
            "connected_email": "",
            "dialog_id": null,
            "display_name": "Indiana Jones",
            "email": "<email:Indiana Jones>",
            "export_files": [],
            "export_progress": "1",
            "fleep_address": "<fladdr:Indiana Jones>",
            "fleep_autogen": "<flautogen:Indiana Jones>",
            "has_password": true,
            "is_automute_enabled": true,
            "is_hidden_for_add": true,
            "is_premium": false,
            "mk_account_status": "active",
            "mk_email_interval": "never",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        })
    ]);
});

test('account/configure set new primary email', function () {
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
        // bob sets his primary email to rons email
        () => UC.bob.api_call("api/account/configure", {primary_email: UC.ron.email}),
        (res) => UC.bob.cache_add_stream([res]),
        () => UC.bob.api_call("api/alias/sync", {}),
        () => UC.bob.api_call("api/contact/sync", {contact_id: UC.bob.account_id}),
        () => UC.bob.poll_filter({mk_rec_type: 'contact', account_id: UC.bob.account_id}),
        () => UC.bob.matchStream({mk_rec_type: 'contact', account_id: UC.bob.account_id}),
        // check that bobs new primary email is rons email
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "activated_time": "...",
            "alias_account_ids": [
            "<account:Bob Marley>",
            ],
            "client_flags": [
            "emoticons_old",
            "show_onboarding",
            ],
            "connected_email": "",
            "dialog_id": null,
            "display_name": "Batman",
            "email": "<email:Ron Jeremy>",
            "export_files": [],
            "export_progress": "1",
            "fleep_address": "<fladdr:Batman>",
            "fleep_autogen": "<flautogen:Batman>",
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
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        }),
        () => UC.jil.poll_filter({mk_rec_type: 'contact', account_id: UC.bob.account_id}),
        () => UC.jil.matchStream({mk_rec_type: 'contact', account_id: UC.bob.account_id}),
        // jil checks that bobs new primary email is rons email
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "activity_time": "...",
            "dialog_id": null,
            "display_name": "Batman",
            "email": "<email:Ron Jeremy>",
            "fleep_address": "<fladdr:Batman>",
            "is_hidden_for_add": false,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "12345",
            "sort_rank": 1,
        })
    ]);
});

test('account/configure register new fleep user and set fleep address', function () {
    return thenSequence([
        // register jon as new fleep account
        () => UC.jon.raw_api_call('api/account/register', {
        email: UC.jon.email,
        display_name: UC.jon.display_name,
        password: UC.jon.password,
        use_code: true}),
        () => UC.jon.waitMail({subject: /Fleep confirmation code/}),
        (msg) => {
            let code = msg.subject.split(': ')[1].replace('/-/g', '');
            return code;
        },
        (code) => UC.jon.raw_api_call('api/account/prepare/v2', {
            registration_mail: UC.jon.email,
            registration_code: code
        }),
        // set a fleep address(randomly generated every time) for jon
        (res) => UC.jon.raw_api_call('api/account/confirm/v2', {
            notification_id: res.notification_id,
            password: UC.jon.password,
            display_name: UC.jon.display_name,
            fleep_address: UC.jon.info.fleep_address
        }),
        () => UC.jon.poll_filter({mk_rec_type: 'contact', email: UC.jon.email}),
        () => UC.jon.matchStream({mk_rec_type: 'contact', email: UC.jon.email}),
        // check that jon sees his fleep address
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Jon Lajoie>",
            "activated_time": "...",
            "client_flags": [
            "emoticons_old",
            "show_onboarding",
            ],
            "connected_email": "",
            "dialog_id": null,
            "display_name": "Jon Lajoie",
            "email": "<email:Jon Lajoie>",
            "export_files": [],
            "export_progress": "1",
            "fleep_address": "<fladdr:Jon Lajoie>",
            "fleep_autogen": "<flautogen:Jon Lajoie>",
            "has_password": true,
            "is_automute_enabled": true,
            "is_hidden_for_add": true,
            "is_premium": false,
            "mk_account_status": "active",
            "mk_email_interval": "hourly",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "storage_used_bytes": 0,
            "trial_end_time": "...",
        }),
        // meg searches for jon and sees his fleep address
        () => UC.meg.api_call("api/account/lookup", {lookup_list: [UC.jon.fleep_email], ignore_list: []}),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "account_id": "<account:Jon Lajoie>",
            "avatar_urls": null,
            "display_name": "Jon Lajoie",
            "fleep_address": "<fladdr:Jon Lajoie>",
            "is_in_org": false,
            "mk_account_status": "active",
            "mk_rec_type": "contact"}]
        })
    ]);
});

test('account/configure try to register new fleep user with already taken fleep address', function () {
    return thenSequence([
        // register king as new fleep account
        () => UC.king.raw_api_call('api/account/register', {
            email: UC.king.email,
            display_name: UC.king.display_name,
            password: UC.king.password,
            use_code: true}),
        () => UC.king.waitMail({subject: /Fleep confirmation code/}),
        (msg) => {
            let code = msg.subject.split(': ')[1].replace('/-/g', '');
            return code;
        },
        (code) => UC.king.raw_api_call('api/account/prepare/v2', {
            registration_mail: UC.king.email,
            registration_code: code
        }),
        // king tries to set megs fleep address as his own
        (res) => UC.king.raw_api_call('api/account/confirm/v2', {
            notification_id: res.notification_id,
            password: UC.king.password,
            display_name: UC.king.display_name,
            fleep_address: UC.meg.info.fleep_address
        })
        .then(() => Promise.reject(new Error('Business logic error: Fleep address not available!')),
            (r) => expect(r.statusCode).toEqual(431)),
    ]);
});

test('account/configure try to set new fleep address', function () {
   return thenSequence([
       // bill tries to change his own fleep address but gets an error: fleep address limit exceeded
       () => UC.bill.initial_poll(),
       () => UC.bill.api_call("api/account/configure", {fleep_address: UC.bill.info.fleep_address + '5'})
           .then(() => Promise.reject(new Error('Business logic error: Fleep address limit exceeded!')),
               (r) => expect(r.statusCode).toEqual(431)),
   ]);
});