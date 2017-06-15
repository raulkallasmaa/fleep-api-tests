import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let create_conv_result = {
   "admins": [
     "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:managedConvTopic>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:managedConvTopic>",
   "conversation_id": "<conv:managedConvTopic>",
   "creator_id": "<account:Charlie Chaplin>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 2,
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
   "is_managed": true,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [
     "<label:managedConvTeamName>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 2,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Charlie Chaplin>",
     "<account:Don Johnson>",
     "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_no_mail",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": "<org:managedConvOrgName>",
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 2,
   "send_message_nr": 1,
   "show_message_nr": 2,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:managedConvTeamName>",
   ],
   "topic": "managedConvTopic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

let mels_view_on_convo = [
   {
     "account_id": "<account:Charlie Chaplin>",
     "activity_time": "...",
     "dialog_id": null,
     "display_name": "Charlie Chaplin",
     "email": "<email:Charlie Chaplin>",
     "fleep_address": "<fladdr:Charlie Chaplin>",
     "is_hidden_for_add": false,
     "mk_account_status": "active",
     "mk_rec_type": "contact",
     "organisation_id": "<org:managedConvOrgName>",
     "sort_rank": 1,
   },
   {
     "account_id": "<account:Don Johnson>",
     "activity_time": "...",
     "dialog_id": null,
     "display_name": "Don Johnson",
     "email": "<email:Don Johnson>",
     "fleep_address": "<fladdr:Don Johnson>",
     "is_hidden_for_add": false,
     "mk_account_status": "active",
     "mk_rec_type": "contact",
     "organisation_id": null,
     "sort_rank": 0,
   },
   {
     "admins": [
       "<account:Charlie Chaplin>",
     ],
     "autojoin_url": "<autojoin:managedConvTopic>",
     "begin_message_nr": 2,
     "bw_message_nr": 2,
     "can_post": true,
     "cmail": "<cmail:managedConvTopic>",
     "conversation_id": "<conv:managedConvTopic>",
     "creator_id": "<account:Charlie Chaplin>",
     "default_members": [],
     "export_files": [],
     "export_progress": "1",
     "fw_message_nr": 2,
     "guests": [],
     "has_email_subject": false,
     "has_pinboard": false,
     "has_task_archive": false,
     "has_taskboard": false,
     "inbox_message_nr": 2,
     "inbox_time": "...",
     "is_automute": false,
     "is_init": true,
     "is_list": false,
     "is_managed": true,
     "is_premium": false,
     "is_tiny": false,
     "join_message_nr": 2,
     "label_ids": [
       "<label:managedConvTeamName>",
     ],
     "last_inbox_nr": 0,
     "last_message_nr": 2,
     "last_message_time": "...",
     "leavers": [],
     "members": [
       "<account:Charlie Chaplin>",
       "<account:Don Johnson>",
       "<account:Mel Gibson>",
     ],
     "mk_alert_level": "default",
     "mk_conv_type": "cct_no_mail",
     "mk_init_mode": "ic_full",
     "mk_rec_type": "conv",
     "organisation_id": "<org:managedConvOrgName>",
     "profile_id": "<account:Mel Gibson>",
     "read_message_nr": 1,
     "send_message_nr": 2,
     "show_message_nr": 2,
     "snooze_interval": 0,
     "snooze_time": 0,
     "teams": [
       "<team:managedConvTeamName>",
     ],
     "topic": "managedConvTopic",
     "topic_message_nr": 1,
     "unread_count": 0,
   },
   {
     "account_id": "<account:Charlie Chaplin>",
     "conversation_id": "<conv:managedConvTopic>",
     "inbox_nr": 0,
     "message": {
       "members": [
         "<account:Don Johnson>",
         "<account:Mel Gibson>",
       ],
       "sysmsg_text": "{author} added {members} using {team_name}",
       "team_id": "<team:managedConvTeamName>",
       "team_name": "managedConvTeamName",
     },
     "message_nr": 2,
     "mk_message_type": "add_teamV2",
     "mk_rec_type": "message",
     "posted_time": "...",
     "prev_message_nr": 1,
     "profile_id": "<account:Mel Gibson>",
     "tags": [],
   },
];

let mels_first_sync_team =
     {
       "admins": [],
       "autojoin_url": "<autojoin:managedConvTeamName>",
       "is_autojoin": false,
       "is_deleted": false,
       "is_managed": false,
       "is_tiny": false,
       "members": [
         "<account:Charlie Chaplin>",
         "<account:Don Johnson>",
         "<account:Mel Gibson>",
       ],
       "mk_rec_type": "team",
       "mk_sync_mode": "tsm_full",
       "organisation_id": null,
       "team_id": "<team:managedConvTeamName>",
       "team_name": "managedConvTeamName",
       "team_version_nr": 2,
     };

let mels_first_sync_teams = {
   "stream": [mels_first_sync_team],
};


test('create org and create managed conv and check the system messages', function () {
    let client = UC.charlie;
    let conv_topic = 'managedConvTopic';
    let org_name = 'managedConvOrgName';
    let org_team = 'managedConvTeamName';

    return thenSequence([
        // create team
        () => UC.mel.initial_poll(),
        () => client.api_call("api/team/create", {
            team_name: org_team,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: org_team}),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        // create managed conv with team
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            team_ids: [client.getTeamId(org_team)], }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.matchStream({mk_rec_type: 'conv', topic: conv_topic}),
        (res) => expect(UC.clean(res)).toEqual(create_conv_result),

        () => client.poke(client.getConvId(conv_topic)),
        () => UC.mel.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.mel.api_call('api/conversation/sync/' + client.getConvId(conv_topic), {
            mk_direction: 'ic_full'}),
        (res) => expect(UC.clean(res.stream)).toEqual(mels_view_on_convo),
        () => UC.mel.api_call('api/conversation/sync_teams/' + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(org_team)], }),
        (res) => expect(UC.clean(res)).toEqual(mels_first_sync_teams),
        () => UC.mel.api_call('api/team/sync/' + client.getTeamId(org_team), {
            conversation_id: client.getConvId(conv_topic), }),
        (res) => expect(UC.clean(res)).toEqual(mels_first_sync_team),
    ]);
});

