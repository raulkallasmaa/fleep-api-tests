import {UserCache} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);



beforeAll(() => UC.setup());
afterAll(() => UC.setup());

describe('search for content', () => {
    it('',
        () => UC.alice.api_call("api/conversation/create", {topic: 'hello'})
            .then((res) => {
                UC.clean(res, {});
                expect(res.header.topic).toEqual('hello');
                return res.header.conversation_id;
            })
            .then((conversation_id) => UC.alice.api_call("api/message/send/" + conversation_id, {message: 'hello'})
            ),
                it('should search for content',
                    () => UC.alice.api_call("api/search", {keywords: 'hello'})
                        .then((res) => {
                           // expect(findMsgCount(res.stream, 'hello')).toEqual(1);

                        })
                )
            );
});

// function findMsgCount(stream, message) {
//     for (let i = 0; i < stream.length; i++) {
//     }
//     return stream;
// }