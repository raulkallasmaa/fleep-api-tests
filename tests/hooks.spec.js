import {UserCache, thenSequence} from '../lib';
import {requestAsync} from '../lib/utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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
        () => client.api_call("api/conversation/create_hook/" + client.getConvId(/createHook/), {hook_name: 'plainHook', mk_hook_type: 'plain'}),
        () => client.api_call("api/conversation/show_hooks/" + client.getConvId(/createHook/)),
        (res) => expect(UC.clean(res, {})).toEqual({
        "hooks":
            [{"account_id": "<account:Charlie Chaplin>",
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
            "outgoing_url": ""}]
        }),
        () => client.poll_filter({mk_rec_type: 'hook', hook_name: 'plainHook'}),
        () => requestAsync({
            uri: client.getHookUrl('plainHook'),
            method: 'POST',
            body: {message: 'hookMessage'},
            json: true,
            agent: false
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /hookMessage/}),
    ]);
});