import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Bob Geldof',
    'Charlie Chaplin',
    'Don Johnson',
    'John Hurt',
    'Mel Gibson',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_after_create = {
   "is_admin": true,
   "is_member": true,
   "mk_rec_type": "org_header",
   "organisation_founder_id": "<account:Charlie Chaplin>",
   "organisation_id": "<org:test-org-name>",
   "organisation_name": "test-org-name",
   "status": "bos_new",
   "trial_time": "...",
   "version_nr": 2,
};

let mels_reminder_active = {
   "account_id": "<account:Mel Gibson>",
   "expire_time": "...",
   "is_active": true,
   "mk_rec_type": "reminder",
   "mk_reminder_type": "org_invite",
   "organisation_id": "<org:test-org-name>",
   "remind_time": "...",
   "reminder_id": "<reminder:org_invite>",
};

let mels_org_join = {
  "stream": [
     {
       "is_admin": false,
       "is_member": true,
       "mk_rec_type": "org_header",
       "organisation_founder_id": "<account:Charlie Chaplin>",
       "organisation_id": "<org:test-org-name>",
       "organisation_name": "test-org-name",
       "status": "bos_new",
       "trial_time": "...",
       "version_nr": 3,
     },
     {
       "account_id": "<account:Mel Gibson>",
       "activated_time": "...",
       "client_flags": [
         "emoticons_old",
         "show_onboarding",
       ],
       "connected_email": "",
       "dialog_id": null,
       "display_name": "Mel Gibson",
       "email": "<email:Mel Gibson>",
       "export_files": [],
       "export_progress": "1",
       "fleep_address": "<fladdr:Mel Gibson>",
       "fleep_autogen": "<flautogen:Mel Gibson>",
       "has_password": true,
       "is_automute_enabled": true,
       "is_hidden_for_add": true,
       "is_premium": false,
       "mk_account_status": "active",
       "mk_email_interval": "never",
       "mk_rec_type": "contact",
       "organisation_id": "<org:test-org-name>",
       "trial_end_time": "...",
     },
     {
       "account_id": "<account:Mel Gibson>",
       "expire_time": "...",
       "is_active": false,
       "mk_rec_type": "reminder",
       "mk_reminder_type": "org_invite",
       "organisation_id": "<org:test-org-name>",
       "remind_time": "...",
       "reminder_id": "<reminder:org_invite>",
     },
   ],
};

let managed_team_created = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:test-org-team-name>",
   "conversations": [],
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "organisation_id": "<org:test-org-name>",
   "team_id": "<team:test-org-team-name>",
   "team_name": "test-org-team-name",
   "version_nr": 1,
};

let team_after_store = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:test-org-team-name>",
   "conversations": [],
   "is_autojoin": true,
   "is_deleted": false,
   "is_managed": true,
   "members": [
     "<account:Bob Geldof>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "organisation_id": "<org:test-org-name>",
   "team_id": "<team:test-org-team-name>",
   "team_name": "org-team-renamed",
   "version_nr": 5,
};

let team_after_unmanage_and_remove = {
   "admins": [],
   "autojoin_url": "<autojoin:test-org-team-name>",
   "conversations": [],
   "is_autojoin": true,
   "is_deleted": true,
   "is_managed": false,
   "members": [
     "<account:Bob Geldof>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "organisation_id": null,
   "team_id": "<team:test-org-team-name>",
   "team_name": "org-team-renamed",
   "version_nr": 7,
};


test('create org and invite via reminder', function () {
    let client = UC.charlie;
    let conv_topic = 'test-org-topic';
    let org_name = 'test-org-name';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

	// create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => expect(UC.clean(client.getOrg(org_name))).toEqual(org_after_create),

        // get mel into org
        () => UC.mel.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => expect(UC.clean(reminder)).toEqual(mels_reminder_active),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.mel.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),
        (res) => expect(UC.clean(res)).toEqual(mels_org_join),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
        () => client.poke(client.getConvId(conv_topic)),

        // check final state
        () => UC.mel.poll_filter({
            mk_rec_type: 'contact', organisation_id: null, account_id: UC.mel.account_id}),
    ]);
});

test('create org and add managed team', function () {
    let client = UC.charlie;
    let conv_topic = 'test-org-topic';
    let org_name = 'test-org-name';
    let org_team = 'test-org-team-name';
    let org_team_2 = 'org-team-renamed';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.mel.account_id, UC.don.account_id]}),
        // get mel into org
        () => UC.mel.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.mel.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.mel.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),

	// create managed team
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: org_team,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.getTeam(org_team),
        (team) => expect(UC.clean(team)).toEqual(managed_team_created),

        // Do various changes to team
	() => client.api_call("/api/business/store_team/" + client.getOrgId(org_name), {
            team_id: client.getTeamId(org_team),
            team_name: org_team_2,
            add_account_ids: [UC.bob.account_id, UC.don.account_id],
            remove_account_ids: [UC.mel.account_id],
            is_autojoin: true, }),

        () => client.getTeam(org_team_2),
        (team) => expect(UC.clean(team)).toEqual(team_after_store),

        // Do various changes to team
        () => client.api_call("/api/business/store_team/" + client.getOrgId(org_name), {
            team_id: client.getTeamId(org_team_2),
            is_deleted: true,
            is_managed: false, }),

        () => client.getTeam(org_team_2),
        (team) => expect(UC.clean(team)).toEqual(team_after_unmanage_and_remove),

	// changelog
        //() => client.poke(client.getConvId(conv_topic)),
        //() => client.api_call('/api/business/sync_changelog/' + client.getOrgId(org_name)),
        //(res) => expect(UC.clean(res)).toEqual({}),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
        () => client.poke(client.getConvId(conv_topic)),
    ]);
});


test('create org and create team and then manage team', function () {
    let client = UC.charlie;
    let conv_topic = 'four-org-conv-topic';
    let org_name = 'four-org-name';
    let org_team = 'four-org-team-name';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create team
        () => client.api_call("api/team/create", {
            team_name: org_team,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: org_team}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),

        // turn conversation to managed
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true }),
        () => client.getConv(conv_topic),
        (conv) => expect({organisation_id: conv.organisation_id, is_managed: conv.is_managed})
            .toEqual({organisation_id: client.getOrgId(org_name), is_managed: true, }),

        // turn team into managed team
        () => client.api_call("api/team/configure/" + client.getTeamId(org_team), {
            is_managed: true }),
        () => client.getTeam(org_team),
        (team) => expect({organisation_id: team.organisation_id, is_managed: team.is_managed})
            .toEqual({organisation_id: client.getOrgId(org_name), is_managed: true, }),

        // close org
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),

	// check that conv is back to unmanaged
        () => client.poll_filter({mk_rec_type: 'message', mk_message_type: 'unmanage'}),
        () => client.matchStream({mk_rec_type: 'message', mk_message_type: 'unmanage'}),
        (msg) => expect(msg.mk_message_type).toEqual('unmanage'),

        () => client.getConv(conv_topic),
        //(conv) => expect(UC.clean(conv)).toEqual({}),
        //(conv) => expect({organisation_id: conv.organisation_id, is_managed: conv.is_managed})
        //    .toEqual({organisation_id: null, is_managed: false, }),

        // check that team is back to unmanaged
        () => client.getTeam(org_team),
        //(team) => expect({organisation_id: team.organisation_id, is_managed: team.is_managed})
        //    .toEqual({organisation_id: null, is_managed: false, }),
    ]);
});

