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

test('upload external file', function () {
    let client = UC.bob;
    let conv_topic = 'externalFileUpload';

    return thenSequence([
        // create conv and add jon
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.jon.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // bob uploads an external file
        () => client.api_call("api/file/upload/external/", {
            file_url: 'http://i.imgur.com/llmVLDH.jpg',
            file_name: 'externalIMG',
            conversation_id: client.getConvId(conv_topic),
        }),
        () => client.poll_filter({mk_rec_type: 'upload', name: 'externalIMG'}),
        () => client.getRecord('upload', 'name', 'externalIMG'),
        (res) => expect(UC.clean(res)).toEqual({
            "conversation_id": "<conv:externalFileUpload>",
            "error": "",
            "file_sha256": "584d33c1517b7002442c34207bc7d876601b7b67632650169ad48c77fff3d831",
            "file_type": "application/octet-stream",
            "mk_rec_type": "upload",
            "name": "externalIMG",
            "size": 93567,
            "status": "success",
            "upload_url": "fleep-upload://hPVmDYTcRq2A0pWBgR88fA/externalIMG",
        }),
        // send the file to the conv with jon
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: ['fleep-upload://hPVmDYTcRq2A0pWBgR88fA/externalIMG']
        }),
        // check that jon sees the file in the conv
        () => UC.jon.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => UC.jon.getRecord('file', 'file_name', 'externalIMG'),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "attachment_id": "<att_id:externalIMG>",
            "conversation_id": "<conv:externalFileUpload>",
            "deleter_id": "",
            "file_name": "externalIMG",
            "file_sha256": "584d33c1517b7002442c34207bc7d876601b7b67632650169ad48c77fff3d831",
            "file_size": 93567,
            "file_type": "application/octet-stream",
            "file_url": "<file_url:externalIMG>",
            "height": null,
            "is_animated": null,
            "is_deleted": false,
            "is_hidden": false,
            "message_nr": 2,
            "mk_rec_type": "file",
            "orientation": null,
            "posted_time": "...",
            "sender_name": null,
            "width": null,
        }),
    ]);
});