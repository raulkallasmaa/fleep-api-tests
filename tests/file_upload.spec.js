import {UserCache, thenSequence} from '../lib';
import {readFileAsync, generatePNG} from '../lib/utils';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jon Lajoie',
    'King Kong',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('upload files and send, forward, copy, edit, delete & check storage used bytes', function () {
    let client = UC.bob;
    let conv_topic = 'fileUpload';
    let conv_topic2 = 'messageCopy';
    let testfile_url_1 = null;
    let testfile_url_2 = null;
    let testfile_url_3 = null;
    let testfile_url_4 = null;
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
        () => client.poke(client.getConvId(conv_topic), true),
        // check that storage used bytes are shown in bobs contact record after sending 1 file
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(24875),
        // check that meg sees the file/photo
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg1 = UC.meg.getMessage(/avatar1/);
            let file1 = UC.meg.getRecord('file', 'file_name', 'avatar1.jpg');
            expect(msg1.message.indexOf(file1.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file1)).toEqual({
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
            expect(UC.clean(msg1)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:fileUpload>",
                "inbox_nr": 1,
                "lock_account_id": null,
                "message": "<msg><file key=\"<att_id:avatar1.jpg>\">avatar1.jpg</file></msg>",
                "message_nr": 2,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 1,
                "profile_id": "<account:Meg Griffin>",
                "tags": []
            });
        },

        // bob uploads another file
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
        // bob sends the file to the conv with meg
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [testfile_url_2],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that storage used bytes have increased in bobs contact record after sending 2 files
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(292039),
        // check that meg sees the second file/photo
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg2 = UC.meg.getMessage(/avatar2/);
            let file2 = UC.meg.getRecord('file', 'file_name', 'avatar2.jpg');
            expect(msg2.message.indexOf(file2.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file2)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:avatar2.jpg>",
                "conversation_id": "<conv:fileUpload>",
                "deleter_id": "",
                "file_name": "avatar2.jpg",
                "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
                "file_size": 267164,
                "file_type": "image/jpeg",
                "file_url": "<file_url:avatar2.jpg>",
                "height": 800,
                "is_animated": false,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 3,
                "mk_rec_type": "file",
                "orientation": 1,
                "posted_time": "...",
                "sender_name": null,
                "thumb_url_100": "<thumb100:avatar2.jpg>",
                "thumb_url_50": "<thumb50:avatar2.jpg>",
                "thumb_url_575": "<thumb575:avatar2.jpg>",
                "width": 566,
            });
            expect(UC.clean(msg2)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:fileUpload>",
                "inbox_nr": 2,
                "lock_account_id": null,
                "message": "<msg><file key=\"<att_id:avatar2.jpg>\">avatar2.jpg</file></msg>",
                "message_nr": 3,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 2,
                "profile_id": "<account:Meg Griffin>",
                "tags": [],
            });
            return thenSequence([
                () => UC.meg.raw_request(file2.file_url),
                (res) => {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers['content-type']).toEqual('image/jpeg');
                    expect(res.headers['content-security-policy']).toEqual("default-src 'none'");
                    expect(res.headers['content-disposition']).toEqual(undefined);
                    expect(res.headers['cache-control']).toMatch(/^private, max-age=[0-9]+/);
                },
                () => UC.meg.raw_request(file2.thumb_url_100),
                (res) => {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers['content-type']).toEqual('image/png');
                    expect(res.headers['content-security-policy']).toEqual("default-src 'none'");
                    expect(res.headers['content-disposition']).toEqual(undefined);
                    expect(res.headers['cache-control']).toMatch(/^private, max-age=[0-9]+/);
                },
            ]);
        },
        // bob uploads a text file
        () => client.api_put("api/file/upload", './data/example1.txt'),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file:example1.txt>",
                "file_sha256": "1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014",
                "file_type": "application/octet-stream",
                "name": "example1.txt",
                "size": 5,
                "upload_url": "<upload_url:example1.txt>",
            }]);
            testfile_url_3 = res.files[0].upload_url;
        },
        // bob uploads another text file
        () => client.api_put("api/file/upload", './data/example2.txt'),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file:example2.txt>",
                "file_sha256": "60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752",
                "file_type": "application/octet-stream",
                "name": "example2.txt",
                "size": 5,
                "upload_url": "<upload_url:example2.txt>",
            }]);
            testfile_url_4 = res.files[0].upload_url;
        },
        // bob sends the 2 text files to the conv with meg
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [testfile_url_3, testfile_url_4],
            message: 'fileUploadAndSend',
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that storage used bytes have increased in bobs contact record after sending 4 files
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(292049),
        // check that meg sees the two text files sent in one message
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg3 = UC.meg.getMessage(/fileUploadAndSend/);
            let file3 = UC.meg.getRecord('file', 'file_name', 'example1.txt');
            let file4 = UC.meg.getRecord('file', 'file_name', 'example2.txt');
            expect(msg3.message.indexOf(file3.attachment_id) > 0).toEqual(true);
            expect(msg3.message.indexOf(file4.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file3)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:example1.txt>",
                "conversation_id": "<conv:fileUpload>",
                "deleter_id": "",
                "file_name": "example1.txt",
                "file_sha256": "1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014",
                "file_size": 5,
                "file_type": "application/octet-stream",
                "file_url": "<file_url:example1.txt>",
                "height": null,
                "is_animated": null,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 4,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "width": null,
            });
            expect(UC.clean(file4)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:example2.txt>",
                "conversation_id": "<conv:fileUpload>",
                "deleter_id": "",
                "file_name": "example2.txt",
                "file_sha256": "60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f558c11c752",
                "file_size": 5,
                "file_type": "application/octet-stream",
                "file_url": "<file_url:example2.txt>",
                "height": null,
                "is_animated": null,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 4,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "width": null,
            });
            expect(UC.clean(msg3)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:fileUpload>",
                "inbox_nr": 3,
                "lock_account_id": null,
                "message": "<msg><p>fileUploadAndSend</p><file key=\"<att_id:example1.txt>\">example1.txt</file>" +
                "<file key=\"<att_id:example2.txt>\">example2.txt</file></msg>",
                "message_nr": 4,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 3,
                "profile_id": "<account:Meg Griffin>",
                "tags": [],
            });
        },
        // create new conv and add jon
        () => client.api_call("api/conversation/create", {topic: conv_topic2, account_ids: [UC.jon.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic2),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic2}),
        // copy msg from one conv to another
        () => client.api_call("api/message/copy/" + client.getConvId(conv_topic), {
            message_nr: 2,
            to_conv_id: client.getConvId(conv_topic2),
        }),
        () => client.poke(client.getConvId(conv_topic2), true),
        // check that storage used bytes have increased in bobs contact record after copying a file from one conv to another
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(316924),
        // check that jon sees the copied image file
        () => UC.jon.poke(client.getConvId(conv_topic2), true),
        () => {
            let msg4 = UC.jon.getMessage(/avatar1/);
            let file5 = UC.jon.getRecord('file', 'file_name', 'avatar1.jpg');
            expect(msg4.message.indexOf(file5.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file5)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:avatar1.jpg>",
                "conversation_id": "<conv:messageCopy>",
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
                "width": 400,
            });
            expect(UC.clean(msg4)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:messageCopy>",
                "inbox_nr": 1,
                "lock_account_id": null,
                "message": "<msg><file key=\"<att_id:avatar1.jpg>\" is_deleted=\"true\"/>" +
                "<file key=\"<att_id:avatar1.jpg>\">avatar1.jpg</file></msg>",
                "message_nr": 2,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 1,
                "profile_id": "<account:Jon Lajoie>",
                "tags": [],
            });
        },
        // forward an image file from one conv to another
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic2), {
            fwd_conversation_id: client.getConvId(conv_topic),
            fwd_message_nr: 3,
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        // check that storage used bytes have increased in bobs contact record after forwarding a file
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(584088),
        // check that jon sees the forwarded image file
        () => UC.jon.poke(client.getConvId(conv_topic2), true),
        () => {
            let msg5 = UC.jon.getMessage(/avatar2/);
            let file6 = UC.jon.getRecord('file', 'file_name', 'avatar2.jpg');
            expect(msg5.message.indexOf(file6.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file6)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:avatar2.jpg>",
                "conversation_id": "<conv:messageCopy>",
                "deleter_id": "",
                "file_name": "avatar2.jpg",
                "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
                "file_size": 267164,
                "file_type": "image/jpeg",
                "file_url": "<file_url:avatar2.jpg>",
                "height": 800,
                "is_animated": false,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 3,
                "mk_rec_type": "file",
                "orientation": 1,
                "posted_time": "...",
                "sender_name": null,
                "thumb_url_100": "<thumb100:avatar2.jpg>",
                "thumb_url_50": "<thumb50:avatar2.jpg>",
                "thumb_url_575": "<thumb575:avatar2.jpg>",
                "width": 566,
            });
            expect(UC.clean(msg5)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:messageCopy>",
                "inbox_nr": 2,
                "lock_account_id": null,
                "message": "<msg><file key=\"<att_id:avatar2.jpg>\" is_deleted=\"true\"/>" +
                "<file key=\"<att_id:avatar2.jpg>\">avatar2.jpg</file></msg>",
                "message_nr": 3,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 2,
                "profile_id": "<account:Jon Lajoie>",
                "tags": [],
            });
        },
        // edit the message
        () => client.api_call("api/message/edit/" + client.getConvId(conv_topic2), {
            message: 'messageEdit',
            message_nr: 3,
            attachments: [testfile_url_3],
        }),
        () => client.poke(client.getConvId(conv_topic2), true),
        // check that storage used bytes have decreased in bobs contact record after editing a file/message
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(316929),
        // check that jon sees the edited message
        () => UC.jon.poke(client.getConvId(conv_topic2), true),
        () => {
            let msg6 = UC.jon.getMessage(/messageEdit/);
            let file7 = UC.jon.getRecord('file', 'file_name', 'example1.txt');
            expect(msg6.message.indexOf(file7.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file7)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:example1.txt>",
                "conversation_id": "<conv:messageCopy>",
                "deleter_id": "",
                "file_name": "example1.txt",
                "file_sha256": "1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014",
                "file_size": 5,
                "file_type": "application/octet-stream",
                "file_url": "<file_url:example1.txt>",
                "height": null,
                "is_animated": null,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 3,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "width": null,
            });
            expect(UC.clean(msg6)).toEqual({
                "account_id": "<account:Bob Marley>",
                "conversation_id": "<conv:messageCopy>",
                "edit_account_id": "<account:Bob Marley>",
                "edited_time": "...",
                "flow_message_nr": 4,
                "inbox_nr": 2,
                "lock_account_id": null,
                "message": "<msg><p>messageEdit</p><file key=\"<att_id:example1.txt>\">example1.txt</file></msg>",
                "message_nr": 3,
                "mk_message_state": "urn:fleep:message:mk_message_state:plain",
                "mk_message_type": "text",
                "mk_rec_type": "message",
                "posted_time": "...",
                "prev_message_nr": 2,
                "profile_id": "<account:Jon Lajoie>",
                "tags": [],
            });
        },
        // delete the message
        () => client.api_call("api/message/delete/" + client.getConvId(conv_topic2), {message_nr: 3}),
        () => client.poke(client.getConvId(conv_topic2), true),
        () => client.api_call("api/contact/sync", {
            contact_id: client.account_id,
        }),
        (res) => expect(UC.clean(res.storage_used_bytes)).toEqual(316924),
        // check that jon sees that the message is deleted
        () => UC.jon.poke(client.getConvId(conv_topic2), true),
        () => UC.jon.getRecord('message', 'message_nr', 3),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:messageCopy>",
            "edit_account_id": "<account:Bob Marley>",
            "edited_time": "...",
            "flow_message_nr": 5,
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:deleted",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [
            "is_deleted",
            "is_deleted",
            ],
        }),
    ]);
});

test('upload with POST', function () {
    let client = UC.king;
    let conv_topic = 'fileUploadPOST';
    let files = ['data/physics.png', 'data/pdf_transistor.pdf', 'data/avatar1.jpg'];
    let extMap = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'pdf': 'application/pdf',
    };
    return thenSequence([
        // create conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // upload all files
        () => Promise.all(files.map((fn) => readFileAsync(fn))),
        (buflist) => {
            let form = [], buf;
            let boundary = '____XXXXXXXXXXXXXXXXXXXXXX____';
            let sep = '--' + boundary;
            files.forEach((fn, idx) => {
                let basename = fn.replace(/.*\//, '');
                let ext = basename.replace(/.*\./, '').toLowerCase();
                let ctype = extMap[ext] || 'application/octet-stream';
                form.push(Buffer.from([
                        sep,
                        'Content-Disposition: form-data; name="files"; filename="' + basename + '"',
                        'Content-Type: ' + ctype, '', ''].join('\r\n')));
                form.push(buflist[idx]);
                sep = '\r\n--' + boundary;
            });
            form.push(Buffer.from(sep + '--\r\n'));
            buf = Buffer.concat(form);
            return client.raw_request('api/file/upload', {
                headers: {
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Content-Length': buf.length + '',
                },
                method: 'POST',
                qs: {ticket: client.ticket},
                body: buf,
            });
        },
        (res) => {
            if (res.statusCode >= 300) {
                return Promise.reject(new Error('http error: ' + res.statusCode + ' ' + res.statusMessage));
            }
            if (/application\/json/.test(res.headers['content-type'])) {
                res.body = JSON.parse(res.body);
            } else {
                return Promise.reject(new Error('not json?'));
            }
            return res.body;
        },
        // send files to the conv
        (res) => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'postfiles',
            attachments: res.files.map((f) => f.upload_url),
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /postfiles/}),
        () => {
            let file = client.getRecord('file', 'file_name', 'pdf_transistor.pdf');
            expect(!!file).toEqual(true);
            return thenSequence([
                () => client.raw_request(file.file_url),
                (res) => {
                    expect(res.statusCode).toEqual(200);
                    expect(res.headers['content-type']).toEqual('application/pdf');
                    expect(res.headers['content-security-policy']).toEqual("default-src 'none'");
                    expect(res.headers['content-disposition']).toEqual('attachment; filename="pdf_transistor.pdf"');
                    expect(res.headers['cache-control']).toMatch(/^private, max-age=[0-9]+$/);
                },
            ]);
        },
        () => files.forEach((fn) => {
            let basename = fn.replace(/.*\//, '');
            let ext = basename.replace(/.*\./, '').toLowerCase();
            let ctype = extMap[ext] || 'application/octet-stream';
            let rec = client.getRecord('file', 'file_name', basename);
            expect(rec.file_type).toEqual(ctype);
            expect(rec.thumb_url_50 && 'thumb_url_50').toEqual('thumb_url_50');
            expect(rec.thumb_url_100 && 'thumb_url_100').toEqual('thumb_url_100');
        }),
    ]);
});

test('upload unique png', function () {
    let client = UC.bob;
    let conv_topic = 'fileUploadUnique';
    let testfile_url_1 = null;
    let random_png;
    let random_rec;
    return thenSequence([
        // create conv and add meg
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.meg.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // bob uploads a file
        () => generatePNG({width: 266, height: 166}),
        (data) => {
            random_png = data;
            return client.api_put("api/file/upload", 'random.png', data);
        },
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file_id', 'name'],
                size: null,
                file_sha256: ['file_sha256', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file_id:random.png>",
                "file_sha256": "<file_sha256:random.png>",
                "file_type": "image/png",
                "width": 266,
                "height": 166,
                "name": "random.png",
                "size": "...",
                "upload_url": "<upload_url:random.png>",
            }]);
            testfile_url_1 = res.files[0].upload_url;
            random_rec = Object.assign({}, res.files[0]);
        },
        // bob sends the file to the conv with meg
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [testfile_url_1],
        }),
        () => client.poke(client.getConvId(conv_topic), true),

        // check that meg sees the file/photo
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg1 = UC.meg.getMessage(/random/);
            let file1 = UC.meg.getRecord('file', 'file_name', 'random.png');
            expect(msg1.message.indexOf(file1.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file1)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:random.png>",
                "conversation_id": "<conv:fileUploadUnique>",
                "deleter_id": "",
                "file_name": "random.png",
                "file_sha256": "<file_sha256:random.png>",
                "file_size": random_rec.size,
                "file_type": "image/png",
                "file_url": "<file_url:random.png>",
                "height": 166,
                "is_animated": false,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 2,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "thumb_url_100": "<thumb100:random.png>",
                "thumb_url_50": "<thumb50:random.png>",
                "width": 266
            });
        },

        // bob uploads same file again
        () => client.api_put("api/file/upload", 'random2.png', random_png),
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['file_id', 'name'],
                file_sha256: ['file_sha256', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<file_id:random.png>",
                "file_sha256": "<file_sha256:random.png>",
                "file_type": "image/png",
                //"width": 266,
                //"height": 166,
                "name": "random2.png",
                "size": random_rec.size,
                "upload_url": "<upload_url:random2.png>",
            }]);
            testfile_url_1 = res.files[0].upload_url;
        },
        // bob sends the file to the conv with meg
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            attachments: [testfile_url_1],
        }),
        () => client.poke(client.getConvId(conv_topic), true),

        // check that meg sees the file/photo
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => {
            let msg1 = UC.meg.getMessage(/random2/);
            let file1 = UC.meg.getRecord('file', 'file_name', 'random2.png');
            expect(msg1.message.indexOf(file1.attachment_id) > 0).toEqual(true);
            expect(UC.clean(file1)).toEqual({
                "account_id": "<account:Bob Marley>",
                "attachment_id": "<att_id:random2.png>",
                "conversation_id": "<conv:fileUploadUnique>",
                "deleter_id": "",
                "file_name": "random2.png",
                "file_sha256": "<file_sha256:random.png>",
                "file_size": random_rec.size,
                "file_type": "image/png",
                "file_url": "<file_url:random2.png>",
                "height": 166,
                "is_animated": false,
                "is_deleted": false,
                "is_hidden": false,
                "message_nr": 3,
                "mk_rec_type": "file",
                "orientation": null,
                "posted_time": "...",
                "sender_name": null,
                "thumb_url_100": "<thumb100:random2.png>",
                "thumb_url_50": "<thumb50:random2.png>",
                "width": 266
            });
        },
    ]);
});

