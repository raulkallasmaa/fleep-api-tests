import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
]);

let singers_team_after_create = {
   "admins": [],
   "autojoin_url": "<autojoin:Singers>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": false,
   "is_tiny": false,
   "members": [
     "<account:Bob Dylan>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": null,
   "team_id": "<team:Singers>",
   "team_name": "Singers",
   "team_version_nr": 1,
};

let actors_team_after_create = {
   "admins": [],
   "autojoin_url": "<autojoin:Actors>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": false,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": null,
   "team_id": "<team:Actors>",
   "team_name": "Actors",
   "team_version_nr": 1,
};

let actors_team_after_add_members = {
   "admins": [],
   "autojoin_url": "<autojoin:Actors>",
   "is_autojoin": true,
   "is_deleted": false,
   "is_managed": false,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": null,
   "team_id": "<team:Actors>",
   "team_name": "Actors",
   "team_version_nr": 3,
};


let actors_team_after_alice_autojoin = {
   "admins": [],
   "autojoin_url": "<autojoin:Actors>",
   "is_autojoin": true,
   "is_deleted": false,
   "is_managed": false,
   "is_tiny": false,
   "members": [
     "<account:Alice Adamson>",
     "<account:Charlie Chaplin>",
     "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": null,
   "team_id": "<team:Actors>",
   "team_name": "Actors",
   "team_version_nr": 4,
};


beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('create teams and team conversations', function () {
    let client = UC.charlie;
    let conv_topic = 'teamsBasic';
    let singers_team = 'Singers';
    let actors_team = 'Actors';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
	// create Actors team that will be modified later
        () => client.api_call("api/team/create", {team_name: actors_team}),
	// create singers team
        () => client.api_call("api/team/create", {
                team_name: singers_team,
                account_ids: [UC.bob.account_id, UC.don.account_id]}),
        () => client.poke(client.getConvId(conv_topic)),
	// check singesrs to have three members
        () => expect(UC.clean(client.getTeam(singers_team))).toEqual(singers_team_after_create),
	// check actors before changes
        () => expect(UC.clean(client.getTeam(actors_team))).toEqual(actors_team_after_create),
	// add member to actors
        () => client.api_call("api/team/configure/" + client.getTeamId(actors_team), {
                add_account_ids: [UC.mel.account_id]}),
	// enable autojoin
        () => client.api_call("api/team/configure/" + client.getTeamId(actors_team), {
                is_autojoin: true}),
        () => client.poke(client.getConvId(conv_topic)),
	// check that there are two members and autojoin is enabled
        () => expect(UC.clean(client.getTeam(actors_team))).toEqual(actors_team_after_add_members),
	// alice joins team via autojoin key
        () => UC.alice.api_call("api/team/autojoin", {
		team_url_key: client.getTeamAutoJoinKey(actors_team)}),
        () => client.poke(client.getConvId(conv_topic)),
	// check that alice is part of the team
        () => expect(UC.clean(client.getTeam(actors_team))).toEqual(actors_team_after_alice_autojoin),
    ]);
});
