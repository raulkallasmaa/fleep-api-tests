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

// bug: upload/ext loses file ext
// bug: status:success drops request_id

test('upload external file and send', function () {
    let client = UC.bob;
    let conv_topic = 'externalFileUpload';
    let request_id = null;
    let upload_url = null;

    return thenSequence([
        // create conv and add jon
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.jon.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // bob uploads an external file
        () => client.api_call("api/file/upload/external/", {
            file_url: 'https://i.imgur.com/EIWVp28.jpg',
            file_name: 'externalIMG.jpg',
            conversation_id: client.getConvId(conv_topic),
        }),
        (res) => {
            request_id = res.request_id;
            expect(!!request_id).toEqual(true);
        },
        () => client.poll_filter({mk_rec_type: 'upload', status: 'success'}),
        () => {
            let res = client.getRecord('upload', 'status', 'success');
            expect(UC.clean(res)).toEqual({
                "mk_rec_type": "upload",
                "conversation_id": "<conv:externalFileUpload>",
                "file_sha256": "a5df8f4cce25d2dfc5f5066539130bdb155b6d04ccb51aadd17aa0ef4ee26bc5",
                "file_type": "image/jpeg",
                "name": "externalIMG.jpg",
                "size": 78294,
                "height": 573,
                "width": 680,
                "status": "success",
                "is_animated": false,
                "upload_url": "<upload_url:externalIMG.jpg>",
                "error": "",
            });
            upload_url = res.upload_url;
        },
        // send the file to the conv with jon
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [upload_url]
        }),
        // check that jon sees the file in the conv
        () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jon.getRecord('file', 'file_name', 'externalIMG.jpg'),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "attachment_id": "<att_id:externalIMG.jpg>",
            "conversation_id": "<conv:externalFileUpload>",
            "deleter_id": "",
            "file_name": "externalIMG.jpg",
            "file_sha256": "a5df8f4cce25d2dfc5f5066539130bdb155b6d04ccb51aadd17aa0ef4ee26bc5",
            "file_size": 78294,
            "file_type": "image/jpeg",
            "file_url": "<file_url:externalIMG.jpg>",
            "height": 573,
            "is_animated": false,
            "is_deleted": false,
            "is_hidden": false,
            "message_nr": 2,
            "mk_rec_type": "file",
            "thumb_url_100": "<thumb100:externalIMG.jpg>",
            "thumb_url_50": "<thumb50:externalIMG.jpg>",
            "orientation": null,
            "posted_time": "...",
            "sender_name": null,
            "width": 680,
        }),
    ]);
});
