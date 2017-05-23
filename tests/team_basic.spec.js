import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename);

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

let actors_team_label = {
   "index": "...",
   "is_in_muted": true,
   "is_in_recent": true,
   "is_on_left_pane": false,
   "label": "Actors",
   "label_id": "<label:Actors>",
   "mk_label_status": "active",
   "mk_label_subtype": "team_label",
   "mk_label_type": "system_label",
   "mk_rec_type": "label",
   "team_id": "<team:Actors>",
};

let conv_after_actors_added = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:teamsBasic>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:Actors>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 3,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice Adamson>",
     "<account:Charlie Chaplin>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 3,
   "send_message_nr": 1,
   "show_message_nr": 3,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:Actors>",
   ],
   "topic": "teamsBasic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let conv_2dogs_after_create = {
   "admins": [],
   "autojoin_url": "<autojoin:2 dogs>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:2 dogs>",
   "conversation_id": "<conv:2 dogs>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 5,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:Actors>",
     "<label:Singers>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 5,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice Adamson>",
     "<account:Bob Dylan>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 5,
   "send_message_nr": 1,
   "show_message_nr": 5,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:Actors>",
     "<team:Singers>",
   ],
   "topic": "2 dogs",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let actors_after_removing_alice = {
   "admins": [],
   "autojoin_url": "<autojoin:Actors>",
   "is_autojoin": false,
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
   "team_version_nr": 8,
};

let conv_2dogs_after_remove_alice = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:2 dogs>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:Actors>",
     "<label:Singers>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 6,
   "last_message_time": "...",
   "leavers": [
     "<account:Alice Adamson>",
   ],
   "members": [
     "<account:Bob Dylan>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_no_mail",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 6,
   "send_message_nr": 1,
   "show_message_nr": 6,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:Actors>",
     "<team:Singers>",
   ],
   "topic": "2 dogs",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let conv_2dogs_for_alice = {
   "admins": [],
   "autojoin_url": "<autojoin:2 dogs>",
   "begin_message_nr": 3,
   "bw_message_nr": 3,
   "can_post": false,
   "cmail": "<cmail:2 dogs>",
   "conversation_id": "<conv:2 dogs>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 6,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 3,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": false,
   "is_managed": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 3,
   "label_ids": [],
   "last_inbox_nr": 0,
   "last_message_nr": 6,
   "last_message_time": "...",
   "leavers": [
     "<account:Alice Adamson>",
   ],
   "members": [
     "<account:Bob Dylan>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Alice Adamson>",
   "read_message_nr": 2,
   "send_message_nr": 6,
   "show_message_nr": 6,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "2 dogs",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let conv_2dogs_after_removing_actors = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:2 dogs>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:Singers>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 8,
   "last_message_time": "...",
   "leavers": [
     "<account:Alice Adamson>",
     "<account:Mel Gibson>",
   ],
   "members": [
     "<account:Bob Dylan>",
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_no_mail",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 8,
   "send_message_nr": 1,
   "show_message_nr": 8,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:Singers>",
   ],
   "topic": "2 dogs",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let conv_after_removing_singers = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:teamsBasic>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_list": false,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 0,
   "last_message_nr": 6,
   "last_message_time": "...",
   "leavers": [
     "<account:Alice Adamson>",
     "<account:Mel Gibson>",
   ],
   "members": [
     "<account:Charlie Chaplin>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 6,
   "send_message_nr": 1,
   "show_message_nr": 6,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "teamsBasic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let actors_team_after_remove = {
   "admins": [],
   "autojoin_url": "<autojoin:Actors>",
   "is_autojoin": false,
   "is_deleted": true,
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
   "team_version_nr": 9,
};

let singers_team_after_rename = {
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
   "team_name": "Performrs",
   "team_version_nr": 3,
};

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('create teams and team conversations', function () {
    let client = UC.charlie;
    let conv_topic = 'teamsBasic';
    let conv_2dogs = '2 dogs';
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

        // try sync teams (must get 2)
        () => client.api_call("api/account/sync_teams"),
        (res) =>  expect(res.stream.length).toEqual(2),

        // add conversation to team
        () => client.api_call("api/team/configure/" + client.getTeamId(actors_team), {
               add_conversations: [client.getConvId(conv_topic)]}),
        () => client.poke(client.getConvId(conv_topic), true),
	// check that team is in conversation header and team members are there too
        () => client.api_call("api/team/sync/" + client.getTeamId(actors_team), {
               conversation_id: client.getConvId(conv_topic)}),
        () => client.getConv(conv_topic),
	(conv) => expect(UC.clean(conv)).toEqual(conv_after_actors_added),
	// check that team label is created
	() => client.matchStream({mk_rec_type: 'label', team_id: client.getTeamId(actors_team)}),
	(team_label) => expect(UC.clean(team_label)).toEqual(actors_team_label),

        // create conversation that contaons both teams
        () => client.api_call("api/conversation/create", {topic: conv_2dogs,
            team_ids: [client.getTeamId(actors_team), client.getTeamId(singers_team)]}),
        () => client.poke(client.getConvId(conv_2dogs), true),
        () => client.getConv(conv_2dogs),
        (conv) => expect(UC.clean(conv, {"conv": {default_members: null}})).toEqual(conv_2dogs_after_create),

        // remove alice and turn autojon off
        () => client.api_call("api/team/configure/" + client.getTeamId(actors_team), {
                remove_account_ids: [UC.alice.account_id],
                is_autojoin: false}),
        () => expect(UC.clean(client.getTeam(actors_team))).toEqual(actors_after_removing_alice),
        () => client.poke(client.getConvId(conv_2dogs), true),
        () => client.getConv(conv_2dogs),
        (conv) => expect(UC.clean(conv)).toEqual(conv_2dogs_after_remove_alice),

	// get alice version of same conversation
        () => UC.alice.poke(client.getConvId(conv_2dogs)),
        () => UC.alice.getConv(conv_2dogs),
        (conv) => expect(UC.clean(conv)).toEqual(conv_2dogs_for_alice),

	// remove team
        () => client.api_call("api/team/remove/" + client.getTeamId(actors_team)),
        () => client.poke(client.getConvId(conv_2dogs), true),
        () => client.getConv(conv_2dogs),
        (conv) => expect(UC.clean(conv)).toEqual(conv_2dogs_after_removing_actors),
        () => client.getConv(conv_topic),
        (conv) => expect(UC.clean(conv)).toEqual(conv_after_removing_singers),
        () => expect(UC.clean(client.getTeam(actors_team))).toEqual(actors_team_after_remove),

        // test team rename
        () => client.api_call("api/team/configure/" + client.getTeamId(singers_team), {
            team_name: 'Performrs'}),
        () => expect(UC.clean(client.getTeam('Performrs'))).toEqual(singers_team_after_rename),
    ]);
});
