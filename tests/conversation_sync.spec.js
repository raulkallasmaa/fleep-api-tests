import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Alice In Wonderland',
    'Bob Geldof',
    'Charlie Sheen',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let after_create = {
   "admins": [],
   "autojoin_url": "<autojoin:readings>",
   "begin_message_nr": 1,
   "bw_message_nr": 1,
   "can_post": true,
   "cmail": "<cmail:readings>",
   "conversation_id": "<conv:readings>",
   "creator_id": "<account:Alice In Wonderland>",
   "default_members": [],
   "export_files": [],
   "export_progress": "1",
   "fw_message_nr": 1,
   "guests": [],
   "has_email_subject": false,
   "has_pinboard": false,
   "has_task_archive": false,
   "has_taskboard": false,
   "inbox_message_nr": 1,
   "inbox_time": "...",
   "is_automute": false,
   "is_init": true,
   "is_list": true,
   "is_managed": false,
   "is_mark_unread": false,
   "is_premium": false,
   "is_tiny": false,
   "join_message_nr": 1,
   "label_ids": [],
   "last_inbox_nr": 0,
   "last_message_nr": 1,
   "last_message_time": "...",
   "leavers": [],
   "members": [
     "<account:Alice In Wonderland>",
     "<account:Bob Geldof>",
     "<account:Charlie Sheen>",
   ],
   "mk_alert_level": "default",
   "mk_conv_type": "cct_list",
   "mk_init_mode": "ic_full",
   "mk_rec_type": "conv",
   "organisation_id": null,
   "profile_id": "<account:Alice In Wonderland>",
   "read_message_nr": 1,
   "send_message_nr": 1,
   "show_message_nr": 1,
   "snooze_interval": 0,
   "snooze_time": 0,
   "teams": [],
   "topic": "readings",
   "topic_message_nr": 1,
   "unread_count": 0,
};

test('conversation sync ic_full', function () {
    return thenSequence([
        () => UC.alice.initial_poll(),
        () => UC.bob.initial_poll(),
        () => UC.charlie.initial_poll(),
        // alice creates a conv and adds bob and charlie
        () => UC.alice.api_call("api/conversation/create", {
            topic: 'readings',
            account_ids: [UC.bob.info.account_id, UC.charlie.info.account_id],
        }),
        (res) => expect(UC.clean(res.header)).toEqual(after_create),
        // send some messages
        () => UC.alice.api_call("api/conversation/sync/" + UC.alice.getConvId(/readings/), {
            mk_direction: 'ic_full'}),
        (res) => expect(UC.clean(res.header)).toEqual(after_create),
    ]);
});
