import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test.skip('send a message and wait for corresponding notification email', function () {
    let client = UC.bob;
    let conv_topic = 'notificationEmail';

    return thenSequence([
        () => UC.meg.api_call("api/account/configure", {email_interval: 'daily'}),
        () => UC.meg.api_call("api/account/configure", {is_automute_enabled: false}),
        // create a conv with fleep user meg
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // send meg a message
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'Message'}),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        // turn meg inactive for 7 days and look for notification email
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: UC.meg.account_id,
            mk_time_action: 'account_activity_time',
            time_interval: '7 days',
        }),
        // this test isn't working right now, no email received
        () => UC.meg.waitMail({}),
    ]);
});
