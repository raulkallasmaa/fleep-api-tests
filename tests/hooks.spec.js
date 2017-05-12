import {UserCache, thenSequence} from '../lib';
import {requestAsync} from '../lib/utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
    'Charlie Chaplin',
]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('should create a hook and post messages over it', function () {
    let client = UC.charlie;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'createHook'}),
        (res) => expect(res.header.topic).toEqual('createHook'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /createHook/}),
        () => client.api_call("api/conversation/create_hook/" + client.getConvId(/createHook/), {
            hook_name: 'plainHook',
            mk_hook_type: 'plain'
        }),
        () => client.api_call("api/conversation/show_hooks/" + client.getConvId(/createHook/)),
        (res) => expect(UC.clean(res, {})).toEqual({
            "hooks": [{
                "account_id": "<account:Charlie Chaplin>",
                "avatar_urls": "<avatar:plainHook>",
                "conversation_id": "<conv:createHook>",
                "hook_id": "<id:plainHook>",
                "hook_key": "<key:plainHook>",
                "hook_name": "plainHook",
                "hook_url": "<url:plainHook>",
                "is_active": true,
                "mk_hook_type": "plain",
                "mk_rec_type": "hook",
                "outgoing_disable_reason": null,
                "outgoing_disabled": false,
                "outgoing_url": ""
            }]
        }),
        () => client.poll_filter({mk_rec_type: 'hook', hook_name: 'plainHook'}),
        () => requestAsync({
            uri: client.getHookUrl('plainHook'),
            method: 'POST',
            body: {message: 'hookMessage'},
            json: true,
            agent: false
        }),
        () => requestAsync({
            uri: client.getHookUrl('plainHook'),
            method: 'POST',
            form: {message: 'formMessage'},
            agent: false
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /formMessage/}),
        () => expect(UC.clean(client.matchStream({mk_rec_type: 'message', message: /hookMessage/}))).toEqual({
            "account_id": "<account:Charlie Chaplin>",
            "conversation_id": "<conv:createHook>",
            "hook_key": "<key:plainHook>",
            "inbox_nr": 1,
            "is_new_sheet": false,
            "message": "<msg><p>hookMessage</p></msg>",
            "message_nr": 3,
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Charlie Chaplin>",
            "tags": []
}),
    ]);
});

test('should rename hook and drop hook', function () {
    let client = UC.alice;
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'renameHook'}),
        (res) => expect(res.header.topic).toEqual('renameHook'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /renameHook/}),
        () => client.api_call("api/conversation/create_hook/" + client.getConvId(/renameHook/), {
            hook_name: 'hookRename',
            mk_hook_type: 'plain'}),
        () => client.api_call("api/conversation/configure_hook/" + client.getConvId(/renameHook/), {
            hook_key: client.getHookKey('hookRename'),
            hook_name: 'hookDelete'}),
        () => client.api_call("api/conversation/drop_hook/" + client.getConvId(/renameHook/), {
            hook_key: client.getHookKey('hookDelete')}),
    ]);
});

test.only('should import hook', function () {
    let client = UC.bob;
    let dateparse = Math.floor(Date.parse('Sat, 12 May 2012 12:12:12 GMT') / 1000);
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: 'importHook'}),
        (res) => expect(res.header.topic).toEqual('importHook'),
        () => client.poll_filter({mk_rec_type: 'conv', topic: /importHook/}),
        () => client.api_call("api/conversation/create_hook/" + client.getConvId(/importHook/), {
            hook_name: 'hookImport',
            mk_hook_type: 'import'}),
        () => client.api_call("api/conversation/show_hooks/" + client.getConvId(/importHook/)),
        (res) => expect(UC.clean(res, {})).toEqual({
            "hooks": [{"account_id": "<account:Bob Dylan>",
                    "avatar_urls": "<avatar:hookImport>",
                    "conversation_id": "<conv:importHook>",
                    "hook_id": "<id:hookImport>",
                    "hook_key": "<key:hookImport>",
                    "hook_name": "hookImport",
                    "hook_url": "<url:hookImport>",
                    "is_active": true,
                    "mk_hook_type": "import",
                    "mk_rec_type": "hook",
                    "outgoing_disable_reason": null,
                    "outgoing_disabled": false,
                    "outgoing_url": "", }],
        }),
        () => client.poll_filter({mk_rec_type: 'hook', hook_name: 'hookImport'}),
        () => requestAsync({
            uri: client.getHookUrl('hookImport'),
            method: 'POST',
            body: {messages : [
                { message_key: null, message: 'importMsg1', posted_time: Math.floor(Date.now() / 1000), sender_name: 'test'},
                { message_key: null, message: 'importMsg2', posted_time: Math.floor(Date.now() / 1000), sender_name: 'raul'},
                { message_key: 'msgkey1', message: 'importMsg3', posted_time: dateparse, sender_name: 'raul'}
                ]},
            json: true,
            agent: false
        }),
        () => client.poke(client.getConvId(/importHook/), true),
        () => {
            let msg1 = client.getMessage(/importMsg1/);
            let msg2 = client.getMessage(/importMsg2/);
            let msg3 = client.getMessage(/importMsg3/);
            expect(UC.clean(msg1)).toEqual({
                    "account_id": "<account:Bob Dylan>",
                    "conversation_id": "<conv:importHook>",
                    "hook_key": "<key:hookImport>",
                    "inbox_nr": 1,
                    "message": "<msg><p>importMsg1</p></msg>",
                    "message_nr": 3,
                    "mk_message_type": "text",
                    "mk_rec_type": "message",
                    "posted_time": "...",
                    "prev_message_nr": 2,
                    "profile_id": "<account:Bob Dylan>",
                    "sender_name": "test",
                    "tags": [],
            });
            expect(UC.clean(msg2)).toEqual({
                "account_id": "<account:Bob Dylan>",
                "conversation_id": "<conv:importHook>",
                "hook_key": "<key:hookImport>",
                "inbox_nr": 2,
                "message": "<msg><p>importMsg2</p></msg>",
                "message_nr": 4,
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 3,
                "profile_id": "<account:Bob Dylan>",
                "sender_name": "raul",
                "tags": [],
            });
            expect(UC.clean(msg3)).toEqual({
                "account_id": "<account:Bob Dylan>",
                "conversation_id": "<conv:importHook>",
                "hook_key": "<key:hookImport>",
                "inbox_nr": 3,
                "message": "<msg><p>importMsg3</p></msg>",
                "message_nr": 5,
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 4,
                "profile_id": "<account:Bob Dylan>",
                "sender_name": "raul",
                "tags": [],
            });
            expect(msg3.posted_time).toEqual(dateparse);
    }
    ]);
});