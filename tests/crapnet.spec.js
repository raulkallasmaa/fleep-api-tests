import {UserCache, thenSequence} from '../lib';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 35000;

let UC = new UserCache([
    'Alice Adamson',
    'Bob Dylan',
], __filename);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let crapnet_response = {
   "client_req_id": "8faf3a5a-9e31-4e1b-b12c-04935bc71efb",
   "header": {
     "conversation_id": "<conv:crapnetTest>",
     "export_files": [],
     "export_progress": "1",
     "has_pinboard": false,
     "has_task_archive": false,
     "has_taskboard": false,
     "inbox_message_nr": 2,
     "inbox_time": "...",
     "is_automute": false,
     "is_list": false,
     "is_mark_unread": false,
     "join_message_nr": 1,
     "label_ids": [],
     "last_inbox_nr": 1,
     "last_message_nr": 2,
     "last_message_time": "...",
     "mk_alert_level": "default",
     "mk_rec_type": "conv",
     "profile_id": "<account:Bob Dylan>",
     "read_message_nr": 2,
     "send_message_nr": 1,
     "show_message_nr": 2,
     "snooze_interval": 0,
     "snooze_time": 0,
     "teams": [],
     "unread_count": 0,
   },
   "result_message_nr": 2,
   "stream": [
     {
       "account_id": "<account:Bob Dylan>",
       "conversation_id": "<conv:crapnetTest>",
       "inbox_nr": 1,
       "message": "<msg><p>We need to talk...</p></msg>",
       "message_nr": 2,
       "mk_message_type": "text",
       "mk_rec_type": "message",
       "posted_time": "...",
       "prev_message_nr": 1,
       "profile_id": "<account:Bob Dylan>",
       "tags": [],
     },
   ],
};


test('check that client_req_id prevents message posted twice', function () {
    let client = UC.bob;
    let topic = 'crapnetTest';
    let client_req_id = '8faf3a5a-9e31-4e1b-b12c-04935bc71efb';
    return thenSequence([
        () => client.api_call("api/conversation/create", {topic: topic}),
        (res) => expect(res.header.topic).toEqual(topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: topic}),
        // send message first time
        () => client.api_call("api/message/store/" + client.getConvId(topic),
            {message: 'We need to talk...', client_req_id: client_req_id}),
        (res) => expect(UC.clean(res)).toEqual(crapnet_response),
        // send same message second time
        () => client.api_call("api/message/store/" + client.getConvId(topic),
            {message: 'We need to talk...', client_req_id: client_req_id}),
        (res) => expect(UC.clean(res)).toEqual(crapnet_response),
        // check that we got everything via poll
        () => client.poll_filter({mk_rec_type: 'request', client_req_id: client_req_id}),
        () => client.matchStream({mk_rec_type: 'request', client_req_id: client_req_id}),
        (req) => expect(req).toEqual({
            "client_req_id": "8faf3a5a-9e31-4e1b-b12c-04935bc71efb",
            "conversation_id": client.getConvId(topic),
            "mk_rec_type": "request",
            "result_message_nr": 2,
        }),
        () => client.getConv(topic),
        //(conv) => expect(conv).toEqual({}),
    ]);
});
