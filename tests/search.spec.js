import {UserCache, waitAsync, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('search for complete keywords', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'searchForKeywords'}),
        (res) => expect(res.header.topic).toEqual('searchForKeywords'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /search/}),
        () => client.api_call("api/message/send/" + client.getConvId(/search/), {message: 'search for keywords'}),
        () => waitAsync(5 * 1000),
        () => client.api_call("api/search", {keywords: 'search', search_types: ['topic', 'chat']}),
        (res) => expect(findMsgCount(res, 'search')).toEqual([1, 1]),
    ]);
});

test('search for partial keywords', function () {
    let client = UC.bob;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'searchForPartialKeywords'}),
        (res) => expect(res.header.topic).toEqual('searchForPartialKeywords'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /search/}),
        () => client.api_call("api/message/send/" + client.getConvId(/search/), {message: 'search For Partial Keywords'}),
        () => waitAsync(5 * 1000),
        () => client.api_call("api/search", {keywords: 'searc Partia Keywor', search_types: ['topic', 'chat']}),
        (res) => expect(findMsgCount(res, 'Keywor')).toEqual([1, 1]),
        () => client.api_call("api/search", {keywords: 'searc Partia Keywor', search_types: ['task']}),
        (res) => expect(findMsgCount(res, 'searc')).toEqual([0, 0]),
    ]);
});

test('pin, tasks and mixed keywords search', function () {
    let client = UC.charlie;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'taskChat common text'}),
        (res) => expect(res.header.topic).toEqual('taskChat common text'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /taskChat/}),
        () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {
            message: 'pinMessage common text',
            tags: ['pin']
        }),
        () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {
            message: 'todoMessage common text',
            tags: ['is_todo']
        }),
        () => client.api_call("api/message/store/" + client.getConvId(/taskChat/), {
            message: 'doneMessage common text',
            tags: ['is_done']
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /doneMessage/}),
        () => waitAsync(5 * 1000),
        () => client.api_call("api/search", {keywords: 'comm'}),
        (res) => expect(findMsgCount(res, 'common')).toEqual([3, 1]),
        () => client.api_call("api/search", {keywords: 'comm', search_types: ['task']}),
        (res) => expect(findMsgCount(res, 'common')).toEqual([2, 1]),
    ]);
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