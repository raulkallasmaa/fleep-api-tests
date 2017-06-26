import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('test presence various combinations', function () {
    test('show writing pen', function () {
        let client = UC.bob;
        let conv_topic = 'writingPen';

        return thenSequence([
            // create conversation and add don
            () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.don.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // bob checks that don is writing
            () => UC.don.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Don Johnson>",
                "activity_time": '...',
                "conversation_id": "<conv:writingPen>",
                "is_writing": true,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                }]
            }),
            // don sends message and clears writing pen
            () => UC.don.api_call("api/message/send/" + client.getConvId(conv_topic), {message: 'Hello!'}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Don Johnson>",
                "activity_time": "...",
                "conversation_id": "<conv:writingPen>",
                "is_writing": false,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 2,
                }]
            }),
            // don starts writing and bob sees it
            () => UC.don.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Don Johnson>",
                "activity_time": "...",
                "conversation_id": "<conv:writingPen>",
                "is_writing": true,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 2,
                }]
            }),
            // don stops writing and bob sees it
            () => UC.don.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: false}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Don Johnson>",
                "activity_time": "...",
                "conversation_id": "<conv:writingPen>",
                "is_writing": false,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 2,
                }]
            }),
        ]);
    });

    test('show editing pen', function () {
        let client = UC.meg;
        let conv_topic = 'editingPen';

        return thenSequence([
            // create conversation and add jil
            () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.jil.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // jil creates a pinned message
            () => UC.jil.api_call("api/message/store/" + client.getConvId(conv_topic), {
                message: 'test',
                tags: ['pin']
            }),
            // jil starts editing the pinned message and meg checks it
            () => UC.jil.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Jil Smith>",
                "activity_time": "...",
                "conversation_id": "<conv:editingPen>",
                "is_writing": true,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 2,
                }]
            }),
            // jil cancels pinned message edit with message send
            () => UC.jil.api_call("api/message/send/" + client.getConvId(conv_topic), {message: 'test1'}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Jil Smith>",
                "activity_time": "...",
                "conversation_id": "<conv:editingPen>",
                "is_writing": false,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 3,
                }]
            }),
            // jil stores a new pinned message
            () => UC.jil.api_call("api/message/store/" + client.getConvId(conv_topic), {
                message: 'test123',
                tags: ['pin']
            }),
            // jil starts editing the pinned message and meg checks it
            () => UC.jil.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Jil Smith>",
                "activity_time": "...",
                "conversation_id": "<conv:editingPen>",
                "is_writing": true,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 4,
                }]
            }),
            // jil cancels the pinned message edit and meg checks it
            () => UC.jil.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {is_writing: false}),
            () => client.api_call("api/conversation/show_activity/" + client.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": [{
                "account_id": "<account:Jil Smith>",
                "activity_time": "...",
                "conversation_id": "<conv:editingPen>",
                "is_writing": false,
                "join_message_nr": 1,
                "mk_rec_type": "activity",
                "read_message_nr": 4,
                }]
            }),
        ]);
    });

    test('full privacy activity', function () {
        let client = UC.don;
        let conv_topic = 'fullPrivacyActivity';

        return thenSequence([
            // turn full privacy on for jon
            () => UC.jon.api_call("api/account/configure", {is_full_privacy: true}),
            // jon creates conversation and adds don
            () => UC.jon.api_call("api/conversation/create", {topic: conv_topic, account_ids: [client.account_id]}),
            (res) => expect(res.header.topic).toEqual(conv_topic),
            () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
            // jon starts typing with full privacy on and don sees nothing
            () => UC.jon.api_call("api/conversation/show_activity/" + UC.jon.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + UC.jon.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": []
            }),
            //jon creates a pinned message
            () => UC.jon.api_call("api/message/store/" + UC.jon.getConvId(conv_topic), {
                message: 'test3',
                tags: ['pin']
            }),
            // jon starts editing the pinned message and don sees nothing
            () => UC.jon.api_call("api/conversation/show_activity/" + UC.jon.getConvId(conv_topic), {is_writing: true}),
            () => client.api_call("api/conversation/show_activity/" + UC.jon.getConvId(conv_topic), {}),
            (res) => expect(UC.clean(res)).toEqual({
                "stream": []
            }),
            // don cant find anything from johns activity record
            () => client.matchStream({mk_rec_type: 'activity'}),
            (res) => expect(UC.clean(res)).toEqual(null)
        ]);
    });
});