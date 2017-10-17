import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy@',
    'Jon Lajoie',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let FIND_RECS = [
    {"mk_rec_type": "team"},
    {'mk_message_type': 'signin'},
    {"label": "freeTeam"},
];

let EXPECT_RECS = [{
    "admins": [],
    "autojoin_url": "<autojoin:freeTeam>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": false,
    "is_org_wide": false,
    "is_tiny": false,
    "members": ["<account:Bob Marley>", "<account:Ron Jeremy>"],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": null,
    "team_id": "<team:freeTeam>",
    "team_name": "freeTeam",
    "team_version_nr": 4
    },
    {
    "index": "...",
    "is_in_muted": true,
    "is_in_recent": true,
    "is_on_left_pane": false,
    "label": "freeTeam",
    "label_id": "<label:freeTeam>",
    "mk_label_status": "active",
    "mk_label_subtype": "team_label",
    "mk_label_type": "system_label",
    "mk_rec_type": "label",
    "team_id": "<team:freeTeam>"
    },
    {
    "account_id": "<account:Ron Jeremy>",
    "conversation_id": "<conv:inviteToTeamViaEmail>",
    "inbox_nr": -1,
    "lock_account_id": null,
    "message": { "sysmsg_text": "{author} became a Fleep user." },
    "message_nr": 5,
    "mk_message_state": "urn:fleep:message:mk_message_state:system",
    "mk_message_type": "signin",
    "mk_rec_type": "message",
    "posted_time": "...",
    "prev_message_nr": 4,
    "profile_id": "<account:Bob Marley>",
    "tags": []
}];

test('invite to team via email and check for the correct system message', function () {
    let client = UC.bob;
    let conv_topic = 'inviteToTeamViaEmail';
    let team_name = 'freeTeam';
    let nfid = null;

    return thenSequence([
        // bob creates team
        () => client.initial_poll(),
        () => client.api_call("api/team/create", {team_name: team_name}),
        () => client.poll_filter({mk_rec_type: 'team', team_name: team_name}),

        // bob creates convo and adds team
        () => client.api_call("api/conversation/create", {topic: conv_topic, team_ids: [client.getTeamId(team_name)]}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // do a lookup for the email contacts
        () => client.api_call("api/account/lookup", {lookup_list: [UC.ron.email], ignore_list: []}),

        // bob invites ron to team conv via email
        () => client.api_call("api/team/configure/" + client.getTeamId(team_name), {
            add_account_ids: [client.getRecord('contact', 'email', UC.ron.email).account_id]}),

        // bob sends message to team conv
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'randomMessageText'
        }),

        // ron receives the email invitation
        () => UC.ron.waitMail({
            subject: /invited you to/,
            body: /has started using Fleep messenger, and added you to/
        }),

        // get the notification id from the link from the email
        (res) => {
            let link = /https:[^\s]+/.exec(res.body)[0];
            nfid = /notification_id=([^=&]+)/.exec(link)[1];
            return nfid;
        },

        // prepare and confirm ron's registration and joining the team chat
        () => UC.ron.raw_api_call("api/account/prepare/v2", {notification_id: nfid}),
        (res) => UC.ron.raw_api_call("api/account/confirm/v2", {
            notification_id: nfid,
            display_name: UC.ron.info.display_name,
            password: UC.ron.password,
            fleep_address: res.suggestions[0]
        }),
        () => UC.ron.login(),

        // check that correct system message is in team chat (Ron became a Fleep user.)
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(client.matchStream(FIND_RECS))).toEqual(EXPECT_RECS),
    ]);
});
