import {UserCache, promiseWait} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

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
});

describe('', function () {
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
});

describe('', function () {
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
