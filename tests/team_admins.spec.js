import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let team_after_create = {
   "admins": [
   "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:Performers>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:teamsCreateOrgName>",
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   "team_version_nr": 1,
};

let team_after_bob_is_set_admin = {
   "admins": [
   "<account:Bob Dylan>",
   ],
   "autojoin_url": "<autojoin:Performers>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:teamsCreateOrgName>",
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   "team_version_nr": 2,
};

let changelog = {
   "stream": [{
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "admin_ids": [],
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   },
   "event_time": "...",
   "event_type": "team.set_admins",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 4,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "admin_ids": [
   "<account:Bob Dylan>",
   ],
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   },
   "event_time": "...",
   "event_type": "team.set_admins",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 3,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_ids": null,
   "conversation_topics": null,
   "is_autojoin": false,
   "member_ids": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   ],
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   },
   "event_time": "...",
   "event_type": "team.create",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 2,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "organisation_name": "teamsCreateOrgName",
   },
   "event_time": "...",
   "event_type": "create_org",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 1,
   }],
};

test('team set and remove admins', function () {
    let client = UC.charlie;
    let convTopic = 'teamsCreate';
    let teamName = 'Performers';
    let orgName = 'teamsCreateOrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        (res) => expect(res.header.topic).toEqual(convTopic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        // create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                account_ids: [UC.bob.account_id, UC.don.account_id],
                is_managed: true, }),
        // team after create
        () => expect(UC.clean(client.getTeam(teamName))).toEqual(team_after_create),
        // enable autojoin
        () => client.api_call("api/team/configure/" + client.getTeamId(teamName), {
                admin_ids: [UC.bob.account_id], }),
        // check that alice is part of the team
        () => expect(UC.clean(client.getTeam(teamName))).toEqual(team_after_bob_is_set_admin),
        // disable autojoin
        () => client.api_call("api/business/store_team/" + client.getOrgId(orgName), {
                team_id: client.getTeamId(teamName),
                admin_ids: [], }),
        () => client.poke(client.getConvId(convTopic)),
        () => expect(UC.clean(client.getTeam(teamName))).toMatchObject({
            "admins": [],
            "team_version_nr": 3, }),
        // let bg worker copy log
        () => client.poke(client.getConvId(convTopic), true),
        // view org changelog to see team changes there
        () => client.api_call('/api/business/sync_changelog/' + client.getOrgId(orgName)),
        (res) => expect(UC.clean(res)).toEqual(changelog),
    ]);
});