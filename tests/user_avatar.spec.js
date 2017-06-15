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
        () => client.api_put("api/avatar/upload", './data/avatar1.jpg'),
        // check that bob sees his avatar
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['avatar_file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<avatar_file:avatar1.jpg>",
                "file_sha256": "3508c9011a8b93ef73df7be4aa2231d2a6e7f06a9a967e18a38263cde160b281",
                "file_type": "image/jpeg",
                "height": 400,
                "name": "avatar1.jpg",
                "size": 24875,
                "upload_url": "<upload_url:avatar1.jpg>",
                "width": 400,
            }]);
            let rec = client.getContact(/Bob/);
            expect(UC.clean(rec).avatar_urls).toEqual({
                "size_100": "<avatar_size_100:Bob Marley>",
                "size_50": "<avatar_size_50:Bob Marley>",
            });
        },
        // check that meg sees bobs avatar
        () => UC.meg.poll_filter({mk_rec_type: 'contact', display_name: 'Bob Marley'}),
        () => UC.meg.getRecord('contact', 'display_name', 'Bob Marley'),
        (res) => expect(UC.clean(res).avatar_urls).toEqual({
            "size_100": "<avatar_size_100:Bob Marley>",
            "size_50": "<avatar_size_50:Bob Marley>",
        }),

        // bob changes his avatar
        () => client.api_put("api/avatar/upload", './data/avatar2.jpg'),
        // check that bob now has a new avatar
        (res) => {
            expect(UC.clean(res.files, {
                file_id: ['avatar_file', 'name'],
                upload_url: ['upload_url', 'name']
            })).toEqual([{
                "file_id": "<avatar_file:avatar2.jpg>",
                "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
                "file_type": "image/jpeg",
                "height": 800,
                "name": "avatar2.jpg",
                "size": 267164,
                "upload_url": "<upload_url:avatar2.jpg>",
                "width": 566,
            }]);
            let rec = client.getContact(/Bob/);
            expect(UC.clean(rec).avatar_urls).toEqual({
                "size_100": "<avatar_size_100:Bob Marley>",
                "size_50": "<avatar_size_50:Bob Marley>",
                "size_575": "<avatar_size_575:Bob Marley>",
            });
        },
        // check that meg sees bobs new avatar
        () => UC.meg.poll_filter({mk_rec_type: 'contact', display_name: 'Bob Marley'}),
        () => UC.meg.getRecord('contact', 'display_name', 'Bob Marley'),
        (res) => expect(UC.clean(res).avatar_urls).toEqual({
            "size_100": "<avatar_size_100:Bob Marley>",
            "size_50": "<avatar_size_50:Bob Marley>",
            "size_575": "<avatar_size_575:Bob Marley>",
        }),

        // bob deletes his avatar and now there's no avatar connected to his contact record
        () => client.api_call("api/avatar/delete", {}),
        (res) => expect(UC.clean(res).stream[0].avatar_urls).toEqual({}),
        // meg checks that bob has no avatar
        () => UC.meg.poll_filter({mk_rec_type: 'contact', display_name: 'Bob Marley'}),
        () => UC.meg.getRecord('contact', 'display_name', 'Bob Marley'),
        (res) => expect(UC.clean(res).avatar_urls).toEqual({}),
    ]);
});