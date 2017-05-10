
import {UserCache, waitAsync, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('search for keywords', function () {
    it('should search for complete keywords', function () {
        let client = UC.alice;
        return thenSequence([
            () => client.api_call("api/conversation/create", {topic: 'hello friend whats up'}),
            (res) => expect(res.header.topic).toEqual('hello friend whats up'),
            () => client.poll_filter({mk_rec_type: 'conv', topic: /hello/}),
            () => client.api_call("api/message/send/" + client.getConvId(/hello friend/), {message: 'hello my dear friend how are you'}),
            () => waitAsync(5 * 1000),
            () => client.api_call("api/search", {keywords: 'hello friend', search_types: ['topic', 'chat']}),
            (res) => expect(findMsgCount(res, 'hello')).toEqual([1, 1]),
        ]);
    });

    it('should search for partial keywords', function () {
        let client = UC.bob;
        return thenSequence([
            () => client.api_call("api/conversation/create", {topic: 'hello friend whats up'}),
            (res) => expect(res.header.topic).toEqual('hello friend whats up'),
            () => client.poll_filter({mk_rec_type: 'conv', topic: /hello/}),
            () => client.api_call("api/message/send/" + client.getConvId(/hello/), {message: 'hello my dear friend how are you'}),
            () => waitAsync(5 * 1000),
            () => client.api_call("api/search", {keywords: 'hell frie', search_types: ['topic', 'chat']}),
            (res) => expect(findMsgCount(res, 'hello')).toEqual([1, 1]),
            () => client.api_call("api/search", {keywords: 'hell frie', search_types: ['task']}),
            (res) => expect(findMsgCount(res, 'hello')).toEqual([0, 0]),
        ]);
    });

    it('pin, tasks and mixed keywords search', function () {
        let client = UC.charlie;
        return thenSequence([
            () => client.api_call("api/conversation/create", {topic: 'taskChat common text'}),
            (res) => expect(res.header.topic).toEqual('taskChat common text'),
            () => client.poll_filter({mk_rec_type: 'conv', topic: /taskChat/}),
            () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {message: 'pinMessage common text', tags: ['pin']}),
            () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {message: 'todoMessage common text', tags: ['is_todo']}),
            () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {message: 'doneMessage common text', tags: ['is_done']}),
            () => client.poll_filter({mk_rec_type: 'message', message: /doneMessage/}),
            () => waitAsync(5 * 1000),
            () => client.api_call("api/search", {keywords: 'comm'}),
            (res) => expect(findMsgCount(res, 'common')).toEqual([3, 1]),
            () => client.api_call("api/search", {keywords: 'comm', search_types: ['task']}),
            (res) => expect(findMsgCount(res, 'common')).toEqual([2, 1]),
        ]);
    });
});

describe('contacts', function () {
    it('should search by participants name', function () {
        return UC.alice.api_call("api/conversation/create", {})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {
                    emails: [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ')
                });
            })
            .then(function (res) {
                return UC.alice.poke(res.header.conversation_id, true);
            })
            .then(function () {
                return UC.alice.api_call("api/search", {keywords: 'Charlie Chaplin', search_types: ['topic']});
            })
            .then(function (res) {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toEqual({
                    "headers": [{
                        "conversation_id": "<conv:Monologue with myself>",
                        "members": ["<account:Alice Adamson>",
                            "<account:Bob Dylan>",
                            "<account:Charlie Chaplin>", ],
                        "mk_rec_type": "conv",
                        "topic": ""
                    }],
                    "matches": [],
                    "stream": [],
                    "suggestions": null
                });
            });
    });

    it('should search by participants email address', function () {
        return UC.alice.api_call("api/conversation/create", {})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('');
                return res.header.conversation_id;
            })

            .then(function (conversation_id) {
                return UC.alice.api_call("api/conversation/add_members/" + conversation_id, {
                    emails: [UC.bob.fleep_email, UC.charlie.fleep_email, 'tester@box.fleep.ee'].join(', ')
                });
            })
            .then(function (res) {
                return UC.alice.poke(res.header.conversation_id, true);
            })
            .then(function () {
                return UC.alice.api_call("api/search", {keywords: 'tester@box.fleep.ee', search_types: ['topic']});
            })
            .then(function (res) {
                let xres = UC.clean(res, {});
                xres.stream = [];
                expect(xres).toEqual({
                    "headers": [{
                        "conversation_id": "<conv:Monologue with myself>",
                        "members": ["<account:Alice Adamson>",
                            "<account:Bob Dylan>",
                            "<account:Charlie Chaplin>",
                        "<account:tester@box.fleep.ee>"],
                        "mk_rec_type": "conv",
                        "topic": ""
                    }],
                    "matches": [],
                    "stream": [],
                    "suggestions": null
                });
            });
    });
});

function findMsgCount(res, word) {
    let msgCount = 0;
    for (let i = 0; i < res.matches.length; i++) {
        if (res.matches[i].message.indexOf(word) >= 0) {
            msgCount++;
        }
    }
    let topicCount = 0;
    for (let i = 0; i < res.headers.length; i++) {
        if (res.headers[i].topic.indexOf(word) >= 0) {
            topicCount++;
        }
    }
    return [msgCount, topicCount];
}
