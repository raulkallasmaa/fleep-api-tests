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
        () => client.api_put("api/business/avatar/upload", './data/avatar1.jpg'),
        // check that the org now has an avatar
        (res) => expect(UC.clean(res.files, {
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
        }]),

        // change the orgs avatar
        () => client.api_put("api/business/avatar/upload", './data/avatar2.jpg'),
        // check that the org now has a new avatar
        (res) => expect(UC.clean(res.files, {
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
        }]),
        // delete the org avatar
        () => client.api_call("api/business/delete_avatar/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual({
            "stream": [{
            "avatar_urls": "{}",
            "grace_time": "...",
            "is_admin": true,
            "is_member": true,
            "mk_rec_type": "org_header",
            "organisation_founder_id": "<account:Bob Marley>",
            "organisation_id": "<org:orgName>",
            "organisation_name": "orgName",
            "status": "bos_new",
            "trial_time": "...",
            "version_nr": 4,
            }]
        }),
    ]);
});