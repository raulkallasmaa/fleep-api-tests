import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let create_conv_result = {
   "stream": [
     {
       "admins": [
         "<account:Charlie Chaplin>",
       ],
       "autojoin_url": "<autojoin:managedConvTopic>",
       "cmail": "<cmail:managedConvTopic>",
       "conversation_id": "<conv:managedConvTopic>",
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
       "mk_conv_type": "cct_no_mail",
       "mk_rec_type": "org_conv",
       "organisation_id": "<org:managedConvOrgName>",
       "teams": [
         "<team:managedConvTeamName>",
       ],
       "topic": "managedConvTopic",
     },
   ],
};

test('create org and create managed conv with team in it', function () {
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
        (res) => expect(UC.clean(res)).toEqual(create_conv_result),
    ]);
});

