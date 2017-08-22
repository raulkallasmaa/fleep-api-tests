import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Charlie Chaplin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let conv_after_create = {
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
       "organisation_id": "<org:managedConvOrgName>",
       "teams": [],
       "topic": "managedConvTopic",
     },
   ],
};

let conv_after_kick = {
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
       "is_list": true,
       "is_managed": true,
       "leavers": [
         "<account:Don Johnson>",
         "<account:Mel Gibson>",
        ],
       "managed_time": "...",
       "members": [
         "<account:Charlie Chaplin>",
       ],
       "mk_conv_type": "cct_list",
       "mk_rec_type": "org_conv",
       "organisation_id": "<org:managedConvOrgName>",
       "teams": [],
       "topic": "managedConvTopic",
     },
   ],
};


test('create org and create managed conv with team in it', function () {
    let client = UC.charlie;
    let conv_topic = 'managedConvTopic';
    let org_name = 'managedConvOrgName';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        // create managed conv with team
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {
            topic: conv_topic,
            account_ids: [UC.mel.account_id, UC.don.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(conv_after_create),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message1'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message2'}),
        // set admins
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            kick_account_ids: [UC.don.account_id]}),
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            remove_account_ids: [UC.mel.account_id]}),
        (res) => expect(UC.clean(res)).toEqual(conv_after_kick),
    ]);
});
