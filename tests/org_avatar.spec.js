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

test('org avatar upload, change and delete', function () {
    let client = UC.bob;
    let conv_topic = 'orgAvatar';
    let org_name = 'orgName';
    return thenSequence([
        // create org and add meg
        () => client.api_call("api/business/create", {
            organisation_name: org_name,
            add_account_ids: [UC.meg.account_id]
        }),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create conv and add meg
        () => client.api_call("api/conversation/create", {topic: conv_topic, account_ids: [UC.meg.account_id]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // upload an avatar for the org
        () => client.api_put("api/business/avatar/upload", './data/user_avatar1.jpg'),
        // check that the org now has an avatar
        (res) => expect(UC.clean(res.files, {
            file_id: ['avatar_file', 'name'],
            upload_url: ['upload_url', 'name']
        })).toEqual([{
            "file_id": "<avatar_file:untitled.dat>",
            "file_sha256": "3508c9011a8b93ef73df7be4aa2231d2a6e7f06a9a967e18a38263cde160b281",
            "file_type": "application/octet-stream",
            "name": "untitled.dat",
            "size": 24875,
            "upload_url": "<upload_url:untitled.dat>",
        }]),

        // change the orgs avatar
        () => client.api_put("api/business/avatar/upload", './data/user_avatar2.jpg'),
        // check that the org now has a new avatar
        (res) => expect(UC.clean(res.files, {
            file_id: ['avatar_file', 'name'],
            upload_url: ['upload_url', 'name']
        })).toEqual([{
            "file_id": "<avatar_file:untitled.dat>",
            "file_sha256": "696633432af4332e4f099466d0354c7ea7eae0c36c9f92535c855cef95b4aaa5",
            "file_type": "application/octet-stream",
            "name": "untitled.dat",
            "size": 267164,
            "upload_url": "<upload_url:untitled.dat>",
        }]),
        // delete the org avatar
        () => client.api_call("api/business/delete_avatar/" + client.getOrgId(org_name), {}),
        // (res) => expect(UC.clean(res)).toEqual({}),
    ]);
});