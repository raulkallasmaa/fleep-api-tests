
import { UserCache } from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());

describe('test account setup', () => {
    it('should login',
        () => UC.alice.login()
            .then((res) => {
                expect(res.display_name).toEqual("Alice Adamson");
            }));
    it('should sync alice contacts',
        () => UC.alice.api_call("api/contact/sync/all")
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
                        "sort_rank": "..."}]
                });
            }));
    it('should sync bob contacts',
        () => UC.bob.api_call("api/contact/sync/all")
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
                        "sort_rank": "..."}]
                });
            }));
    it('should sync charlie contacts',
        () => UC.charlie.api_call("api/contact/sync/all")
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
                        "sort_rank": "..."}]
                });
            }));
});

describe('initial poll', () => {
    it('should poll',
        () => UC.charlie.initial_poll()
            .then((res) => {
                let xres = UC.clean(res, {
                    event_horizon: null,
                    static_version: null,
                });
                xres.stream = [];
                expect(xres).toEqual({
                    "event_horizon": "...",
                    "limit_time": 0,
                    "static_version": "...",
                    "stream": []
                });
            }));
});

