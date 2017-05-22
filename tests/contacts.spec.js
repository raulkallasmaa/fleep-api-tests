import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
    'Donald Trump@',
    'Hillary Clinton@',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('sync all', function () {
    it('should login', function () {
        let client = UC.alice;
        return thenSequence([
            () => client.login(),
            (res) => expect(res.display_name).toEqual("Alice Adamson")
        ]);
    });
});

it('should sync alice contacts', function () {
    let client1 = UC.alice;
    return thenSequence([
        () => client1.api_call("api/contact/sync/all"),
        (res) => {
            let xres = UC.clean(res);
            expect(xres).toEqual({
                "contacts": [{
                    "mk_rec_type": "contact",
                    "display_name": "Fleep Support",
                    "account_id": "<account:Fleep Support>",
                    "activity_time": '...',
                    "dialog_id": "<dlg:Fleep Support>",
                    "email": "<email:Fleep Support>",
                    "fleep_address": "<fladdr:Fleep Support>",
                    "is_hidden_for_add": true,
                    "mk_account_status": "active",
                    "organisation_id": null,
                    "sort_rank": "..."}]
            });
        },
    ]);
});

it('should sync bob contacts', function () {
    let client2 = UC.bob;
    return thenSequence([
        () => client2.api_call("api/contact/sync/all"),
        (res) => {
            let xres = UC.clean(res);
            expect(xres).toEqual({
                "contacts": [{
                    "mk_rec_type": "contact",
                    "display_name": "Fleep Support",
                    "account_id": "<account:Fleep Support>",
                    "activity_time": '...',
                    "dialog_id": "<dlg:Fleep Support>",
                    "email": "<email:Fleep Support>",
                    "fleep_address": "<fladdr:Fleep Support>",
                    "is_hidden_for_add": true,
                    "mk_account_status": "active",
                    "organisation_id": null,
                    "sort_rank": "..."}]
            });
        },
    ]);
});

it('should sync charlie contacts', function () {
    let client3 = UC.charlie;
    return thenSequence([
        () => client3.api_call("api/contact/sync/all"),
        (res) => {
            let xres = UC.clean(res);
            expect(xres).toEqual({
                "contacts": [{
                    "mk_rec_type": "contact",
                    "display_name": "Fleep Support",
                    "account_id": "<account:Fleep Support>",
                    "activity_time": '...',
                    "dialog_id": "<dlg:Fleep Support>",
                    "email": "<email:Fleep Support>",
                    "fleep_address": "<fladdr:Fleep Support>",
                    "is_hidden_for_add": true,
                    "mk_account_status": "active",
                    "organisation_id": null,
                    "sort_rank": "..."}]
            });
        },
    ]);
});

it('should check that information changes are synced properly', function () {
    let client = UC.alice;
    let client2 = UC.bob;
    let client3 = UC.charlie;
    let members = [client2.fleep_email, client3.fleep_email].join(', ');
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'contactInfo'}),
        (res) => expect(res.header.topic).toEqual('contactInfo'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /contactInfo/}),
        () => client.api_call("api/conversation/add_members/" + client.getConvId(/contactInfo/), {emails: members}),
        () => Promise.all([
            client2.poll_filter({mk_rec_type: 'conv', topic: /contactInfo/}),
            client3.poll_filter({mk_rec_type: 'conv', topic: /contactInfo/})
        ]),
        () => client.api_call("api/contact/describe", {contact_id: client2.account_id, contact_name: 'Brother'}),
        () => client.poll_filter({mk_rec_type: 'contact', display_name: /Brother/}),
        () => client.api_call("api/contact/describe", {contact_id: client3.account_id, contact_name: 'Father'}),
        () => client.poll_filter({mk_rec_type: 'contact', display_name: /Father/}),
        () => client3.api_call("api/contact/describe", {contact_id: client2.account_id, contact_name: 'Friend'}),
        () => client3.poll_filter({mk_rec_type: 'contact', display_name: /Friend/}),
        () => client.poke(client.getConvId(/contactInfo/), true),
        () => client2.poke(client.getConvId(/contactInfo/), true),
        () => client3.poke(client.getConvId(/contactInfo/), true),
        () => expect(client.getContact(/Brother/).display_name).toEqual('Brother'),
        () => expect(client.getContact(/Father/).display_name).toEqual('Father'),
        () => expect(client2.getContact(/Charlie/).display_name).toEqual('Charlie Chaplin'),
        () => expect(client2.getContact(/Alice/).display_name).toEqual('Alice Adamson'),
        () => expect(client3.getContact(/Friend/).display_name).toEqual('Friend'),
        () => expect(client3.getContact(/Alice/).display_name).toEqual('Alice Adamson'),
        () => client.api_call("api/contact/hide", {contacts: [client2.account_id]}),
        () => client.poll_filter({mk_rec_type: 'contact', account_id: client2.account_id}),
        () => client.api_call("api/contact/sync", {contact_id: client2.account_id}),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Dylan>",
            "activity_time": "...",
            "dialog_id": null,
            "display_name": "Brother",
            "email": "<email:Bob Dylan>",
            "fleep_address": "<fladdr:Bob Dylan>",
            "is_hidden_for_add": true,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        }),
        () => client.api_call("api/contact/import", {contact_list: [
            {addr_full: UC.donald.email, addr_descr: 'President', phone_nr: '+37258012547'},
            {addr_full: UC.hillary.email, addr_descr: 'Wannabe President'}]
        }),
        () => client.api_call("api/contact/sync/all", {
            ignore: [client2.account_id,
                client3.account_id,
                client.getContact(/Fleep Support/).account_id]
        }),
        (res) => {
            expect(res.contacts.length).toEqual(2);
            client.cache_add_stream(res.contacts);
    },
        () => expect(UC.clean(client.getContact('President'))).toEqual({
            "account_id": "<account:President>",
            "dialog_id": null,
            "display_name": "President",
            "email": "<email:Donald Trump>",
            "is_hidden_for_add": false,
            "mk_account_status": "new",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "+37258012547",
            "sort_rank": "...",
        }),
        () => expect(UC.clean(client.getContact('Wannabe President'))).toEqual({
            "account_id": "<account:Wannabe President>",
            "dialog_id": null,
            "display_name": "Wannabe President",
            "email": "<email:Hillary Clinton>",
            "is_hidden_for_add": false,
            "mk_account_status": "new",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        }),
        () => client.api_call("api/contact/sync/activity", {contacts: [
            client2.account_id,
            client3.account_id,
            UC.donald.account_id,
            UC.hillary.account_id,
            client.getContact(/Fleep Support/).account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "account_id": "<account:Bob Dylan>",
            "activity_time": '...',
            "mk_rec_type": "lastseen",
        },
         {
            "account_id": "<account:Charlie Chaplin>",
            "activity_time": '...',
            "mk_rec_type": "lastseen",
        },
         {
            "account_id": "<account:Fleep Support>",
            "activity_time": '...',
            "mk_rec_type": "lastseen",
        },
    ],
        }),
        () => client.api_call("api/contact/sync/list", {contacts: [
            client.getContact(/Brother/).account_id,
            client.getContact(/Father/).account_id,
            client.getContact('President').account_id,
            client.getContact('Wannabe President').account_id,
            client.getContact(/Fleep Support/).account_id]
        }),
        (res) => expect(UC.clean(res)).toEqual({
            "contacts": [{
            "account_id": "<account:Bob Dylan>",
            "activity_time": "...",
            "dialog_id": null,
            "display_name": "Brother",
            "email": "<email:Bob Dylan>",
            "fleep_address": "<fladdr:Bob Dylan>",
            "is_hidden_for_add": true,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        },
         {
            "account_id": "<account:Charlie Chaplin>",
            "activity_time": "...",
            "dialog_id": null,
            "display_name": "Father",
            "email": "<email:Charlie Chaplin>",
            "fleep_address": "<fladdr:Charlie Chaplin>",
            "is_hidden_for_add": false,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        },
         {
            "account_id": "<account:President>",
            "dialog_id": null,
            "display_name": "President",
            "email": "<email:Donald Trump>",
            "is_hidden_for_add": false,
            "mk_account_status": "new",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "phone_nr": "+37258012547",
            "sort_rank": "...",
        },
         {
            "account_id": "<account:Wannabe President>",
            "dialog_id": null,
            "display_name": "Wannabe President",
            "email": "<email:Hillary Clinton>",
            "is_hidden_for_add": false,
            "mk_account_status": "new",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        },
         {
            "account_id": "<account:Fleep Support>",
            "activity_time": "...",
            "dialog_id": "<dlg:Fleep Support>",
            "display_name": "Fleep Support",
            "email": "<email:Fleep Support>",
            "fleep_address": "<fladdr:Fleep Support>",
            "is_hidden_for_add": true,
            "mk_account_status": "active",
            "mk_rec_type": "contact",
            "organisation_id": null,
            "sort_rank": "...",
        },
    ],
        }),
    ]);
});