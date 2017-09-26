import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('file storage calculation tests - how files in pinboard, taskboard and flow affect used storage', function () {
    let client = UC.bob;
    let conv_topic = 'fileStorage';
    let testfile_url_1 = null;
    let testfile_url_2 = null;
    let testfile_url_3 = null;

    return thenSequence([
        // create conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // bob uploads a file
        () => client.api_put("api/file/upload", './data/avatar1.jpg'),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file:avatar1.jpg>",
                "file_sha256": "3508c9011a8b93ef73df7be4aa2231d2a6e7f06a9a967e18a38263cde160b281",
                "file_type": "image/jpeg",
                "name": "avatar1.jpg",
                "size": 24875,
                "upload_url": "<upload_url:avatar1.jpg>",
            }]);
            testfile_url_1 = res.files[0].upload_url;
        },
        // bob sends the file to the conv with a message and pins it
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'file1',
            attachments: [testfile_url_1],
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 2,
            tags: ['pin'],
        }),
        // check that the file is on the pinboard
        () => expect(UC.clean(client.getMessage(/file1/))).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:fileStorage>",
            "edit_account_id": "<account:Bob Marley>",
            "edited_time": "...",
            "flow_message_nr": 3,
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>file1</p><file key=\"<att_id:avatar1.jpg>\">avatar1.jpg</file></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:pinned",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "pin_weight": "...",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Bob Marley>",
            "tags": [
            "is_shared",
            "pin",
            ],
        }),
        // bob uploads a second file
        () => client.api_put("api/file/upload", './data/avatar2.jpg'),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file:avatar2.jpg>",
                "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
                "file_type": "image/jpeg",
                "name": "avatar2.jpg",
                "size": 267164,
                "upload_url": "<upload_url:avatar2.jpg>",
            }]);
            testfile_url_2 = res.files[0].upload_url;
        },
        // bob sends the file to the conv with a message and makes it into a task
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'file2',
            attachments: [testfile_url_2],
        }),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message_nr: 4,
            tags: ['is_todo'],
        }),
        // check that the file is on the taskboard
        () => expect(UC.clean(client.getMessage(/file2/))).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:fileStorage>",
            "edit_account_id": "<account:Bob Marley>",
            "edited_time": "...",
            "flow_message_nr": 5,
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>file2</p><file key=\"<att_id:avatar2.jpg>\">avatar2.jpg</file></msg>",
            "message_nr": 4,
            "mk_message_state": "urn:fleep:message:mk_message_state:todo",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "pin_weight": "...",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Bob Marley>",
            "tags": [
            "is_shared",
            "is_task",
            "is_todo",
            ],
        }),
        // bob uploads a third file
        () => client.api_put("api/file/upload", './data/physics.png'),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file:physics.png>",
                "file_sha256": "c1e6f9ce9b352306c02b47f1abd0f0220c3cd16208ae4d072f20d4590b4d953c",
                "file_type": "image/png",
                "name": "physics.png",
                "size": 23567,
                "upload_url": "<upload_url:physics.png>",
            }]);
            testfile_url_3 = res.files[0].upload_url;
        },
        // bob sends the file to the conv with a message
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'file3',
            attachments: [testfile_url_3],
        }),
        // check that the file is in the conv
        () => expect(UC.clean(client.getMessage(/file3/))).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:fileStorage>",
            "inbox_nr": 3,
            "lock_account_id": null,
            "message": "<msg><p>file3</p><file key=\"<att_id:physics.png>\">physics.png</file></msg>",
            "message_nr": 6,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 4,
            "profile_id": "<account:Bob Marley>",
            "tags": [],
        }),
        // add meg to the conv
        () => client.api_call("api/conversation/add_members/" + client.getConvId(conv_topic), {emails: UC.meg.email}),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        // check that the 2 files from pinboard and taskboard are added to used storage
        () => UC.meg.api_call("api/contact/sync", {
            contact_id: UC.meg.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(292039),
        // disclose message 3 to meg so now the 3rd file is added to used storage
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            emails: UC.meg.email,
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.api_call("api/contact/sync", {
            contact_id: UC.meg.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(315606),
        // meg deletes the conversation
        () => UC.meg.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            is_deleted: true,
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.api_call("api/contact/sync", {
            contact_id: UC.meg.account_id,
        }),
        // should be 0
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(0),
        // bob sends a new message to the conv that meg deleted so it reappears to her
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'undeleteConversation',
        }),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.api_call("api/contact/sync", {
            contact_id: UC.meg.account_id,
        }),
        // files on pin/taskboard should be added to used storage again
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(292039),
        // meg leaves the conv
        () => UC.meg.api_call("api/conversation/leave/" + client.getConvId(conv_topic), {}),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.api_call("api/contact/sync", {
            contact_id: UC.meg.account_id,
        }),
        // all files that are accessible only through pin/taskboard should be subtracted from used storage
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(0),
    ]);
});
