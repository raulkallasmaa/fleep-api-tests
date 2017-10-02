import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Don Johnson',
    'Mel Gibson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('user is added to managed conv and kicked & only sees the kick message', function () {
    let client = UC.bob;
    let conv_topic = 'onlyKickMessage';
    let org_name = 'orgName1';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create conv
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            is_managed: true,
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send a few messages to flow
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message1'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message2'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message3'}),
        // check that the conv is managed
        () => expect(UC.clean(client.getConv(conv_topic)).is_managed).toEqual(true),
        // add meg to the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
           add_account_ids: [UC.meg.account_id],
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        // kick meg from the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
           kick_account_ids: [UC.meg.account_id],
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic), {}),
        // check that meg can't see the 3 messages
        () => expect(UC.clean(UC.meg.matchStream({mk_rec_type: 'message', message: /message1/}))).toEqual(null),
        () => expect(UC.clean(UC.meg.matchStream({mk_rec_type: 'message', message: /message2/}))).toEqual(null),
        () => expect(UC.clean(UC.meg.matchStream({mk_rec_type: 'message', message: /message3/}))).toEqual(null),
        // check that meg sees the kick message
        () => expect(UC.clean(UC.meg.getMessage(/administrator/))).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:onlyKickMessage>",
            "inbox_nr": -3,
            "lock_account_id": null,
            "message": {
            "members": [
            "<account:Meg Griffin>",
            ],
            "org_name": "orgName1",
            "organisation_id": "<org:orgName1>",
            "sysmsg_text": "An administrator of {org_name} removed {members} and their access to the conversation's content.",
            },
            "message_nr": 6,
            "mk_message_state": "urn:fleep:message:mk_message_state:system",
            "mk_message_type": "kickV2",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 5,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
    ]);
});
