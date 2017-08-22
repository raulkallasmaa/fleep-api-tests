import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Michael Scofield',
    'Lincoln Burrows@',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let team_after_create = {
    "admins": [
    "<account:Michael Scofield>",
    ],
    "autojoin_url": "<autojoin:teamName>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": true,
    "is_tiny": false,
    "members": [
    "<account:Lincoln Burrows>",
    "<account:Michael Scofield>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": "<org:organisationName>",
    "team_id": "<team:teamName>",
    "team_name": "teamName",
    "team_version_nr": 4,
};

let sync_changelog = {
    "stream": [
    {
    "account_id": "<account:Michael Scofield>",
    "event_data": {
    "account_id": "<account:Michael Scofield>",
    "team_id": "<team:teamName>",
    "team_name": "teamName",
    },
    "event_time": "...",
    "event_type": "team.set_managed",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName>",
    "version_nr": 2,
    },
    {
    "account_id": "<account:Michael Scofield>",
    "event_data": {
    "account_id": "<account:Michael Scofield>",
    "organisation_name": "organisationName",
    },
    "event_time": "...",
    "event_type": "create_org",
    "mk_rec_type": "org_changelog",
    "organisation_id": "<org:organisationName>",
    "version_nr": 1,
    }]
};

test('join team via email invite', function () {
    let client = UC.michael;
    let conv_topic = 'joinViaEmail';
    let team_name = 'teamName';
    let org_name = 'organisationName';
    let nfid = null;

    return thenSequence([

        // create conversation for the team and then create org
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),

        // create team
        () => client.api_call("api/team/create", {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.api_call("api/account/lookup", {lookup_list: [UC.lincoln.email], ignore_list: []}),
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {
            add_conversations: [client.getConvId(conv_topic)],
            add_account_ids: [client.getRecord('contact', 'email', UC.lincoln.email).account_id],
            is_managed: true}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(client.getTeam(team_name))).toEqual(team_after_create),
        () => UC.lincoln.waitMail({
            subject: /invited you to/,
            body: /has started using Fleep messenger, and added you to/
        }),

        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },

        // prepare and confirm Lincoln's registration and joining the team
        () => UC.lincoln.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.lincoln.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.lincoln.info.display_name,
            password: UC.lincoln.password,
            fleep_address: res.suggestions[0]
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => client.api_call("api/account/lookup", {lookup_list: [UC.lincoln.email], ignore_list: []}),
        () => client.api_call("api/business/sync_changelog/" + client.getOrgId(org_name), {}),
        (res) => expect(UC.clean(res)).toEqual(sync_changelog)
    ]);
});
