import {UserCache, promiseWait} from '../lib';

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
        return UC.alice.api_call("api/conversation/create", {topic: 'hello friend whats up'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello friend whats up');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello my dear friend how are you'})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return promiseWait(5 * 1000, conversation_id);
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/search", {keywords: 'hello friend', search_types: ['topic', 'chat']})
                    .then(function (res) {
                        expect(findMsgCount(res, 'hello')).toEqual([1, 1]);
                        return conversation_id;

                    });
            });
    });

    it('should search for partial keywords', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'hello friend whats up'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello friend whats up');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello my dear friend how are you'})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return promiseWait(5 * 1000, conversation_id);
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/search", {keywords: 'hell frie', search_types: ['topic', 'chat']})
                    .then(function (res) {
                        expect(findMsgCount(res, 'hello')).toEqual([1, 1]);
                        return conversation_id;

                    });
            });
    });

    it('pin, tasks and mixed keywords search', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'hello friend whats up'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello friend whats up');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/store/" + conversation_id,
                    {message: 'hello my dear friend how are you', tags: ['pin']})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/store/" + conversation_id,
                    {message: 'hello friend what are you doing', tags: ['is_todo']})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/store/" + conversation_id,
                    {message: 'hello what is going on friend', tags: ['is_done']})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return promiseWait(5 * 1000, conversation_id);
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/search", {keywords: 'hello frie', search_types: ['topic', 'chat']})
                    .then(function (res) {
                        expect(findMsgCount(res, 'hello')).toEqual([1, 1]);
                        return conversation_id;

                    });
            });
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
