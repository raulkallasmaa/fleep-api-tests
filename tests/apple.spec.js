import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Dylan',
    'Charlie Chaplin',
    'Meg Ryan',
    'Ron Perlsson',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('see that message passes through apn', function () {
    let client = UC.charlie;
    let topic_msg = 'apnNotif';
    let topic_hook = 'apnHook';
    let apn_token = 'wJxbSJi8mGw3DZOSEMxxa4tzJYa01ANUP4X190BRnhU=';
    return thenSequence([
        // create conv for message sending
        () => client.api_call("api/conversation/create", {
            topic: topic_msg,
            account_ids: [UC.bob.account_id, ],
        }),
        // create conv for receiving notifications via hook
        () => client.api_call("api/conversation/create", {topic: topic_hook}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: topic_hook}),
        // create hook for pushing notifications
        () => client.api_call("api/conversation/create_hook/" + client.getConvId(topic_hook), {
            hook_name: 'plainHook',
            mk_hook_type: 'plain'
        }),
        () => client.poll_filter({mk_rec_type: 'hook', hook_name: 'plainHook'}),
        () => client.matchStream({mk_rec_type: 'hook', hook_name: 'plainHook'}),
        // store hook in client settings for apn pusher to use
        (r_hook) => UC.bob.api_call("api/account/configure", {client_settings: '{"_test_apn_url": "' + r_hook.hook_url + '"}'}),
        // create apn token so apn pusher path will be used
        () => UC.bob.api_call("/api/account/configure_apn", {apn_token: apn_token}),
        // send first message and lets see if notifiction happens
        () => client.api_call("api/message/store/" + client.getConvId(topic_msg), {message: 'Esimene katsetus'}),
        // first turn bob inactive
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: UC.bob.account_id,
            mk_time_action: 'account_activity_time',
            time_interval: '10 minutes',
        }),
        // time travel bob to message sending step
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: UC.bob.account_id,
            mk_time_action: 'abg_apple_notif',
        }),
        // check that message has arrived in hook chat
        () => client.poll_filter({
            mk_rec_type: 'message',
            conversation_id: client.getConvId(topic_hook),
            message: /Esimene katsetus/}),

	// just random msg that should be ignored by pusher
        () => client.api_call("api/message/store/" + client.getConvId(topic_msg), {message: 'Rändom'}),

        // direct push because of mention
        () => client.api_call("api/message/store/" + client.getConvId(topic_msg), {
            message: 'Hi @' + UC.bob.info.fleep_address,
        }),
        // check that message has arrived in hook chat
        () => client.poll_filter({
            mk_rec_type: 'message',
            conversation_id: client.getConvId(topic_hook),
            message: /Hi @bob/}),

    ]);
});

