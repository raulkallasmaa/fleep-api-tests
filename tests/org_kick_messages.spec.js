import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Ben Dover',
    'Don Johnson',
    'Jon Snow',
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
        () => expect(UC.clean(UC.meg.getMessage(/removed/))).toEqual({
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
            "sysmsg_text": "{author} removed {members} and their access to the conversation's content.",
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

test('user is member of the convo when it becomes managed, gets kicked and sees earlier content and kick message', function () {
    let client = UC.ben;
    let conv_topic = 'earlierContentAndKickMessage';
    let org_name = 'orgName2';

    return thenSequence([
        () => UC.don.initial_poll(),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create conv and add don
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            account_ids: [UC.don.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send a few messages to flow
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message4'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message5'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message6'}),
        // turn the conv to managed conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true,
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that the conv is managed
        () => expect(UC.clean(client.getConv(conv_topic)).is_managed).toEqual(true),
        // kick don from the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            kick_account_ids: [UC.don.account_id],
        }),
        () => UC.don.poke(client.getConvId(conv_topic), true),
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic), {}),
        // check that don can see the 3 messages
        () => expect(UC.clean(UC.don.getMessage(/message4/)).message).toEqual("<msg><p>message4</p></msg>"),
        () => expect(UC.clean(UC.don.getMessage(/message5/)).message).toEqual("<msg><p>message5</p></msg>"),
        () => expect(UC.clean(UC.don.getMessage(/message6/)).message).toEqual("<msg><p>message6</p></msg>"),
        // check that don sees the kick message
        () => expect(UC.clean(UC.don.getMessage(/removed/))).toEqual({
            "account_id": "<account:Ben Dover>",
            "conversation_id": "<conv:earlierContentAndKickMessage>",
            "inbox_nr": -3,
            "lock_account_id": null,
            "message": {
            "members": [
            "<account:Don Johnson>",
            ],
            "org_name": "orgName2",
            "organisation_id": "<org:orgName2>",
            "sysmsg_text": "{author} removed {members} and their access to the conversation's content.",
            },
            "message_nr": 6,
            "mk_message_state": "urn:fleep:message:mk_message_state:system",
            "mk_message_type": "kickV2",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 5,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
    ]);
});

test('user has been in the conv earlier and is added back, gets kicked and sees earlier content and kick message', function () {
    let client = UC.jon;
    let conv_topic = 'earlyContentKickMessage';
    let org_name = 'orgName3';

    return thenSequence([
        () => UC.mel.initial_poll(),
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create conv and add mel
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            account_ids: [UC.mel.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send a few messages to flow
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message7'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message8'}),
        // check that jon can't kick mel from a regular conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            kick_account_ids: [UC.mel.account_id],
        })
            .then(() => Promise.reject(new Error('Can not kick from an unmanaged conv!')),
                (r) => expect(r.statusCode).toEqual(431)),
        // mel leaves the conv
        () => UC.mel.api_call("api/conversation/leave/" + client.getConvId(conv_topic), {}),
        // send a message to flow after mel is gone
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'message9'}),
        // add mel back to the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_account_ids: [UC.mel.account_id],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => UC.mel.poke(client.getConvId(conv_topic), true),
        // turn the conv to managed conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_managed: true,
        }),
        // kick mel from the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            kick_account_ids: [UC.mel.account_id],
        }),
        () => UC.mel.poke(client.getConvId(conv_topic), true),
        () => UC.mel.api_call("api/conversation/sync/" + client.getConvId(conv_topic), {}),
        // check that mel can see the first 2 messages but not the 3rd
        () => expect(UC.clean(UC.mel.getMessage(/message7/)).message).toEqual("<msg><p>message7</p></msg>"),
        () => expect(UC.clean(UC.mel.getMessage(/message8/)).message).toEqual("<msg><p>message8</p></msg>"),
        () => expect(UC.clean(UC.mel.matchStream({mk_rec_type: 'message', message: /message9/}))).toEqual(null),
        // check that mel sees the kick message
        () => expect(UC.clean(UC.mel.getMessage(/removed/))).toEqual({
            "account_id": "<account:Jon Snow>",
            "conversation_id": "<conv:earlyContentKickMessage>",
            "inbox_nr": -3,
            "lock_account_id": null,
            "message": {
            "members": [
            "<account:Mel Gibson>",
            ],
            "org_name": "orgName3",
            "organisation_id": "<org:orgName3>",
            "sysmsg_text": "{author} removed {members} and their access to the conversation's content.",
            },
            "message_nr": 8,
            "mk_message_state": "urn:fleep:message:mk_message_state:system",
            "mk_message_type": "kickV2",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 7,
            "profile_id": "<account:Mel Gibson>",
            "tags": [],
        }),
    ]);
});
