import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

let UC = new UserCache([
    'Bob Geldof',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let sx_managed_team = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-team-name>",
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
   "organisation_id": "<org:five-org-name>",
   "team_id": "<team:five-org-team-name>",
   "team_name": "five-org-team-name",
   "team_version_nr": 2,
};

let sx_managed_conv_one = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-conv-topic>",
   "cmail": "<cmail:five-org-conv-topic>",
   "conversation_id": "<conv:five-org-conv-topic>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "guests": [],
   "has_email_subject": false,
   "is_deletable": false,
   "is_list": false,
   "is_managed": true,
   "leavers": [],
   "managed_time": "...",
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_conv_type": "cct_default",
   "mk_rec_type": "org_conv",
   "organisation_id": "<org:five-org-name>",
   "teams": [
     "<team:five-org-team-name>",
   ],
   "topic": "five-org-conv-topic",
};

let sx_managed_conv_two = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:six-topix>",
   "cmail": "<cmail:six-topix>",
   "conversation_id": "<conv:six-topix>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "guests": [],
   "has_email_subject": false,
   "is_deletable": true,
   "is_list": true,
   "is_managed": true,
   "leavers": [],
   "managed_time": "...",
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_conv_type": "cct_list",
   "mk_rec_type": "org_conv",
   "organisation_id": "<org:five-org-name>",
   "teams": [],
   "topic": "six-topix",
};

let sx_managed_team_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-team-name>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:five-org-name>",
   "team_id": "<team:five-org-team-name>",
   "team_name": "five-org-team-name",
   "team_version_nr": 3,
};

let sx_managed_conv_one_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:five-org-conv-topic>",
   "cmail": "<cmail:five-org-conv-topic>",
   "conversation_id": "<conv:five-org-conv-topic>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "guests": [],
   "has_email_subject": false,
   "is_deletable": false,
   "is_list": false,
   "is_managed": true,
   "leavers": [
     "<account:Mel Gibson>",
   ],
   "managed_time": "...",
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_conv_type": "cct_default",
   "mk_rec_type": "org_conv",
   "organisation_id": "<org:five-org-name>",
   "teams": [
     "<team:five-org-team-name>",
   ],
   "topic": "five-org-conv-topic",
};

let sx_managed_conv_two_after_kick = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:six-topix>",
   "cmail": "<cmail:six-topix>",
   "conversation_id": "<conv:six-topix>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "guests": [],
   "has_email_subject": false,
   "is_deletable": true,
   "is_list": true,
   "is_managed": true,
   "leavers": [
     "<account:Mel Gibson>",
   ],
   "managed_time": "...",
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
   ],
   "mk_conv_type": "cct_list",
   "mk_rec_type": "org_conv",
   "organisation_id": "<org:five-org-name>",
   "teams": [],
   "topic": "six-topix",
};

test('create org and create team and then kick member from all', function () {
    let client = UC.charlie;
    let conv_topic = 'five-org-conv-topic';
    let six_topix = 'six-topix';
    let org_name = 'five-org-name';
    let org_team = 'five-org-team-name';

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

        // create managed team and two conversations
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: org_team, account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true, add_team_ids: [client.getTeamId(org_team)]}),
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: six_topix, account_ids: [UC.mel.account_id, UC.don.account_id]}),

	// poll and poke to get cache in sync
        () => client.poll_filter({mk_rec_type: 'conv', topic: six_topix}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(six_topix), true),
        () => client.api_call("api/business/sync_conversations/" + client.getOrgId(org_name)),
        (res) => expect(res.stream.length).toEqual(2),

        // check the results
        () => client.getTeam(org_team),
        (team) => expect(UC.clean(team)).toEqual(sx_managed_team),
        () => client.matchStream({mk_rec_type: 'org_conv', topic: conv_topic}),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_one),
        () => client.matchStream({mk_rec_type: 'org_conv', topic: six_topix}),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_two),

        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            kick_account_ids: [UC.mel.account_id]}),

	// let all backend stuff to complete
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(six_topix), true),
        () => client.api_call("api/business/sync_conversations/" + client.getOrgId(org_name)),

	// check results after kick
        () => client.getTeam(org_team),
        (team) => expect(UC.clean(team)).toEqual(sx_managed_team_after_kick),
        () => client.matchStream({mk_rec_type: 'org_conv', topic: conv_topic}),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_one_after_kick),
        () => client.matchStream({mk_rec_type: 'org_conv', topic: six_topix}),
        (conv) => expect(UC.clean(conv)).toEqual(sx_managed_conv_two_after_kick),

        // close org
        () => client.api_call("api/business/close/" + client.getOrgId(org_name)),
    ]);
});
