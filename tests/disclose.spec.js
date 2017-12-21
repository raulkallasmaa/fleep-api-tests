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

let managed_team_meg = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:teamMeg>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": true,
    "is_org_wide": false,
    "is_tiny": false,
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Meg Griffin>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": "<org:orgDisclose>",
    "team_id": "<team:teamMeg>",
    "team_name": "teamMeg",
    "team_version_nr": 1,
    }],
};

let managed_team_don = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:teamDon>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": true,
    "is_org_wide": false,
    "is_tiny": false,
    "managed_time": "...",
    "members": [
    "<account:Bob Marley>",
    "<account:Don Johnson>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": "<org:orgDisclose>",
    "team_id": "<team:teamDon>",
    "team_name": "teamDon",
    "team_version_nr": 1,
    }],
};

let org_conv_team1 = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
    "cmail": "<cmail:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
    "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
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
    "<team:teamMeg>",
    ],
    "topic": "managedConvDiscloseUsingTeamIDsAndAccountIDs",
    }],
};

let org_conv_team2 = {
    "stream": [{
    "admins": [
    "<account:Bob Marley>",
    ],
    "autojoin_url": "<autojoin:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
    "cmail": "<cmail:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
    "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
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
    "<team:teamDon>",
    "<team:teamMeg>",
    ],
    "topic": "managedConvDiscloseUsingTeamIDsAndAccountIDs",
    }],
};

let free_team_jil = {
    "stream": [{
    "admins": [],
    "autojoin_url": "<autojoin:teamJil>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": false,
    "is_org_wide": false,
    "is_tiny": false,
    "members": [
    "<account:Jil Smith>",
    "<account:Ron Jeremy>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": null,
    "team_id": "<team:teamJil>",
    "team_name": "teamJil",
    "team_version_nr": 1,
    }],
};

let free_team_jon = {
    "stream": [{
    "admins": [],
    "autojoin_url": "<autojoin:teamJon>",
    "is_autojoin": false,
    "is_deleted": false,
    "is_managed": false,
    "is_org_wide": false,
    "is_tiny": false,
    "members": [
    "<account:Jon Lajoie>",
    "<account:Ron Jeremy>",
    ],
    "mk_rec_type": "team",
    "mk_sync_mode": "tsm_full",
    "organisation_id": null,
    "team_id": "<team:teamJon>",
    "team_name": "teamJon",
    "team_version_nr": 1,
    }],
};

let free_conv_team1 = {
    "admins": [],
    "can_post": true,
    "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
    "creator_id": "<account:Ron Jeremy>",
    "default_members": [],
    "export_files": [],
    "export_progress": "1",
    "guests": [],
    "has_email_subject": false,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 3,
    "inbox_time": "...",
    "is_automute": false,
    "is_list": false,
    "is_managed": false,
    "is_mark_unread": false,
    "is_premium": false,
    "join_message_nr": 1,
    "label_ids": [
    "<label:teamJil>",
    ],
    "last_inbox_nr": 2,
    "last_message_nr": 5,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Jil Smith>",
    "<account:Meg Griffin>",
    "<account:Ron Jeremy>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "passive": [],
    "profile_id": "<account:Ron Jeremy>",
    "read_message_nr": 5,
    "send_message_nr": 1,
    "show_message_nr": 5,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [
    "<team:teamJil>",
    ],
    "topic": "freeConvDiscloseUsingTeamIDsAndAccountIDs",
    "topic_message_nr": 1,
    "unread_count": 0,
};

let free_conv_team2 = {
    "admins": [],
    "can_post": true,
    "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
    "creator_id": "<account:Ron Jeremy>",
    "default_members": [],
    "export_files": [],
    "export_progress": "1",
    "guests": [],
    "has_email_subject": false,
    "has_pinboard": false,
    "has_task_archive": false,
    "has_taskboard": false,
    "inbox_message_nr": 3,
    "inbox_time": "...",
    "is_automute": false,
    "is_list": false,
    "is_managed": false,
    "is_mark_unread": false,
    "is_premium": false,
    "join_message_nr": 1,
    "label_ids": [
    "<label:teamJil>",
    "<label:teamJon>",
    ],
    "last_inbox_nr": 2,
    "last_message_nr": 8,
    "last_message_time": "...",
    "leavers": [],
    "members": [
    "<account:Don Johnson>",
    "<account:Jil Smith>",
    "<account:Jon Lajoie>",
    "<account:Meg Griffin>",
    "<account:Ron Jeremy>",
    ],
    "mk_alert_level": "default",
    "mk_conv_type": "cct_default",
    "mk_rec_type": "conv",
    "organisation_id": null,
    "passive": [],
    "profile_id": "<account:Ron Jeremy>",
    "read_message_nr": 8,
    "send_message_nr": 1,
    "show_message_nr": 8,
    "snooze_interval": 0,
    "snooze_time": 0,
    "teams": [
    "<team:teamJil>",
    "<team:teamJon>",
    ],
    "topic": "freeConvDiscloseUsingTeamIDsAndAccountIDs",
    "topic_message_nr": 1,
    "unread_count": 0,
};

test('conversation disclose and disclose all in managed conversation and managed team using team ids and account ids', function () {
    let client = UC.bob;
    let conv_topic = 'managedConvDiscloseUsingTeamIDsAndAccountIDs';
    let org_name = 'orgDisclose';
    let team_name1 = 'teamMeg';
    let team_name2 = 'teamDon';

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
        // create a managed team with meg
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: team_name1,
            account_ids: [UC.meg.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(managed_team_meg),
        // create a managed team with don
        () => client.api_call("api/business/create_team/" + client.getOrgId(org_name), {
            team_name: team_name2,
            account_ids: [UC.don.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(managed_team_don),
        // create a managed conversation and send 2 messages
        () => client.api_call("api/business/create_conversation/" + client.getOrgId(org_name), {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'msg1'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'msg2'}),
        // add team1 and jil to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_team_ids: [client.getTeamId(team_name1)],
            add_account_ids: [UC.jil.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(org_conv_team1),
        // check that neither meg nor jil can see the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose the conv messages to team1 member meg and regular user jil
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(team_name1)],
            account_ids: [UC.jil.account_id],
            message_nr: 2,
        }),
        // check that meg now sees the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        () => UC.meg.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>msg2</p></msg>",
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
        () => UC.jil.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        () => UC.jil.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>msg2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        // add team2 and jon to the conv
        () => client.api_call("api/business/store_conversation/" + client.getOrgId(org_name), {
            conversation_id: client.getConvId(conv_topic),
            add_team_ids: [client.getTeamId(team_name2)],
            add_account_ids: [UC.jon.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(org_conv_team2),
        // check that neither don nor jon can see the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose all the conv messages to team2 member don and regular user jon
        () => client.api_call("api/conversation/disclose_all/" + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(team_name2)],
            account_ids: [UC.jon.account_id],
        }),
        // check that don now sees the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        () => UC.don.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>msg2</p></msg>",
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
        () => UC.jon.getMessage(/msg1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>msg1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
        () => UC.jon.getMessage(/msg2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Bob Marley>",
            "conversation_id": "<conv:managedConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>msg2</p></msg>",
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

test('conversation disclose and disclose all in free conversation and free team using team ids and account ids', function () {
    let client = UC.ron;
    let conv_topic = 'freeConvDiscloseUsingTeamIDsAndAccountIDs';
    let team_name1 = 'teamJil';
    let team_name2 = 'teamJon';

    return thenSequence([
        // create a free team with jil
        () => client.api_call("api/team/create", {
            team_name: team_name1,
            account_ids: [UC.jil.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(free_team_jil),
        // create a free team with jon
        () => client.api_call("api/team/create", {
            team_name: team_name2,
            account_ids: [UC.jon.account_id],
        }),
        (res) => expect(UC.clean(res)).toMatchObject(free_team_jon),
        // create a free conversation and send 2 messages
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'txt1'}),
        () => client.api_call("api/message/store/" + client.getConvId(conv_topic), {message: 'txt2'}),
        // add team1 and meg to the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name1)],
            add_account_ids: [UC.meg.account_id],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(client.getConv(conv_topic))).toMatchObject(free_conv_team1),
        // check that neither meg nor jil can see the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'txt1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.meg.matchStream({mk_rec_type: 'message', message: 'txt2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'txt1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jil.matchStream({mk_rec_type: 'message', message: 'txt2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose the conv messages to team1 member jil and regular user meg
        () => client.api_call("api/conversation/disclose/" + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(team_name1)],
            account_ids: [UC.meg.account_id],
            message_nr: 2,
        }),
        // check that meg now sees the 2 messages
        () => UC.meg.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.meg.getMessage(/txt1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>txt1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Meg Griffin>",
            "tags": [],
        }),
        () => UC.meg.getMessage(/txt2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>txt2</p></msg>",
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
        () => UC.jil.getMessage(/txt1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>txt1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        () => UC.jil.getMessage(/txt2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>txt2</p></msg>",
            "message_nr": 3,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 2,
            "profile_id": "<account:Jil Smith>",
            "tags": [],
        }),
        // add team2 and don to the conv
        () => client.api_call("api/conversation/store/" + client.getConvId(conv_topic), {
            add_team_ids: [client.getTeamId(team_name2)],
            add_account_ids: [UC.don.account_id],
        }),
        () => client.poke(client.getConvId(conv_topic), true),
        () => expect(UC.clean(client.getConv(conv_topic))).toMatchObject(free_conv_team2),
        // check that neither don nor jon can see the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.don.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg1'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        () => UC.jon.matchStream({mk_rec_type: 'message', message: 'msg2'}),
        (res) => expect(UC.clean(res)).toEqual(null),
        // disclose all the conv messages to team2 member jon and regular user don
        () => client.api_call("api/conversation/disclose_all/" + client.getConvId(conv_topic), {
            team_ids: [client.getTeamId(team_name2)],
            account_ids: [UC.don.account_id],
        }),
        // check that don now sees the 2 messages
        () => UC.don.api_call("api/conversation/sync/" + client.getConvId(conv_topic)),
        () => UC.don.getMessage(/txt1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>txt1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Don Johnson>",
            "tags": [],
        }),
        () => UC.don.getMessage(/txt2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>txt2</p></msg>",
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
        () => UC.jon.getMessage(/txt1/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 1,
            "lock_account_id": null,
            "message": "<msg><p>txt1</p></msg>",
            "message_nr": 2,
            "mk_message_state": "urn:fleep:message:mk_message_state:plain",
            "mk_message_type": "text",
            "mk_rec_type": "message",
            "posted_time": "...",
            "prev_message_nr": 1,
            "profile_id": "<account:Jon Lajoie>",
            "tags": [],
        }),
        () => UC.jon.getMessage(/txt2/),
        (res) => expect(UC.clean(res)).toMatchObject({
            "account_id": "<account:Ron Jeremy>",
            "conversation_id": "<conv:freeConvDiscloseUsingTeamIDsAndAccountIDs>",
            "inbox_nr": 2,
            "lock_account_id": null,
            "message": "<msg><p>txt2</p></msg>",
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
