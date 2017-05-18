import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
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

