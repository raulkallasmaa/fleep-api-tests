import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
    'Bill Clinton'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('file upload', function () {
    let client = UC.bob;
    let conv_topic = 'fileUpload';
    let testfile_url_1 = null;
    return thenSequence([
        // create conv and add meg
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.meg.account_id]}),
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
        // bob sends the file to the conv with meg
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [testfile_url_1],
        }),
        // check that meg sees the file/photo
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg = UC.meg.getMessage(/avatar1/);
            let file = UC.meg.getRecord('file', 'file_name', 'avatar1.jpg');
            expect(msg.message.indexOf(file.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:avatar1.jpg>",
                "conversation_id": "<conv:fileUpload>",
                "deleter_id": "",
                "file_name": "avatar1.jpg",
                "file_sha256": "3508c9011a8b93ef73df7be4aa2231d2a6e7f06a9a967e18a38263cde160b281",
                "file_size": 24875,
                "file_type": "image/jpeg",
                "file_url": "<file_url:avatar1.jpg>",
                "height": 400,
                "is_animated": false,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 2,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "thumb_url_100": "<thumb100:avatar1.jpg>",
                "thumb_url_50": "<thumb50:avatar1.jpg>",
                "width": 400
            });
            expect(UC.clean(msg)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:fileUpload>",
                "inbox_nr": 1,
                "message": "<msg><file key=\"<att_id:avatar1.jpg>\">avatar1.jpg</file></msg>",
                "message_nr": 2,
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 1,
                "profile_id": "<account:Meg Griffin>",
                "tags": []
            });
        },
    ]);
});
