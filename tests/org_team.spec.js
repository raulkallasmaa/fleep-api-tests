import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Geldof',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let managed_team_created = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:org-team-name>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:test-org-name>",
   "team_id": "<team:org-team-name>",
   "team_name": "org-team-name",
   "team_version_nr": 1,
};

let team_after_store = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:org-team-name>",
   "is_autojoin": true,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
     "<account:Bob Geldof>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:test-org-name>",
   "team_id": "<team:org-team-name>",
   "team_name": "org-team-renamed",
   "team_version_nr": 5,
};

let team_after_unmanage_and_remove = {
   "admins": [],
   "autojoin_url": "<autojoin:org-team-name>",
   "is_autojoin": true,
   "is_deleted": true,
   "is_managed": false,
   "is_tiny": false,
   "members": [
     "<account:Bob Geldof>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": null,
   "team_id": "<team:org-team-name>",
   "team_name": "org-team-renamed",
   "team_version_nr": 7,
};

let org_changelog = {
   "stream": [
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-renamed",
       },
       "event_time": "...",
       "event_type": "team.remove",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 10,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-renamed",
       },
       "event_time": "...",
       "event_type": "team.set_unmanaged",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 9,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "is_autojoin": true,
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-renamed",
       },
       "event_time": "...",
       "event_type": "team.set_autojoin",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 8,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-renamed",
       },
       "event_time": "...",
       "event_type": "team.set_name",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 7,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "member_ids": [
           "<account:Mel Gibson>",
         ],
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-name",
       },
       "event_time": "...",
       "event_type": "team.remove_members",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 6,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "member_ids": [
           "<account:Bob Geldof>",
         ],
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-name",
       },
       "event_time": "...",
       "event_type": "team.add_members",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 5,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "conversation_ids": null,
         "is_autojoin": false,
         "member_ids": [
           "<account:Charlie Chaplin>",
           "<account:Don Johnson>",
           "<account:Mel Gibson>",
         ],
         "team_id": "<team:org-team-name>",
         "team_name": "org-team-name",
       },
       "event_time": "...",
       "event_type": "team.create",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 4,
     },
     {
       "account_id": "<account:Mel Gibson>",
       "event_data": {
         "member_account_id": "<account:Mel Gibson>",
       },
       "event_time": "...",
       "event_type": "activate_member",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 3,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "activate_account_ids": null,
         "add_account_ids": [
           "<account:Don Johnson>",
           "<account:Mel Gibson>",
         ],
         "add_admin_ids": null,
         "close_account_ids": null,
         "kick_account_ids": null,
         "organisation_name": null,
         "remove_account_ids": null,
         "remove_admin_ids": null,
         "suspend_account_ids": null,
       },
       "event_time": "...",
       "event_type": "configure_org",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 2,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "organisation_name": "test-org-name",
       },
       "event_time": "...",
       "event_type": "create_org",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:test-org-name>",
       "version_nr": 1,
     },
   ],
};


test('create org and add managed team', function () {
    let client = UC.charlie;
    let conv_topic = 'test-org-topic';
    let org_name = 'test-org-name';
    let org_team = 'org-team-name';
    let org_team_2 = 'org-team-renamed';

    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
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

        () => client.poke(client.getConvId(conv_topic)),
        () => client.getTeam(org_team_2),
        (team) => expect(UC.clean(team)).toEqual(team_after_store),

        // Do various changes to team
        () => client.api_call("/api/business/store_team/" + client.getOrgId(org_name), {
            team_id: client.getTeamId(org_team_2),
            is_deleted: true,
            is_managed: false, }),

        () => client.poke(client.getConvId(conv_topic)),
        () => client.getTeam(org_team_2),
        (team) => expect(UC.clean(team)).toEqual(team_after_unmanage_and_remove),

	// changelog
        () => client.poke(client.getConvId(conv_topic)),
        () => client.api_call('/api/business/sync_changelog/' + client.getOrgId(org_name)),
        (res) => expect(UC.clean(res)).toEqual(org_changelog),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
    ]);
});


