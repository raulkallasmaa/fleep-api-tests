import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('sync all', function () {
    it('should login', function () {
        return UC.alice.login()
            .then(function (res) {
                expect(res.display_name).toEqual("Alice Adamson");
            });
    });
    it('should sync alice contacts', function () {
        return UC.alice.api_call("api/contact/sync/all")
            .then(function (res) {
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
                        "sort_rank": "..."
                    }]
                });
            });
    });
    it('should sync bob contacts', function () {
        return UC.bob.api_call("api/contact/sync/all")
            .then((res) => {
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
                        "sort_rank": "..."
                    }]
                });
            });
    });
    it('should sync charlie contacts', function () {
        return UC.charlie.api_call("api/contact/sync/all")
            .then((res) => {
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
                        "sort_rank": "..."
                    }]
                });
            });
    });
});

