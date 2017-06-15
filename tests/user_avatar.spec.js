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

test('user avatar upload, change and delete', function () {
    let client = UC.bob;
    let conv_topic = 'userAvatar';
    return thenSequence([
        // create conv and add meg
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.meg.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // bob uploads a new avatar
        () => client.api_put("api/avatar/upload", './data/user_avatar1.jpg'),
        // we only want to see the files array from the result and use magic on file id and upload url
        (res) => expect(UC.clean(res.files, {
            file_id: ['avatar_file', 'name'],
            upload_url: ['upload_url', 'name']
        })).toEqual([{
            "file_id": "<avatar_file:user_avatar1.jpg>",
            "file_sha256": "3508c9011a8b93ef73df7be4aa2231d2a6e7f06a9a967e18a38263cde160b281",
            "file_type": "image/jpeg",
            "height": 400,
            "name": "user_avatar1.jpg",
            "size": 24875,
            "upload_url": "<upload_url:user_avatar1.jpg>",
            "width": 400,
        }]),
        // // check that meg sees bobs avatar
        // () => client.poke(client.getConvId(conv_topic), true),
        // () => client.api_call("api/contact/sync", {contact_id: client.account_id}),
        // () => UC.meg.poll_filter({mk_rec_type: 'contact', display_name: 'Bob Marley'}),
        // () => UC.meg.getRecord('contact', 'display_name', 'Bob Marley'),
        // (res) => expect(UC.clean(res)).toEqual({}),

        // bob changes his avatar
        () => client.api_put("api/avatar/upload", './data/user_avatar2.jpg'),
        // check that bob now has a new avatar
        (res) => expect(UC.clean(res.files, {
            file_id: ['avatar_file', 'name'],
            upload_url: ['upload_url', 'name']
        })).toEqual([{
            "file_id": "<avatar_file:user_avatar2.jpg>",
            "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
            "file_type": "image/jpeg",
            "height": 800,
            "name": "user_avatar2.jpg",
            "size": 267164,
            "upload_url": "<upload_url:user_avatar2.jpg>",
            "width": 566,
        }]),
        () => client.api_call("api/avatar/delete", {}),
        // (res) => expect(UC.clean(res)).toEqual({}),
    ]);
});
