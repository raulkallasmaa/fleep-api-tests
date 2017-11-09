import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let first_team_create = {
   "admins": [
   "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:Performers>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_org_wide": true,
   "is_tiny": false,
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   "<account:Mel Gibson>",
   ],
   "mk_rec_type": "team",
   "mk_sync_mode": "tsm_full",
   "organisation_id": "<org:teamsCreateOrgName>",
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   "team_version_nr": 3,
};

let first_conversation = {
   "admins": [],
   "can_post": true,
   "conversation_id": "<conv:teamsCreate>",
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
   "<label:Performers>",
   ],
   "last_inbox_nr": 0,
   "last_message_nr": 4,
   "last_message_time": "...",
   "leavers": [],
   "members": [
   "<account:Bob Dylan>",
   "<account:Charlie Chaplin>",
   "<account:Don Johnson>",
   "<account:Mel Gibson>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_default",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Charlie Chaplin>",
   "read_message_nr": 4,
   "send_message_nr": 1,
   "show_message_nr": 4,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [
   "<team:Performers>",
   ],
   "topic": "teamsCreate",
   "topic_message_nr": 1,
   "unread_count": 0,
};

test('create org wide team and add members to org after', function () {
    let client = UC.charlie;
    let convTopic = 'teamsCreate';
    let teamName = 'Performers';
    let orgName = 'teamsCreateOrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.initial_poll(),
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        (res) => expect(res.header.topic).toEqual(convTopic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        () => client.api_call("api/business/configure/" + client.getOrgId(orgName), {
            add_account_ids: [UC.mel.account_id]}),
        // create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                conversations: [client.getConvId(convTopic)],
                is_managed: true,
                is_org_wide: true, }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
        () => client.api_call("api/business/configure/" + client.getOrgId(orgName), {
            add_account_ids: [UC.don.account_id, UC.bob.account_id]}),
        () => client.poke(client.getConvId(convTopic), true),
        // check singesrs to have three members
        () => expect(UC.clean(client.getTeam(teamName))).toMatchObject(first_team_create),
        () => client.poke(client.getConvId(convTopic), true),
        // check actors before changes
        () => expect(UC.clean(client.getConv(convTopic))).toMatchObject(first_conversation),
    ]);
});
