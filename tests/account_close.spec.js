import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('account close tests', function () {
    let client = UC.bob;
    let conv_topic = 'topic1';
    let conv_topic2 = 'topic2';
    let org_name = 'orgName1';
    let team_name = 'teamName1';

    return thenSequence([
        // create org
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        // create team and add meg
        () => client.api_call("api/team/create", {
            team_name: team_name,
            account_ids: [UC.meg.account_id],
        }),
        // create conv1 and add meg
        () => client.api_call("api/conversation/create", {
            topic: conv_topic,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        // create conv2 and add meg
        () => client.api_call("api/conversation/create", {
            topic: conv_topic2,
            account_ids: [UC.meg.account_id],
        }),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic2}),
        () => UC.meg.poke(client.getConvId(conv_topic), true),
        () => UC.meg.poke(client.getConvId(conv_topic2), true),
        // meg deletes conv2
        () => UC.meg.api_call("api/conversation/store/" + client.getConvId(conv_topic2), {is_deleted: true}),
        // meg closes her account
        () => UC.meg.api_call("api/account/close", {}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.poke(client.getConvId(conv_topic2), true),
        // check that meg is removed from both the deleted conv and the regular conv and also from the team
        () => client.getConv(conv_topic).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        () => client.getConv(conv_topic2).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        () => client.getTeam(team_name).members,
        (res) => expect(UC.clean(res)).toEqual(["<account:Bob Marley>"]),
        // check that meg is logged out after account close
        () => UC.meg.logout()
        .then(() => Promise.reject(new Error('Expired token, please relogin')),
            (r) => expect(r.statusCode).toEqual(401)),
        // check that meg can not log back in
        () => UC.meg.login()
            .then(() => Promise.reject(new Error('Incorrect email or password')),
                (r) => expect(r.statusCode).toEqual(431)),
        // THIS API CALL SHOULDN'T WORK. ORG ADMIN SHOULDN'T BE ABLE TO CLOSE HIS ACCOUNT
        () => client.api_call("api/account/close"),
    ]);
});
