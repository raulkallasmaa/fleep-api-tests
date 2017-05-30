import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Mel Gibson',
    'Don Johnson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let sync_conversations = {
   "stream": [
     {
       "admins": [
         "<account:Meg Griffin>",
       ],
       "autojoin_url": "<autojoin:managedConv>",
       "cmail": "<cmail:managedConv>",
       "conversation_id": "<conv:managedConv>",
       "creator_id": "<account:Meg Griffin>",
       "default_members": [],
       "guests": [],
       "has_email_subject": false,
       "is_deletable": true,
       "is_list": false,
       "is_managed": true,
       "leavers": [],
       "managed_time": "...",
       "members": [
         "<account:Don Johnson>",
         "<account:Meg Griffin>",
         "<account:Mel Gibson>",
       ],
       "mk_conv_type": "cct_no_mail",
       "mk_rec_type": "org_conv",
       "organisation_id": "<org:organisationName>",
       "teams": [
         "<team:freeTeam>",
       ],
       "topic": "managedConv",
     },
   ],
   "sync_cursor": "{}",
};

let mel_removed_from_team = {
    "stream": [{
    "admins": [
        "<account:Meg Griffin>",
        ],
        "autojoin_url": "<autojoin:managedConv>",
        "cmail": "<cmail:managedConv>",
        "conversation_id": "<conv:managedConv>",
        "creator_id": "<account:Meg Griffin>",
        "default_members": [],
        "guests": [],
        "has_email_subject": false,
        "is_deletable": true,
        "is_list": false,
        "is_managed": true,
        "leavers": [
        "<account:Mel Gibson>",
        ],
        "managed_time": "...",
        "members": [
        "<account:Don Johnson>",
            "<account:Meg Griffin>",
        ],
        "mk_conv_type": "cct_no_mail",
        "mk_rec_type": "org_conv",
        "organisation_id": "<org:organisationName>",
        "teams": [
        "<team:freeTeam>",
        ],
        "topic": "managedConv",
},
],
"sync_cursor": "{}",
};

test('managed conversation and free team', function () {
    let client = UC.bob;
    let conv_topic = 'managedConv';
    let team_name = 'freeTeam';
    let org_name = 'organisationName';

    return thenSequence([

        // create org and add don
	() => UC.meg.initial_poll(),
        () => UC.don.initial_poll(),
        () => client.initial_poll(),
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.don.account_id, UC.meg.account_id]}),

        // create free team and add meg
        () => UC.don.api_call("api/team/create", {team_name: team_name}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => UC.don.api_call("api/team/configure/" + UC.don.getTeamId(team_name), {
            add_account_ids: [UC.meg.account_id]}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // get meg into org
        () => UC.meg.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (reminder) => UC.meg.api_call("api/business/join/" + client.getOrgId(org_name), {
            reminder_id: reminder.reminder_id}),

        // create managed conversation
        () => UC.meg.api_call("api/conversation/create/", {
            topic: conv_topic,
            team_ids: [UC.don.getTeamId(team_name)],
            is_managed: true, }),

        // add Mel into free team
        () => UC.don.api_call("api/team/configure/" + UC.don.getTeamId(team_name), {
            add_account_ids: [UC.mel.account_id]}),
        () => UC.don.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // sync conversation
        () => UC.don.poke(UC.meg.getConvId(conv_topic), true),
        () => client.api_call("api/business/sync_conversations/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_conversations),

        // check that mel can not remove team from conv
        () => UC.mel.api_call("api/conversation/store/" + UC.meg.getConvId(conv_topic), {
           remove_team_ids: [UC.don.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Not member of organisation!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // check that don can not remove team from conv
        () => UC.don.api_call("api/conversation/store/" + UC.meg.getConvId(conv_topic), {
            remove_team_ids: [UC.don.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Not member of organisation!')),
                (r) => expect(r.statusCode).toEqual(431)),

        // remove mel from free team and check that he is in leavers list
        () => UC.don.api_call("api/team/configure/" + UC.don.getTeamId(team_name), {
            remove_account_ids: [UC.mel.account_id]}),
        () => UC.don.poke(UC.don.getConvId(conv_topic), true),
        () => client.api_call("api/business/sync_conversations/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(mel_removed_from_team),

        // bob tries to remove free team from conv
        () => client.api_call("api/conversation/store/" + UC.meg.getConvId(conv_topic), {
            remove_team_ids: [UC.don.getTeamId(team_name)]})
            .then(() => Promise.reject(new Error('Must be member or team admin!')),
                (r) => expect(r.statusCode).toEqual(431)),
    ]);
});
