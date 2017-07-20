import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let invite_team_response = {
   "stream": [{
   "grace_time": "...",
   "is_admin": true,
   "is_member": true,
   "mk_rec_type": "org_header",
   "organisation_founder_id": "<account:Charlie Chaplin>",
   "organisation_id": "<org:teamsCreateOrgName>",
   "organisation_name": "teamsCreateOrgName",
   "status": "bos_new",
   "trial_time": "...",
   "version_nr": 2,
   },
   {
   "admins": [
   "<account:Charlie Chaplin>",
   ],
   "autojoin_url": "<autojoin:Performers>",
   "is_autojoin": false,
   "is_deleted": false,
   "is_managed": true,
   "is_tiny": false,
   "managed_time": "...",
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
   "team_version_nr": 2,
    },
    {
   "account_id": "<account:Bob Dylan>",
   "inviter_id": "<account:Charlie Chaplin>",
   "is_admin": false,
   "mk_member_status": "bms_pending",
   "mk_rec_type": "org_member",
   "organisation_id": "<org:teamsCreateOrgName>",
    },
    {
    "account_id": "<account:Charlie Chaplin>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:teamsCreateOrgName>",
    },
    {
   "account_id": "<account:Don Johnson>",
   "inviter_id": "<account:Charlie Chaplin>",
   "is_admin": false,
   "mk_member_status": "bms_pending",
   "mk_rec_type": "org_member",
   "organisation_id": "<org:teamsCreateOrgName>",
   },
   {
   "account_id": "<account:Mel Gibson>",
   "inviter_id": "<account:Charlie Chaplin>",
   "is_admin": false,
   "mk_member_status": "bms_pending",
   "mk_rec_type": "org_member",
   "organisation_id": "<org:teamsCreateOrgName>",
   }],
};

let sync_changelog = {
   "stream": [{
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:teamsCreate>",
   "topic": "teamsCreate",
   },
   "event_time": "...",
   "event_type": "chat.set_managed",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 4,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "team_id": "<team:Performers>",
   "team_name": "Performers",
   },
   "event_time": "...",
   "event_type": "team.set_managed",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:teamsCreateOrgName>",
   "version_nr": 3,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "add_account_ids": [
   "<account:Bob Dylan>",
   "<account:Don Johnson>",
   "<account:Mel Gibson>",
   ],
   },
   "event_time": "...",
   "event_type": "configure_org",
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

test('create teams and invite into org', function () {
    let client = UC.charlie;
    let convTopic = 'teamsCreate';
    let teamName = 'Performers';
    let orgName = 'teamsCreateOrgName';
    return thenSequence([
        // create first conversation before team so team can be added later
        () => client.api_call("api/conversation/create", {topic: convTopic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: convTopic}),
        // create singers team
        () => client.api_call("api/team/create", {
                team_name: teamName,
                account_ids: [UC.bob.account_id, UC.don.account_id],
                conversations: [client.getConvId(convTopic)],
                emails: UC.mel.email, }),
        // wait for bg worker to do it's stuff
        () => client.poke(client.getConvId(convTopic), true),
        // create organisation
        () => client.api_call("api/business/create", {organisation_name: orgName}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: orgName}),
        // invite team into organisation
        () => client.api_call('api/business/invite_team/' + client.getOrgId(orgName), {
            team_id: client.getTeamId(teamName), }),
        (res) => expect(UC.clean(res)).toEqual(invite_team_response),
        // wait for bg worker to finish
        () => client.poke(client.getConvId(convTopic), true),
        () => expect(UC.clean(client.getConv(convTopic))).toMatchObject({
            is_managed: true, }),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(orgName), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog)
    ]);
});