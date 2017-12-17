import {UserCache, thenSequence} from '../lib';
import {waitAsync} from "../lib/utils";

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('send some messages and wait for corresponding notification emails', function () {
    let client = UC.bob;
    let msg160 = "1234567890".repeat(16);
    let topic60 = "0987654321".repeat(6);

    return thenSequence([
        // set megs email interval to hourly and mark fleep support conv as read so she doesn't receive an email about that
        () => UC.meg.api_call("api/account/configure", {email_interval: 'hourly'}),
        () => UC.meg.poll_filter({mk_rec_type: 'conv', default_topic: 'Fleep Support'}),
        () => UC.meg.getRecord('conv', 'default_topic', 'Fleep Support'),
        (res) => UC.meg.api_call("api/conversation/mark_read/" + res.conversation_id, {}),
        // create a conv with fleep user meg
        () => client.api_call("api/conversation/create", {account_ids: [UC.meg.account_id]}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: ''}),
        // send meg a message that has 160 characters and a random message
        () => client.api_call("api/message/store/" + client.getConvId(''), {message: msg160}),
        () => client.api_call("api/message/store/" + client.getConvId(''), {message: 'message2'}),
        () => waitAsync(10 * 1000),
        // turn meg inactive for 1 hour and look for notification email
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: UC.meg.account_id,
            mk_time_action: 'abg_email_notif_send',
            time_interval: '1 hour',
        }),
        // meg receives an email that includes Conversation with Bob Marley and msg150...
        () => UC.meg.waitMail({
            subject: /unread messages in Fleep/,
            body: /Bob Marley: 123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.../,
        }),
        // set a 60 character conversation topic
        () => client.api_call("api/conversation/store/" + client.getConvId(''), {topic: topic60}),
        // send one random message and two messages with mentions plus some random text
        () => client.api_call("api/message/store/" + client.getConvId(topic60), {message: 'message3'}),
        () => client.api_call("api/message/store/" + client.getConvId(topic60), {message: '@' + UC.meg.info.fleep_address + ' message4'}),
        () => client.api_call("api/message/store/" + client.getConvId(topic60), {message: '@' + UC.meg.info.fleep_address + ' message5'}),
        () => waitAsync(10 * 1000),
        // turn meg inactive for 2 days
        () => UC.sysclient.sys_call("sys/shard/time_travel", {
            object_id: UC.meg.account_id,
            mk_time_action: 'abg_email_notif_send',
            time_interval: '2 days',
        }),
        // meg receives an email that includes the first 50 characters of the topic plus ... plus message4
        () => UC.meg.waitMail({
            subject: /unread messages in Fleep/,
            body: /09876543210987654321098765432109876543210987654321.../,
        }),
    ]);
});
