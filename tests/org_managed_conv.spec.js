import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let create_conv_result = {
   "stream": [{
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
   }],
};

let sync_changelog = {
   "stream": [{
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "admin_ids": [
   "<account:Don Johnson>",
         ],
         "conversation_id": "<conv:managedConvTopic>",
         "topic": "Charlie, Don and Mel",
       },
       "event_time": "...",
       "event_type": "chat.remove_admins",
       "mk_rec_type": "org_changelog",
       "organisation_id": "<org:managedConvOrgName>",
       "version_nr": 7,
     },
     {
       "account_id": "<account:Charlie Chaplin>",
       "event_data": {
         "account_id": "<account:Charlie Chaplin>",
         "admin_ids": [
           "<account:Don Johnson>",
   "<account:Mel Gibson>",
   ],
   "conversation_id": "<conv:managedConvTopic>",
   "topic": "Charlie, Don and Mel",
   },
   "event_time": "...",
   "event_type": "chat.add_admins",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 6,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "topic": "Charlie, Don and Mel",
   },
   "event_time": "...",
   "event_type": "chat.set_managed",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 5,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "topic": "managedConvTopic",
   },
   "event_time": "...",
   "event_type": "chat.set_unmanaged",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 4,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "admin_ids": [
   "<account:Don Johnson>",
   "<account:Mel Gibson>",
   ],
   "conversation_id": "<conv:managedConvTopic>",
   "topic": "managedConvTopic",
   },
   "event_time": "...",
   "event_type": "chat.add_admins",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 3,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "conversation_id": "<conv:managedConvTopic>",
   "member_ids": [
   "<account:Charlie Chaplin>",
   ],
   "topic": "managedConvTopic",
   },
   "event_time": "...",
   "event_type": "chat.create_conversation",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 2,
   },
   {
   "account_id": "<account:Charlie Chaplin>",
   "event_data": {
   "account_id": "<account:Charlie Chaplin>",
   "organisation_name": "managedConvOrgName",
   },
   "event_time": "...",
   "event_type": "create_org",
   "mk_rec_type": "org_changelog",
   "organisation_id": "<org:managedConvOrgName>",
   "version_nr": 1,
   }],
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
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // set admins
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_admins: [UC.mel.account_id, UC.don.account_id]}),
        // set unmanaged
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            is_managed: false}),
        // remove topic to see default topic in changelog
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            topic: ''}),
        // set managed
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {is_managed: true}),
        // set admins via conversation store
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
             add_admins: [UC.mel.account_id, UC.don.account_id]}),
        // let bg worker do it's thing
        () => client.poke(client.getConvId(conv_topic), true),
        // set admins via conversation store
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
             remove_admins: [UC.don.account_id]}),
        // let bg worker do it's thing
        () => client.poke(client.getConvId(conv_topic), true),
        // check changelog messages
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name)),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog),
    ]);
});
