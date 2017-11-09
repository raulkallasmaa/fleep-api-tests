import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Bob Marley',
    'Meg Griffin',
    'Jil Smith',
    'Don Johnson',
    'Ron Jeremy',
    'Jon Lajoie',
    'King Kong',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

let org_members_added = {
    "stream": [{
    "active_member_count": "...",
    "grace_time": "...",
    "is_admin": true,
    "is_member": true,
    "mk_rec_type": "org_header",
    "organisation_founder_id": "<account:Bob Marley>",
    "organisation_id": "<org:orgDisclose>",
    "organisation_name": "orgDisclose",
    "status": "bos_new",
    "trial_time": "...",
    "version_nr": 2,
    },
    {
    "account_id": "<account:Bob Marley>",
    "is_admin": true,
    "mk_member_status": "bms_active",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:orgDisclose>",
    },
    {
    "account_id": "<account:Don Johnson>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:orgDisclose>",
    },
    {
    "account_id": "<account:Jil Smith>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:orgDisclose>",
    },
    {
    "account_id": "<account:Jon Lajoie>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:orgDisclose>",
    },
    {
    "account_id": "<account:Meg Griffin>",
    "inviter_id": "<account:Bob Marley>",
    "is_admin": false,
    "mk_member_status": "bms_pending",
    "mk_rec_type": "org_member",
    "organisation_id": "<org:orgDisclose>",
    }],
};

let managed_team_women = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:convDisclose>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": true,
    "is_org_wide": false,
    "is_tiny": false,
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Jil Smith>",
    "<account:Meg Griffin>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": "<org:orgDisclose>",
    "team_id": "<team:convDisclose>",
    "team_name": "convDisclose",
    "team_version_nr": 1,
    }],
};

let managed_team_men = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:convDiscloseAll>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": true,
    "is_org_wide": false,
    "is_tiny": false,
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Don Johnson>",
    "<account:Jon Lajoie>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": "<org:orgDisclose>",
    "team_id": "<team:convDiscloseAll>",
    "team_name": "convDiscloseAll",
    "team_version_nr": 1,
    }],
};

let org_conv_team1 = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDiscloseUsingTeamIDs>",
    "cmail": "<cmail:managedConvDiscloseUsingTeamIDs>",
    "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "guests": [],
    "has_email_subject": false,
    "is_deletable": true,
    "is_list": false,
    "is_managed": true,
    "leavers": [],
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Jil Smith>",
    "<account:Meg Griffin>",
    ],
    "mk_conv_type": "cct_default",
    "mk_rec_type": "org_conv",
    "organisation_id": "<org:orgDisclose>",
    "teams": [
    "<team:convDisclose>",
    ],
    "topic": "managedConvDiscloseUsingTeamIDs",
    }],
};

let org_conv_team2 = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDiscloseUsingTeamIDs>",
    "cmail": "<cmail:managedConvDiscloseUsingTeamIDs>",
    "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
    "creator_id": "<account:Bob Marley>",
    "default_members": [],
    "guests": [],
    "has_email_subject": false,
    "is_deletable": true,
    "is_list": false,
    "is_managed": true,
    "leavers": [],
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Don Johnson>",
    "<account:Jil Smith>",
    "<account:Jon Lajoie>",
    "<account:Meg Griffin>",
    ],
    "mk_conv_type": "cct_default",
    "mk_rec_type": "org_conv",
    "organisation_id": "<org:orgDisclose>",
    "teams": [
    "<team:convDisclose>",
    "<team:convDiscloseAll>",
    ],
    "topic": "managedConvDiscloseUsingTeamIDs",
    }],
};

test('conversation disclose and disclose all in managed conversation and managed team using team ids parameter', function () {
    let client = UC.bob;
    let conv_topic = 'managedConvDiscloseUsingTeamIDs';
    let team_name1 = 'convDisclose';
    let team_name2 = 'convDiscloseAll';
    let org_name = 'orgDisclose';

    return thenSequence([
        () => UC.meg.initial_poll(),
        () => UC.don.initial_poll(),
        () => UC.jil.initial_poll(),
        () => UC.jon.initial_poll(),
        // create org and invite 4 users
        () => client.api_call("api/business/create", {organisation_name: org_name}),
        () => client.poll_filter({mk_rec_type: 'org_header', organisation_name: org_name}),
        () => client.api_call("api/business/configure/" + client.getOrgId(org_name), {
            add_account_ids: [UC.meg.account_id, UC.don.account_id, UC.jil.account_id, UC.jon.account_id]
        }),
        (res) => expect(UC.clean(res)).toMatchObject(org_members_added),
        // get meg into org
        () => UC.meg.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.meg.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.meg.api_call("api/business/join/" + client.getOrgId(org_name), {reminder_id: res.reminder_id}),
        // get don into org
        () => UC.don.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.don.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.don.api_call("api/business/join/" + client.getOrgId(org_name), {reminder_id: res.reminder_id}),
        // get jil into org
        () => UC.jil.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.jil.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.jil.api_call("api/business/join/" + client.getOrgId(org_name), {reminder_id: res.reminder_id}),
        // get jon into org
        () => UC.jon.poll_filter({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        () => UC.jon.matchStream({mk_rec_type: 'reminder', organisation_id: client.getOrgId(org_name)}),
        (res) => UC.jon.api_call("api/business/join/" + client.getOrgId(org_name), {reminder_id: res.reminder_id}),
        // create a managed team with meg and jil
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: team_name1,
            account_ids: [UC.meg.account_id, UC.jil.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(managed_team_women),
        // create a managed team with don and jon
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: team_name2,
            account_ids: [UC.don.account_id, UC.jon.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(managed_team_men),
        // create a managed conversation and send 2 messages
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'text1'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'text2'}),
        // add team1 to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_team_ids: [client.getTeamId(team_name1)],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(org_conv_team1),
        // check that neither meg nor jil can see the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'text1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'text2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'text1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'text2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose the conv messages to team1 members meg and jil
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(team_name1)],
            message_nr: 2,
        }),
        // check that meg now sees the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.getMessage(/text1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>text1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        () => UC.meg.getMessage(/text2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>text2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        // check that jil now sees the 2 messages
        () => UC.jil.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jil.getMessage(/text1/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>text1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        () => UC.jil.getMessage(/text2/),
        (res) => expect(UC.clean(res)).toEqual({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>text2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        // add team2 to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_team_ids: [client.getTeamId(team_name2)],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(org_conv_team2),
        // check that neither don nor jon can see the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'text1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'text2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'text1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'text2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose all the conv messages to team2 members don and jon
        () => client.api_call("api/conversation/disclose_all/" + client.getConvId(conv_topic), {team_ids: [client.getTeamId(team_name2)]}),
        // check that don now sees the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.getMessage(/text1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>text1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        () => UC.don.getMessage(/text2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>text2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        // check that jon now sees the 2 messages
        () => UC.jon.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jon.getMessage(/text1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>text1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
        () => UC.jon.getMessage(/text2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>text2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
    ]);
});
