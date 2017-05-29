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
   "fw_message_nr": 3,
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
   "last_message_nr": 3,
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
   "read_message_nr": 3,
   "send_message_nr": 1,
   "show_message_nr": 3,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
     "<team:managedConvTeamName>",
   ],
   "topic": "managedConvTopic",
   "topic_message_nr": 1,
   "unread_count": 0,
};

test('create org and create managed conv and check the syste messages', function () {
    let client = UC.charlie;
    let conv_topic = 'managedConvTopic';
    let org_name = 'managedConvOrgName';
    let org_team = 'managedConvTeamName';

    return thenSequence([
        // create team
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
    ]);
});

