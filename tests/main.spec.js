
"use strict";

import { UserCache } from '../lib/lib';

var UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());

describe('test account setup', () => {
    it('should login', () => {
        return UC.alice.login()
            .then(res => {
                expect(res.display_name).toEqual("Alice Adamson");
            });
    });
    it('should sync alice contacts', () => {
        return UC.alice.api_call("api/contact/sync/all")
            .then(res => {
                let xres = UC.clean(res, {
                    activity_time: null,
                    dialog_id: ['dlg-alice', 'display_name'],
                    account_id: ['account', 'display_name'],
                    fleep_address: ['fladdr', 'display_name'],
                    email: ['email', 'display_name'],
                });
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg-alice:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "sort_rank": 1}]
                });
            });
    });
    it('should sync bob contacts', () => {
        return UC.bob.api_call("api/contact/sync/all")
            .then(res => {
                let xres = UC.clean(res, {
                    activity_time: null,
                    dialog_id: ['dlg-bob', 'display_name'],
                    account_id: ['account', 'display_name'],
                    fleep_address: ['fladdr', 'display_name'],
                    email: ['email', 'display_name'],
                });
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg-bob:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "sort_rank": 1}]
                });
            });
    });
    it('should sync charlie contacts', () => {
        return UC.charlie.api_call("api/contact/sync/all")
            .then(res => {
                let xres = UC.clean(res, {
                    activity_time: null,
                    dialog_id: ['dlg-charlie', 'display_name'],
                    account_id: ['account', 'display_name'],
                    fleep_address: ['fladdr', 'display_name'],
                    email: ['email', 'display_name'],
                });
                expect(xres).toEqual({
                    "contacts": [{
                        "mk_rec_type": "contact",
                        "display_name": "Fleep Support",
                        "account_id": "<account:Fleep Support>",
                        "activity_time": '...',
                        "dialog_id": "<dlg-charlie:Fleep Support>",
                        "email": "<email:Fleep Support>",
                        "fleep_address": "<fladdr:Fleep Support>",
                        "is_hidden_for_add": true,
                        "mk_account_status": "active",
                        "sort_rank": 1}]
                });
            });
    });
});

describe('initial poll', () => {
    it('should poll', () => {
        return UC.charlie.initial_poll()
            .then(res => {
                let xres = UC.clean(res, {
                    event_horizon: null,
                });
                expect(xres).toEqual({
                    "event_horizon": "...",
                    "limit_time": 0,
                    "static_version": "<jsver:->",
                    "stream": [{
                        "account_id": "<account:charlie>",
                        "activated_time": "...",
                        "client_flags": ["show_onboarding", "emoticons_old"],
                        "connected_email": "",
                        "display_name": "Charlie Chaplin",
                        "email": "<email:charlie>",
                        "export_files": [],
                        "export_progress": "1",
                        "fleep_address": "<fladdr:Charlie Chaplin>",
                        "fleep_autogen": "<flautogen:Charlie Chaplin>",
                        "has_password": true,
                        "is_automute_enabled": true,
                        "is_hidden_for_add": true,
                        "is_premium": false,
                        "mk_account_status": "active",
                        "mk_email_interval": "never",
                        "mk_rec_type": "contact",
                        "trial_end_time": "...",
                    }]
                });
            });

    });
});

