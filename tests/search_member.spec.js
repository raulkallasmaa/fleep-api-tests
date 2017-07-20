import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
    'George Clooney',
    'Angelina Jolie',
    'Bill Gates',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('search by participants name', function () {
    let client = UC.alice;
    let add_emails = [UC.bob.fleep_email, UC.charlie.fleep_email].join(', ');
    let conversation_id = null;
    return thenSequence([
        () => client.api_call("api/conversation/create", {}),
        (res) => {
            expect(res.header.topic).toEqual('');
            conversation_id = res.header.conversation_id;
        },
        () => client.api_call("api/conversation/add_members/" + conversation_id, {emails: add_emails}),
        () => client.poke(conversation_id, true),
        () => client.api_call("api/search", {keywords: 'Charlie Chaplin', search_types: ['topic']}),
        (res) => {
            if (UC.clean(conversation_id) === "<conv:Bob and Charlie>") {
                UC.register_magic('conv', conversation_id, 'Charlie and Bob');
            }
            let xres = UC.clean(res, {});
            xres.stream = [];
            expect(xres).toEqual({
                "headers": [{
                "conversation_id": "<conv:Monologue with myself>",
                "members": ["<account:Alice Adamson>",
                "<account:Bob Dylan>",
                "<account:Charlie Chaplin>"],
                "mk_rec_type": "conv",
                "topic": "",
                }],
                "matches": [],
                "stream": [],
                "suggestions": null,
            });
        }
    ]);
});

test('search by participants email address', function () {
    let client = UC.bill;
    let add_members = [UC.angelina.fleep_email, UC.george.fleep_email, 'tester@box.fleep.ee'].join(', ');
    let conversation_id = null;
    return thenSequence([
        () => client.api_call("api/conversation/create", {}),
        (res) => {
            expect(res.header.topic).toEqual('');
            conversation_id = res.header.conversation_id;
        },
        () => client.api_call("api/conversation/add_members/" + conversation_id, {emails: add_members}),
        () => client.poke(conversation_id, true),
        () => client.api_call("api/search", {keywords: 'tester@box.fleep.ee', search_types: ['topic']}),
        (res) => {
            UC.register_magic('conv', conversation_id, 'tester@box.fleep.ee, George and Angelina');
            let xres = UC.clean(res, {});
            xres.stream = [];
            expect(xres).toEqual({
                "headers": [{
                "conversation_id": "<conv:tester@box.fleep.ee, George and Angelina>",
                "members": ["<account:Angelina Jolie>",
                "<account:Bill Gates>",
                "<account:George Clooney>",
                "<account:tester@box.fleep.ee>"],
                "mk_rec_type": "conv",
                "topic": ""
                }],
                "matches": [],
                "stream": [],
                "suggestions": null
            });
        }
    ]);
});