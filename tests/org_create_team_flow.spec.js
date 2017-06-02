import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

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
       "is_deletable": true,
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

test('business create team flow', function () {
    let client = UC.charlie;
    let conv_topic = 'managedConvTopic';
    let org_name = 'managedConvOrgName';
    let org_team = 'managedConvTeamName';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create team
        () => client.api_call("api/business/create_team/" +  client.getOrgId(org_name), {
            team_name: org_team, }),
        (res) => res.stream[0], // team
        (team) => client.api_call("api/business/store_team/" + client.getOrgId(org_name), {
            team_id:  team.team_id,
            add_account_ids: [UC.mel.account_id, UC.don.account_id], }),
        (res) => res.stream[0], // team
        // create managed conv with team
        (team) => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            team_ids: [team.team_id], }),
        (res) => expect(UC.clean(res)).toEqual(create_conv_result),
    ]);
});

