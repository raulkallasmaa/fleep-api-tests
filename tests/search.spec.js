import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.setup());

// return arg after waiting msec milliseconds
function promiseWait(msec, arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, msec, arg);
    });
}

describe('search for content', function () {
    it('should search for content', function () {
        return UC.alice.api_call("api/conversation/create", {topic: 'hello'})
            .then(function (res) {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello');
                return res.header.conversation_id;
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello'})
                    .then(function () {
                        return conversation_id;
                    });
            })
            .then(function (conversation_id) {
                return promiseWait(5 * 1000, conversation_id);
            })
            .then(function (conversation_id) {
                return UC.alice.api_call("api/search", {keywords: 'hello'})
                    .then(function (res) {
                        expect(res.matches).toEqual(['hello1']);
                        expect(res.stream).toEqual(['hello2']);
                        expect(findMsgCount(res.matches, 'hello')).toEqual(['hello']);
                        return conversation_id;
                    });
            });
    });
});

function findMsgCount(stream, message) {
    for (let i = 0; i < stream.length; i++) {
    }
    return stream;
}
