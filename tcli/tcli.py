#! /usr/bin/env python

"""tcli <ini> <command> <command args>
    test-login      - try to log in
    test-check      - check that conversation checks are working as expected
    test-message    - test message services
    test-show       - show conversations with given topic
    test-contacts   - test contact syncing methods
    test-dialog     - test case two people chatting and one listening
    test-crapnet    - test that client_req_id travels through event sender
    test-topic      - test changing conversation topic
    test-listen     - test listen api call and fresh conv count
    test-pin        - test pinboard functions
    test-memory     - test viewing conversations after leaving
    test-config     - test changing account info
    test-disclose   - test disclosing conversation history
    test-close      - test closing account
    test-hide       - test hiding conversations
    test-file       - test file upload and avatar upload
    test-flag       - test setting client flags
    test-presence   - test presence and activity
    test-team       - test team management
    test-velocity   - test velocity check on conversation

    --topic <topic> - set topic for test conversation

"""

from fleep.envscript import EnvScript
from fleep import json_encode
from cli import codes
from cli.cache import FleepCache, FleepListen
from cli.api import FleepApi
from fleep.sysclient import FleepSys
from etests.users import Fleeper, Emailer
from etests.utils import Conf
from etests.imapclient import IMAPClient
from etests.smtpclient import SMTPClient

import time
import sys
import os
import requests
import json

import logging
import pprint

s = """Hi there! Warm welcome to Fleep - thats where chat & email meet!
This is your first conversation in Fleep, feel free to try it out and ask questions from us.
In Fleep you can chat with your friends and coworkers either directly in Fleep or by adding them via email addresses.
One useful feature in Fleep is PinBoard - it's a place where members can pin messages from Message Flow so important information does'nt get lost.
You can also use Fleep conversations to share files with other people.
We keep user interface clean and simple, tell us what you think?
Email sucks!"""

# some constants that will be used to construct test scenarios
CHECK = 'check'
MESSAGE = 'msg'
DIALOG = 'dialog'
MEMORY = 'memory'
TOPIC = 'topic'
PIN = 'pin'
CONF = 'conf'
CONVO = '##convo##'
STORE_CONV = 'store-conv'
TESTER = 'tester@fleep.ee'
MARKO = 'marko@fleep.ee'
ASKO = 'asko@fleep.ee'
JUSER = 'juser@dev3.fleep.ee'
ANDRES = 'andres@fleep.ee'
PWORD = '****'

EMAILS = [TESTER, ASKO, MARKO, JUSER, ANDRES]
TOPICS = [CHECK, MESSAGE, DIALOG, MEMORY, TOPIC, PIN, CONF, CONVO, STORE_CONV]

imap = None
smtp = None
domain = None

class TestClient(EnvScript):
    """Sample Fleep client script

    Reads email password and display name from configuration file and
    tries to log in. If user does not exist creates it.
    """
    imap = None
    smtp = None
    domain = None
    def init_optparse(self, p=None):
        """Set up custom options.
        """
        p = super(TestClient, self).init_optparse(p)
        p.set_usage(__doc__.strip())

        # self.options.topic
        p.add_option("--topic", help = "Chat topic")
        p.add_option("--name", help = "Display name variable")
        return p

    def reload(self):
        super(TestClient, self).reload()

        self.domain = self.site.get('web_domain')
        self.url = "https://%s/" % self.domain

        sys_user = self.cf.get('sys_user')
        sys_password = self.cf.get('sys_password')

        ssl_verify = True
        #if self.domain.find('fleep.ee') > 0:
        #    ssl_verify = False

        logging.getLogger('requests').setLevel(logging.WARNING)
        logging.getLogger('urllib3').setLevel(logging.WARNING)

        self.sys_api = FleepSys(self.url, sys_user, sys_password, ssl_verify, job_name = 'tcli')
        self.sys_api.ping()

    def start_email_client(self):
        conf = Conf.load()
        self.imap = IMAPClient(
                username=conf.imap_user,
                password=conf.imap_password,
                host=conf.imap_server)
        self.imap.connect()
        self.imap.login()

        self.smtp = SMTPClient(
                username=conf.smtp_user,
                password=conf.smtp_password,
                host=conf.smtp_server)
        self.smtp.connect()
        self.smtp.login()

        env = os.environ['FLEEP_ENV_NAME']
        if env.startswith('dev'):
            self.domain = env + ".fleep.ee"
        else:
            raise ValueError("full env load not supported")

    def cmd_time_travel(self, email, interval = None):
        self.sys_api.account_time_travel(email, interval)

    def cmd_test_login(self):
        """Try to log in with all the test users and clean all the conversation lists
        """
        # valid login
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        tester_cache.api.account_configure(display_name = TESTER)
        tester_count = tester_cache.clear()
        #print "Cleared from tester:", tester_count
        tester_cache.api.account_logout()
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_count = asko_cache.clear()
        #print "Cleared from asko:", asko_count
        asko_cache.api.account_logout()
        marko_cache = FleepCache(self.url, MARKO, PWORD)
        marko_count = marko_cache.clear()
        #print "Cleared from marko:", marko_count
        marko_cache.api.account_logout()
        # invalid email
        api = FleepApi(self.url)
        api.expect = codes.ERR_BL_ERROR
        api.account_login("ahsdhdh", PWORD)
        # invalid password
        api = FleepApi(self.url)
        api.expect = codes.ERR_BL_ERROR
        api.account_login(TESTER, "ksjdj")

    def cmd_test_org(self):
        self.start_email_client()

        org_cache = {}

        print('Starting')
       	founder = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        founder.register()
        founder_cache = FleepCache(self.url, founder.email, founder.password)
        founder_cache.api.account_configure(display_name = 'Founder Bob')
        print('Founder registered and cache initialized')

        # get org record
	stream = founder_cache.api.business_create('test_org_4')
        for r_rec in stream['stream']:
            if r_rec['mk_rec_type'] == 'org_header':
                org_cache.update(r_rec)
        org_id = org_cache['organisation_id']
        print('Organisation created')

        # register email user and create email conversation
        user_ema = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        user_ema2 = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        emails = '%s, %s, %s' % (founder.email, user_ema.email, user_ema2.email)
        founder_conv = founder_cache.conversation_open('org_invite_prep', emails)
        founder_cache.contacts.describe(user_ema.email, 'EmaYx')
        founder_cache.contacts.describe(user_ema2.email, 'EmaKax')
        ema_id = founder_cache.contacts.get_account_id(user_ema.email)
        ema2_id = founder_cache.contacts.get_account_id(user_ema2.email)
        print('Email users created')

        # register fleep user for org invit with reminder
        user_rem = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        user_rem.register()
        rem_id = user_rem.account_id
        rem_cache = FleepCache(self.url, user_rem.email, user_rem.password)
        rem_cache.api.account_configure(display_name = 'User Rob')
        print('Fleep user created')

        # add invites to org
        stream2 = founder_cache.api.business_configure(
            org_id, add_account_ids = [ema_id, rem_id, ema2_id])
        # print(stream2)
        print('Invite both email and fleep user into org')

        user_ema.confirm_org_invite()
        user_ema.api.account_configure(display_name = 'User Ron')
        print('Ema account confirmed')

        user_ema2.confirm_org_invite()
        user_ema2.api.account_configure(display_name = 'User Jon')
        print('Ema account 2 confirmed')

        # print out initial members
        members = []
	result3 = founder_cache.api.business_sync(org_id)
	print 'Org initial members:', len(result3['stream']), '----'
        for r_rec in result3['stream']:
            if r_rec['mk_rec_type'] == 'org_header':
                print r_rec['mk_rec_type'], r_rec['organisation_name'], r_rec['is_admin']
            if r_rec['mk_rec_type'] == 'org_member':
                print r_rec['mk_rec_type'], r_rec['mk_member_status'], r_rec['is_admin']
                if r_rec['mk_member_status'] == 'bms_active' and not r_rec['is_admin']:
                    members.append(r_rec['account_id'])

        # get reminder and join using it
        r_reminders = rem_cache.api._webapi_call('api/account/sync_reminders')
        r_reminder = r_reminders['stream'][0]
        rem_join_res = rem_cache.api._webapi_call('api/business/join', org_id,
            reminder_id = r_reminder['reminder_id'])
        print 'Join via reminder: ', self._get_stream_str(rem_join_res['stream'])

        founder_cache.poll_poke(founder_conv, is_bg_poke = True)
        result3 = founder_cache.api.business_sync(org_id)
        print 'Org after sync fia reminder', len(result3['stream']), '-----'
        for r_rec in result3['stream']:
            if r_rec['mk_rec_type'] == 'org_header':
                print r_rec['mk_rec_type'], r_rec['organisation_name'], r_rec['is_admin']
            if r_rec['mk_rec_type'] == 'org_member':
                print r_rec['mk_rec_type'], r_rec['mk_member_status'], r_rec['is_admin']

        result4 = founder_cache.api.business_sync_changelog(org_id)
        print 'Changelog:', len(result4['stream'])
        for r_rec in result4['stream']:
            print r_rec['mk_rec_type'], r_rec['event_type'], r_rec['version_nr']

        result5 = founder_cache.api.business_sync_conversations(org_id)
	print 'Conversations:', len(result5['stream'])

        # get reminder
        rem_cache.poll(False)

        # create managed team
        result6 = founder_cache.api.business_create_team(org_id, 'org team 1')
        team_1_id = result6['stream'][0]['team_id']
        print "Team 1 created"

	# add members to team through admin interface
        founder_cache.api.business_store_team(org_id,
            team_id = team_1_id,
            add_account_ids = members)
        print "Memebers added to team 1"

        # wait for it go through machine
        founder_cache.poll_poke(founder_conv, is_bg_poke = True)

        # show the team
        result7 = founder_cache.api.business_sync_teams(org_id)
        print 'Teams:', len(result7['stream'])

        # create another team
        result8 = founder_cache.api.business_create_team(
            org_id, 'org team 2', account_ids = members)
        team_2_id = result8['stream'][0]['team_id']
	print "Team 2 created"

	# create unmanaged team
        resultX = founder_cache.api.team_create('free team 1')
	team_3_id = resultX['stream'][0]['team_id']
	print 'Team 3 created'

	# create managed team through team api
        resultY = founder_cache.api.team_create('org team 3', is_managed=True)
        team_4_id = resultY['stream'][0]['team_id']
        print 'Team 4 created'

	# turn team into managed team
	founder_cache.api.team_configure(team_3_id, is_managed=True)

        # wait for it go through machine
        founder_cache.poll_poke(founder_conv, is_bg_poke = True)

        # show the team
        result9 = founder_cache.api.business_sync_teams(org_id)
        print 'Teams:', len(result9['stream'])

	# check that get teams api call works
        resultA = founder_cache.api.business_get_teams(org_id, [team_1_id, team_2_id])
        print 'Get Teams:', len(resultA['stream'])

        # turn team into managed team
        founder_cache.api.team_configure(team_3_id, is_managed=False)

        # remove members from team
        founder_cache.api.business_store_team(org_id,
            team_id = team_2_id,
            remove_account_ids = members)
	print "Members removed from team 2"

        # delete team throug admin interface
        founder_cache.api.business_store_team(org_id,
            team_id = team_2_id,
	    is_deleted = True)
        print "Team 2 deleted"

        founder_cache.poll_poke(founder_conv, is_bg_poke = True)

        # close org member
        member_id = members[0]
        founder_cache.api.business_configure(org_id,
            close_account_ids = [member_id])
	print "Org member account closed"

        founder_cache.poll(wait = False)
        resultY = founder_cache.api.business_sync(org_id)
        print 'Org sync 2:', len(resultY['stream'])
        for r_rec in resultY['stream']:
            if r_rec['mk_rec_type'] == 'org_header':
                print r_rec['mk_rec_type'], r_rec['organisation_name'], r_rec['is_admin']
            if r_rec['mk_rec_type'] == 'org_member':
                print r_rec['mk_rec_type'], r_rec['mk_member_status'], r_rec['is_admin']

	# create user and team for this user (team is not managed by org)
        tester = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        tester.register()
        tester_cache = FleepCache(self.url, tester.email, tester.password)
        tester_cache.api.account_configure(display_name = 'tester@fleep.ee')
        emails = '%s, %s, %s' % (ASKO, MARKO, founder.email)
        team_5_id = tester_cache.team_create('Test Team In Org', emails)
        print '-----','non mamaged team created','-----'
        print tester_cache.teams.show()

        founder_conv.store(add_team_ids = [team_5_id])
        founder_cache.poll_poke(founder_conv, is_bg_poke = True)
        print founder_conv.show(from_first = True)

        r_nmt = founder_cache.api._webapi_call('api/business/get_conversation_teams', org_id,
            conversation_id = founder_conv.conversation_id)
	print 'Teams returned:', len(r_nmt['stream'])

        # close org
        founder_cache.api.business_close(org_id)
        print('Organisation closed!')

    def cmd_test_trial(self):
        print('Starting')
       	self.start_email_client()
        org_cache = {}
        trial_user = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain,
            display_name='User Trial')
        trial_user.cache.process_retval(
            trial_user.register())
        print('Trial user registered and cache initialized')

	print "create email users"
        user_bob = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain,
            display_name='User Bob')
        user_jon = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain,
            display_name='User Jon')

        print "create organisation"
        trial_user.call_and_cache('api/business/create',
            organisation_name = 'Org Trial Test')
        org_rec = trial_user.cache.find_record('org_header', dict(
            organisation_name = 'Org Trial Test'))

        print "create email accounts and get their records"
        trial_user.call_and_cache('api/account/lookup',
            lookup_list = [user_bob.email, user_jon.email],
            ignore_list=[])
        user_bob_rec = trial_user.cache.find_record('contact',  dict(
            email = user_bob.email))
        user_jon_rec = trial_user.cache.find_record('contact',  dict(
            email = user_jon.email))

	print "set names to emails so their sort order is determined"
        trial_user.call_and_cache('api/contact/describe',
            contact_id = user_bob_rec['account_id'], contact_name = 'Dog')
        trial_user.call_and_cache('api/contact/describe',
            contact_id = user_jon_rec['account_id'], contact_name = 'Cat')

        print "add two email accounts to the organisation"
        trial_user.call_and_cache('api/business/configure', org_rec['organisation_id'],
	    add_account_ids = [user_bob_rec['account_id']])
        user_bob.confirm_org_invite()
        print('User Bob account confirmed')
        trial_user.call_and_cache('api/business/configure', org_rec['organisation_id'],
            add_account_ids = [user_jon_rec['account_id']])
        user_jon.confirm_org_invite()
        print('User Jon account confirmed')

        print "create one managed conversation"
	trial_user.call_and_cache('/api/business/create_conversation',  org_rec['organisation_id'],
	    topic = 'Org Trial Conversation',
            account_ids = [user_bob.account_id, user_jon.account_id])
	trial_conv_rec = trial_user.cache.find_record('org_conv', dict(
            topic = 'Org Trial Conversation'))

        print "create one managed team"
        trial_user.call_and_cache('api/business/create_team',  org_rec['organisation_id'],
            team_name = 'Org Trial Team',
            account_ids = [user_bob.account_id, user_jon.account_id])
        trial_team_rec = trial_user.cache.find_record('team',  dict(
            team_name = 'Org Trial Team'))

        print "send message to let all bg work complete"
        trial_user.call_and_cache('api/message/store', trial_conv_rec['conversation_id'],
            message = 'First message in org trial')
        trial_user.wait_for_fleep_message('First message in org trial', cache=True)

        print 'Contacts before time travel', '######'
        trial_user.cache.print_contacts()
        trial_user.cache.print_organisations()
        trial_user.cache.print_conversations()
        trial_user.cache.print_teams()

        print "time travel 80 days and wait for notice email"
        self.sys_api.api_call('sys/shard/time_travel',
            object_id = org_rec['organisation_id'],
            mk_time_action = 'bbg_trial_notif',
            time_interval = '80 days')
	trial_user.wait_for_email('Your free trial of Fleep for Business will end in 10 days', retries=20)

        print "time travel 89 days and wait for warning email"
        self.sys_api.api_call('sys/shard/time_travel',
            object_id = org_rec['organisation_id'],
            mk_time_action = 'bbg_trial_warn',
            time_interval = '89 days')
	trial_user.wait_for_email('Your free trial of Fleep for Business will end tomorrow', retries=20)

        print "time travel 90 day and wait for trial end email"
        self.sys_api.api_call('sys/shard/time_travel',
            object_id = org_rec['organisation_id'],
            mk_time_action = 'bbg_trial_end',
            time_interval = '90 days')
        trial_user.wait_for_email('Fleep for Business trial ended', retries=20)

        print "Send second message to let all bg work complete"
        trial_user.call_and_cache('api/message/store', trial_conv_rec['conversation_id'],
            message = 'Second message in org trial')
        trial_user.wait_for_fleep_message('Second message in org trial', cache=True)

        print 'Contacts after time travel', '######'
        trial_user.cache.print_contacts()
        trial_user.cache.print_organisations()
        trial_user.cache.print_conversations()
        trial_user.cache.print_teams()
        trial_user.cache.print_counts()

    def cmd_test_reset(self):
        self.start_email_client()

        fleeper = Fleeper(
                imap=self.imap,
                smtp=self.smtp,
                domain=self.domain)

        # register account
        fleeper.register()
        fleeper_cache = FleepCache(self.url, fleeper.email, fleeper.password)

        fleeper_cache.api.account_reset_password(fleeper.email)

        rx_reset = 'https://[a-z.0-9]+/reset[?=%0-9a-z_-]+'
        url, _ = fleeper.wait_for_regex(rx_reset)
        if url is None:
            raise RuntimeError('Confirmation email not found!')
        print "Password reset email received!"

        # see that confirming new password fails with wrong notification id
        fleeper_cache.api.expect = codes.ERR_BL_ERROR
        fleeper_cache.api.account_confirm_password("00000000-0000-0000-0000-000000000001", "newpw")
        fleeper_cache.api.expect = codes.SUCCESS

        notification_id = url.split("=")[1]

        # confirm new password
        fleeper_cache.api.account_confirm_password(notification_id, "newpw")
        print "New password confirmed!"

        # try to login with new password
        fleeper_cache = FleepCache(self.url, fleeper.email, "newpw")
        print "Login successful!"


    def cmd_test_config(self):
        """Test changing account info
        """
        api = FleepApi(self.url)
        acc = api.account_login(TESTER, PWORD)
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        marko_cache = FleepCache(self.url, MARKO, PWORD)
        print "DONE: Caches created successfully"
        # see that inputting wrong password causes configure to fail
        api.expect = codes.ERR_BL_ERROR
        api.account_configure(old_password = "asfjg", password = "newpw")
        print "DONE: Wrong password check"
        api.expect = codes.SUCCESS
        # change account options
        api.account_configure(display_name = 'Tester',
            old_password = PWORD, password = "newpw", email_interval = 'daily')
        print "DONE: Password change check"
        # check if password has been properly changed
        api.expect = codes.ERR_BL_ERROR
        api.account_login(TESTER, PWORD)
        print "DONE: Login fail with old password check"
        api.expect = codes.SUCCESS
        tester_cache = FleepCache(self.url, TESTER, "newpw")
        # change password and email interval back to old values
        api.account_configure(old_password = "newpw", password = PWORD, email_interval = "never")
        print "DONE: Restore password"
        # make topic to see if others can see new display name
        topic = self.options.topic if self.options.topic else CONF
        emails = '%s, %s' % (ASKO, TESTER)
        tester_cache.api.expect = codes.ERR_UNAUTHORIZED
        # relogin and continue
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        convs = tester_cache.conversation_find(topic)
        if len(convs) > 0:
               convs[0].set_topic("conf1")
        tester_conv = tester_cache.conversation_open(topic, emails)
        tester_conv.add_members(MARKO)
        tester_conv.message_send('Testime conffi')
        print "DONE: All tests, now display results!"
        asko_cache.poll_until(tester_conv)
        marko_cache.poll_until(tester_conv)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)
        marko_conv = marko_cache.conversation_get(tester_conv.conversation_id)
        print asko_conv.show(from_first = True)
        print marko_conv.show(from_first = True)
        api.account_configure(display_name = TESTER)

    def cmd_test_automute(self):
        api = FleepApi(self.url)
        api.account_login(TESTER, PWORD)
        api.account_configure(is_automute_enabled = True)

        self.start_email_client()

        fleeper = Fleeper(
                imap=self.imap,
                smtp=self.smtp,
                domain=self.domain)

        fleeper.register()
        fleeper_cache = FleepCache(self.url, fleeper.email, fleeper.password)

        api.account_configure(is_automute_enabled = False)

        emailer = Emailer(
            imap=self.imap,
            smtp=self.smtp,
            domain=self.domain)

        email_part = fleeper.email.split('@')[0]

        emailer.send(
            recipients = [email_part + '@dev13.fleep.ee'],
            subject = "email test",
            message = "email test")

        time.sleep(20)

        print fleeper.email
        print fleeper.password

        print fleeper_cache.show_convlist()

    def cmd_test_fleep_address(self):

        self.start_email_client()

        fleeper = Fleeper(
                imap=self.imap,
                smtp=self.smtp,
                domain=self.domain)

        fleeper.register()
        fleeper_cache = FleepCache(self.url, fleeper.email, fleeper.password)
        email_part = fleeper.email.split('@')[0].split('+')[1]
        fleeper_cache.fleep_address_add(email_part)
        print 'Fleep ID added!'

        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cache.conversation_open('Fleep ID test', fleeper.email)

        asko_cache.contacts.sync_email(fleeper.email)
        if asko_cache.contacts.emails[fleeper.email]['fleep_address'] == email_part:
            print 'Fleep ID synced to contacts!'

        asko_cache.contacts.hide([fleeper.email])

    def cmd_test_check(self):
        """Check that conversation checks are working as expected
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        tester_listen = FleepListen(self.url, TESTER, PWORD)
        # create conversation with some users in it
        topic = self.options.topic if self.options.topic else "check"
        emails = '<%s>, <%s>' % (JUSER, MARKO)

        tester_conv = tester_cach.conversation_open(topic, emails)
        tester_conv.message_send("See http://www.fleep.it.")
        # check that we get bad request with random id
        uid = "00000000-0000-0000-0000-000000000001"
        tester_cach.api.expect = codes.ERR_FATAL
        tester_cach.api.conversation_check_permissions(uid)
        # check that we get bad request with valid user who is not in conv
        asko_cach = FleepCache(self.url, ASKO, PWORD)
        asko_cach.api.client_check()
        asko_cach.api.client_upgrade()
        tester_cach.api.expect = codes.SUCCESS
        tester_cach.conversation_get(tester_conv.conversation_id)
        asko_cach.api.expect = codes.ERR_FATAL
        asko_cach.api.conversation_check_permissions(tester_conv.conversation_id)
        # add member and then let him leave
        tester_cach.api.expect = codes.SUCCESS
        tester_conv.add_members(ASKO)
        # poll until ASKO get conversation
        asko_cach.api.expect = codes.SUCCESS
        # get conversation send one message and leave
        asko_conv = asko_cach.conversation_get(tester_conv.conversation_id)
        asko_conv.message_send("So long ...")
        asko_cach.poll_until(tester_conv)
        leave_msgnr = asko_conv.leave()
        tester_conv.message_send("stuff")
        asko_cach.poll_until(asko_conv, leave_msgnr)
        print asko_conv.show(from_first = True)
        # check that we get forbidden after leaving
        asko_cach.api.expect = codes.ERR_BL_ERROR
        asko_cach.api.conversation_check_permissions(tester_conv.conversation_id)
        asko_conv.message_send("other stuff")
        # and display what we got
        tester_cach.poll(False)
        print tester_conv.show(from_first = True)
        # check that we can no longer poll after logging out
        tester_cach.api.account_logout()
        tester_listen.api.expect = codes.ERR_UNAUTHORIZED
        tester_listen.listen(False)
        print "Logout successful!"

    def cmd_test_message(self):
        """Test message services
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "msg"
        emails = '%s, %s' % (ASKO, MARKO)

        # open or create conversation
        tester_conv = tester_cach.conversation_open(topic, emails)
        marko_cach = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cach.conversation_get(tester_conv.conversation_id)
        # generate bunch of messages to the conversation
        messages = s.split('\n')
        for message in messages:
            message_nr = tester_conv.message_send(message)
            if message.find("does'nt") != -1:
                edit_message_nr = message_nr
                edit_message = message.replace("does'nt", 'does not')
            if message.find('sucks') != -1:
                delete_message_nr = message_nr
            if message.find('PinBoard') != -1:
                pin2_message_nr = message_nr
                tester_conv.message_pin(pin2_message_nr)
        # edit message and check that other user cannot edit
        tester_conv.message_edit(edit_message, edit_message_nr)
        marko_conv.sync_to_last()
        marko_cach.api.expect = codes.ERR_BL_ERROR
        marko_conv.message_edit("some edit", 3)
        # delete message
        marko_cach.api.expect = codes.SUCCESS
        marko_conv.message_delete(delete_message_nr)

        print tester_conv.show(from_first = True)

        # copy message
        tester_conv2 = tester_cach.conversation_open("msg2", emails)
        copy_message_nr = tester_conv.message_copy(edit_message_nr, tester_conv2.conversation_id)
        tester_conv2.sync_to_last()

        # snooze to turn alerts off
        tester_conv2.message_snooze(copy_message_nr)

        print tester_conv2.show(from_first = True)

    @staticmethod
    def _get_stream_counts(stream):
        counts = {}
	for rec in stream:
	    if rec['mk_rec_type'] in counts:
		counts[rec['mk_rec_type']] += 1
	    else:
		counts[rec['mk_rec_type']] = 1
        return counts

    @classmethod
    def _get_stream_str(cls, stream):
        counts = cls._get_stream_counts(stream)
        return '  '.join(['%s: %s' % (k, v) for k, v in counts.items()])

    def cmd_test_team(self):
        """Test team management functionality
        """
        def sync_label_conversations(api, label_id):
            r_result = api._webapi_call('api/label/sync_conversations',
                label_id = label_id,
                mk_init_mode = 'ic_header')
            return self._get_stream_str(r_result['stream'])

        def show_labels(cache):
            labels = sorted(cache.labels.values(), key=lambda x: x.get('label'))
            for r_label in labels:
                if r_label['mk_label_status'] == 'active':
                    print r_label['label'], sync_label_conversations(cache.api, r_label['label_id'])

        self.start_email_client()

        topic = self.options.topic if self.options.topic else "team"
        emails = '%s, %s' % (ASKO, MARKO)
        tester = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        tester.register()
        tester_cache = FleepCache(self.url, tester.email, tester.password)
        listen_cache = FleepCache(self.url, tester.email, tester.password)
        tester_cache.api.account_configure(display_name = 'tester@fleep.ee')
        tester_conv = tester_cache.conversation_open(topic, MARKO)
        listen_cache.poll_until(tester_conv)
        we_nr = tester_conv.message_send('We need to talk...')
        print '-----','team conversation created and first message sent','-----'
        print tester_conv.show()

        team_id = tester_cache.team_create('Test Team', emails)
        print '-----','team created','-----'
        print tester_cache.teams.show()

        print '-----','turn verbosity off/on on left pane','-----'
        tester_cache.api._webapi_call('api/team/configure', team_id,
            is_verbose = False)
        tester_cache.api._webapi_call('api/team/configure', team_id,
            is_verbose = True)

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        team_id2 = tester_cache.team_create('Test Team 2', emails)
        print '-----','team 2 created','-----'
        print tester_cache.teams.show()

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        print '-----','add team to conversation','-----'
        tester_conv.store(add_team_ids = [team_id, team_id2])
        print tester_conv.show(from_first = True)

        print '-----','add member to team','-----'
        tester_cache.team_add_members(team_id, JUSER)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        print tester_cache.team_show_members(team_id)
        print tester_conv.show(from_first = True)

        print '-----','team labels and their conversations','-----'
        show_labels(tester_cache)

        print '-----','remove member','-----'
        tester_cache.team_remove_members(team_id, JUSER)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_conv.sync_to_last()
        print tester_cache.team_show_members(team_id)
        print tester_conv.show(from_first = True)

        print '-----','remove member','-----'
        tester_cache.team_remove_members(team_id, MARKO)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_conv.sync_to_last()
        print tester_cache.team_show_members(team_id)
        print tester_conv.show(from_first = True)

        print '-----','remove team from conversation','-----'
        tester_conv.store(remove_team_ids = [team_id])
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        print tester_conv.show(from_first = True)

        print '-----','remove team','-----'
        tester_cache.team_remove(team_id)
        tester_cache.team_remove(team_id2)
        print tester_cache.teams.show()
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        print tester_conv.show(from_first = True)

        print  '-----','show labels after remove team','-----'
        show_labels(tester_cache)

    def cmd_test_mention(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "mention"
        emails = '%s' % (MARKO)

        # open or create conversation
        tester_conv = tester_cache.conversation_open(topic, emails)
        marko_cach = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cach.conversation_get(tester_conv.conversation_id)

        marko_conv.message_send('hello')
        tester_cache.poll_poke(tester_conv)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

        mnr = marko_conv.message_send('@Tester')
        tester_cache.poll_poke(tester_conv)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

        marko_conv.message_edit('remove mention', mnr)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

        marko_conv.message_delete(mnr)
        tester_cache.poll_poke(tester_conv)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

        marko_conv.message_send('another mention @Tester')
        tester_cache.poll_poke(tester_conv)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

        tester_conv.mark_read()
        tester_cache.poll_poke(tester_conv)
        tester_conv.sync_to_last()
        print tester_conv.show(from_first = True)

    def cmd_test_velocity(self):
        """Test velocity
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "velocity"
        emails = '%s, %s' % (ASKO, MARKO)

        tester_conv = tester_cach.conversation_open(topic, emails)
        for i in range(60):
            message_nr = tester_conv.message_send("message %s" % i)
        tester_cach.api.expect = codes.ERR_BL_ERROR
        tester_conv.message_send("rejected msg")

    def cmd_test_large(self):
        """Test large conversation
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "large"
        emails = '%s' % (MARKO)

        # open or create conversation
        tester_conv = tester_cach.conversation_open(topic, emails)
        marko_cach = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cach.conversation_get(tester_conv.conversation_id)

        hook_url = tester_conv.create_hook("hook", 'import')

        msgs = []

        # generate bunch of messages to the conversation
        for nr in range(55):
            msgs.append({ 'message_key' : None, 'message' : 'This is message nr %s' % nr,
              'posted_time' : int(time.time()),
              'sender_name' : 'asko'})

        requests.post(hook_url,
            headers = {"Content-Type": "application/json"},
            data = json.dumps({'messages': msgs, 'is_read' : True}))

        message_nr = tester_conv.message_send(
            'This is pin message')
        pin_message_nr = tester_conv.message_pin(message_nr)

        marko_cach.poll_until(tester_conv)
        for nr in range(25):
            marko_conv.message_edit(
                'Edited by Marko for %s times!' % nr, pin_message_nr)
        marko_conv.add_members(ASKO)
        tester_cach.poll_until(marko_conv)

        message_nr = tester_conv.message_send(
            'This is edit message')

        for nr in range(25):
            tester_conv.message_edit(
                'Edited by Tester for %s times!' % nr, message_nr)
        # show whole conversation
        print '\n---------------\n',tester_conv.show(from_first = True)
        marko_cach.poll_until(tester_conv)
        print '\n---------------\n',marko_conv.show(from_first = True)
        asko_cach = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cach.conversation_get(tester_conv.conversation_id)
        print '\n---------------\n',asko_conv.show(from_first = True)

    def cmd_test_poke(self):
        topic = self.options.topic if self.options.topic else "test-poke"
        tcache = FleepCache(self.url, TESTER, PWORD)
        tconv = tcache.conversation_open(topic, ASKO)

        mnr1 = tconv.message_send('We need to talk')

        tcache.poll_poke(tconv, is_bg_poke = True)

        print tconv.show(from_first = True)

    def cmd_test_members(self):
        topic = self.options.topic if self.options.topic else "test-members"
        tcache = FleepCache(self.url, TESTER, PWORD)
        emails = 'tester_0@fleep.ee, tester_1@fleep.ee, tester_2@fleep.ee, tester_3@fleep.ee, tester_4@fleep.ee, tester_5@fleep.ee'
        tconv = tcache.conversation_open(topic, emails)
        mnr1 = tconv.message_send('We need to talk')
        emails = 'tester_6@fleep.ee, tester_7@fleep.ee, tester_8@fleep.ee,  tester_9@fleep.ee, %s' % MARKO
        tconv.add_members(emails)

        marko_cach = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cach.conversation_get(tconv.conversation_id)

        marko_cach.poll_until(tconv)

        print tconv.show(from_first = True)
        print marko_conv.show(from_first = True)

        tconv.remove_members(MARKO)
        marko_cach.poll_until(tconv)

        print marko_conv.show(from_first = True)

    def cmd_test_read(self):
        """Test automatic read horizon movement on server side
        """
        topic = self.options.topic if self.options.topic else "test-read"
        emails = '%s, %s' % (ASKO, MARKO)
        lcache = FleepCache(self.url, TESTER, PWORD)
        tcache = FleepCache(self.url, TESTER, PWORD)

        print "------ Tester one message sent, and automatically read"
        tconv = tcache.conversation_open(topic, ASKO)
        mnr1 = tconv.message_send('We need to talk')
        print tconv.show(from_first = True)

        print "\n------ Tester mark unread all messages"
        tconv.mark_read(mnr1 - 1)
        print tconv.show(from_first = True)

        print "\n------ Tester marks read asko opens conversation"
        tconv.mark_read()
        tcache.poll_poke(tconv, is_bg_poke = True)
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_cache.poll_until(tconv)
        asko_conv = asko_cache.conversation_get(tconv.conversation_id, True)
        asko_conv.set_active()
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)

        print "\n----- Asko sends message and tester edits and sends message"
        mnr2 = asko_conv.message_send('Switching to secure frequency! now! sir!')
        tconv.message_edit('We need to talk...', mnr1)
        tconv.message_send('We created an hole in space time continium')
        asko_cache.poll_until(tconv)
        asko_conv.mark_read(mnr2)
        tcache.poll_poke(tconv)
        #tcache.poll_activity(asko_conv, 'is_read', mnr2)
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)

        print "\n----- Asko marks conversation unread"
        asko_conv.mark_read(1)
        tcache.poll_poke(tconv)
        asko_cache.poll(False)
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)

        print "\n----- Asko leaves and tester send a message"
        asko_conv.leave()
        tcache.poll_poke(asko_conv)
        mnr3 = tconv.message_send("Let's do the time warp again")
        tconv.mark_read(mnr3)
        asko_cache.poll_poke(tconv)
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)

        print "\n----- Tester view: after asko rejoins"
        tconv.add_members(ASKO)
        asko_cache.poll_poke(tconv)
        asko_conv.set_active()
        tcache.poll(False)
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)
        tconv.message_send('Just another so we have something to mark read')
        mnr = tconv.message_send('And one more')
        tconv.message_edit('And last one!', mnr)
        asko_cache.poll_poke(tconv)
        asko_conv.mark_all_read()
        tcache.poll_poke(asko_conv)
        print "\n----- Mark all conversation read"
        print tconv.show(from_first = True)
        print ""
        print asko_conv.show(from_first = True)

    def cmd_test_show(self):
        """Just show conversations with given topic
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else MESSAGE

        for tester_conv in tester_cach.conversation_find(topic):
            tester_conv.sync_to_last()
            print tester_conv.show(from_first = True)

    def cmd_test_dialog(self):
        """Test case two people chatting and one listening
        """
        topic = self.options.topic if self.options.topic else "dialog"
        emails = '%s, %s' % (ASKO, MARKO)
        lcache = FleepCache(self.url, TESTER, PWORD)
        tcache = FleepCache(self.url, TESTER, PWORD)

        tconv = tcache.conversation_open(topic, emails)
        lcache.poll_until(tconv)
        tconv.message_send('We need to talk...')
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cache.conversation_get(tconv.conversation_id)
        asko_conv.set_active()
        asko_conv.message_send('Switching to secure frequency! now! sir!')
        messages = s.split('\n')
        for i, imsg in enumerate(messages):
            if i % 2:
                tconv.message_send(imsg)
            else:
                asko_conv.message_send(imsg)
        message_nr = asko_conv.last_message_nr
        tconv.add_members(JUSER)
        tconv.mark_read()
        asko_conv.message_delete(message_nr)
        asko_conv.message_send("And warm welcome to our user.")
        asko_conv.mark_read()
        asko_conv.mark_read(9)
        tconv.sync_to_last()
        asko_conv.sync_to_last()
        # set show horizon to 0 to show whole conversation
        print tconv.show(from_first = True)
        print asko_conv.show(from_first = True)
        lconv = lcache.conversation_get(tconv.conversation_id)
        lconv.set_active()
        lcache.poll_until(asko_conv)
        print lconv.show(from_first = True)

    def cmd_test_crapnet(self):
        """Test client_request_id roundtrip through event sender
        """
        topic = self.options.topic if self.options.topic else "crapnet"
        emails = '%s, %s' % (ASKO, MARKO)
        listen_cache = FleepCache(self.url, TESTER, PWORD)
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        client_req_id = '8faf3a5a-9e31-4e1b-b12c-04935bc71efb'

        tester_conv = tester_cache.conversation_open(topic, emails)
        tester_conv.message_send('We need to talk...', client_req_id = client_req_id)
        tester_conv.message_send('We need to talk...', client_req_id = client_req_id)
        tester_cache.poll_request(client_req_id)
        listen_cache.poll_request(client_req_id)
        print tester_conv.show(from_first = True)
        listen_conv = listen_cache.conversation_get(tester_conv.conversation_id)
        print listen_conv.show(from_first = True)
        tester_conv.delete()

    def cmd_test_topic(self):
        """Test topic title changing
        """
        lcache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else TOPIC

        #hide old conversation
        conv_list = lcache.conversation_find('topic2')
        for conv in conv_list:
            conv.set_topic('topic2_old')
            conv.hide()

        lconv = lcache.conversation_open(topic, TESTER)
        lconv.add_members(ASKO)
        print "DONE: Added asko"
        lconv.set_topic('topic2')
        lconv.message_send("hello")
        print "DONE: set topic -> topic2"
        tcache = FleepCache(self.url, ASKO, PWORD)
        tconv = tcache.conversation_get(lconv.conversation_id)
        tconv.set_alerts_off()
        print "DONE: Turn alerting OFF"
        print tconv.show(from_first = True)
        tconv.set_alerts_on()
        print "DONE: Turn alerting ON"
        tconv.leave()
        print "DONE: Leave"
        tcache.api.expect = codes.ERR_BL_ERROR
        tconv.set_topic("test3")
        tcache.api.expect = codes.SUCCESS
        print "DONE: Failed to change topic"
        lcache.poll_until(tconv)
        print tconv.show(from_first = True)
        print lconv.show()

    def cmd_test_listen(self):
        """Test topic title changing
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'test-listen'
        asko_listener = FleepListen(self.url, ASKO, PWORD)
        asko_cache = FleepCache(self.url, ASKO, PWORD)

        tester_conv = tester_cache.conversation_open(topic, TESTER)
        tester_conv.add_members(ASKO)
        filedir = os.environ['FLEEP_GIT_DIR']
        files = {'files' : open(filedir + "/tests/testfile1.txt", 'rb')}
        testfile_url = tester_cache.upload_file(files)[0]['upload_url']
        tester_conv.message_send("We used to get up 4 o'clock in the morning",
            attachments = [testfile_url])
        tester_conv.message_send("and lick the road with our tongues")
        print "Added asko and 2 messages"
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)
        asko_cache.poll_until(tester_conv)
        asko_conv.set_active()
        asko_listener.listen(False)
        fresh_conv_count = asko_listener.fresh_conv_count
        print  fresh_conv_count, asko_listener.messages
        asko_conv.mark_read()
        print "Asko read all the messages"
        asko_listener.listen_until(fresh_conv_count - 1) # listen until fresh conv count gets to one
        print "Listen received read event"
        asko_cache.poll(False)
        print asko_conv.show()
        msg_nr = tester_conv.message_send("We used to live in the box")
        tester_conv.message_edit("We used to live in the box in the middle of the road", msg_nr)
        print "Send one message and edited one message"
        asko_listener.listen_until(fresh_conv_count)
        print "Received notification about 1 unread again"
        asko_conv.set_alerts_off()
        print asko_conv.show_header()
        tester_conv.message_send("We used to dream about living in the hole")
        asko_listener.listen_until(fresh_conv_count - 1)
        print "Alerting is now off so this conv does not register as fresh anymore"
        asko_cache.poll_until(tester_conv)
        print asko_conv.show(from_first = True)

    def cmd_test_pin(self):
        """Test pinboard functions
        """
        lcache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else PIN
        emails = '%s, %s' % (ASKO, TESTER)

        lconv = lcache.conversation_open(topic, emails)
        conversation_id = lconv.conversation_id
        tcache = FleepCache(self.url, ASKO, PWORD)
        marko_cache = FleepCache(self.url, MARKO, PWORD)
        tcache.poll(False)
        # tester is sending and pinning ...
        msgnr1 = lconv.message_send("this is a message")
        msgnr2 = lconv.message_send("this is a really long message, argle blargle blargle blah")
        msgnr3 = lconv.message_send("some words")
        tcache.poll_until(lconv)
        tconv = tcache.conversation_get(conversation_id)
        tconv.set_active()
        msgnr4 = tconv.message_send("some more words")
        lconv.message_pin(msgnr1)
        lconv.message_pin(msgnr2)
        lconv.message_pin(msgnr4,0.0)
        lconv.message_repin(msgnr1,0.0)
        # asko leaves
        tconv.leave()
        # pinboard changes should not show up before rejoining
        lconv.message_edit("change this message", msgnr2)
        lconv.message_send('Asko should not see this')
        lconv.message_unpin(msgnr1)
        print lconv.show(show_flow = False)
        tconv.sync_to_last()
        print tconv.show()
        lconv.add_members(ASKO + "," + MARKO)
        marko_cache.poll_until(lconv)
        marko_conv = marko_cache.conversation_get(conversation_id)
        marko_conv.message_send("whatever")
        tconv.message_send('exactly')
        marko_cache.poll_until(tconv)
        lcache.poll_until(tconv)
        print tconv.show(from_first = True)
        print lconv.show(from_first = True)
        print marko_conv.show(from_first = True)

    def cmd_test_memory(self):
        """Test viewing conversation after leaving and rejoining
        """
        # initialize two caches
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else MEMORY
        emails = '%s, %s, %s' % (ASKO, MARKO, TESTER)

        asko_cache = FleepCache(self.url, ASKO, PWORD)
        tester_conv = tester_cache.conversation_open(topic, emails)
        tester_conv.message_send("hello")
        # and seed it for asko also who should get it soon
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)
        asko_conv.set_active()
        print '\n-----','Tester creates conversation and sends first message'

        # this will sync conversation to askos cache
        msgnr1 = asko_conv.message_send("goodbye")
        tester_cache.poll_until(asko_conv)
        tester_conv.mark_read()
        tester_conv.remove_members('%s, %s' % (ASKO, MARKO))
        asko_cache.poll_until(tester_conv)
        print '\n-----',"Asko responds and is summarily removed by Tester"
        print asko_conv.show(from_first = True)

        # send message and pin - msg should be visible to ASKO
        # on pinboard but not in conversation flow
        msgnr2 = tester_conv.message_send("bleh")
        tester_conv.message_pin(msgnr2)
        print '\n-----',"Tester sends and pins message"

        # add asko back so he must get pinboard
        tester_conv.add_members(ASKO)
        tester_conv.message_send("hello again")
        asko_cache.poll_until(tester_conv)
        asko_conv.set_active()
        print '\n-----',"Tester adds asko back and sends a message"
        print asko_conv.show(from_first = True)

        asko_conv.mark_read()
        asko_conv.message_edit("goodbye edited", msgnr1)
        tester_cache.poll_until(asko_conv)
        print '\n-----',"Asko edits message from previous membership"
        # set show horizon to 0 to show whole conversation
        print tester_conv.show(from_first = True)

        print '\n-----',"Tester conv final state"
        print asko_conv.show(from_first = True)

    def cmd_test_close(self):
        """Test closing account
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'test-close'
        emails = '%s, %s' % (ANDRES, TESTER)

        andres_cache = FleepCache(self.url, ANDRES, PWORD)

        # create conversation
        tester_conv = tester_cache.conversation_open(topic, emails)
        tester_cache.contacts.describe(ANDRES, "Andres")
        tester_conv.message_send("bye")

        andres_cache.poll_until(tester_conv)
        # close account
        self.sys_api.account_close(ANDRES)

        # two pokes to give time for conversations to close
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)

        # check that closed account has been removed and re-adding fails
        tester_conv.add_members(ANDRES)
        tester_conv.sync_to_last()
        # show conversation
        print tester_conv.show(from_first = True)

    def cmd_test_contacts(self):
        """Test contact syncing methods
        """
        tester_cach = FleepCache(self.url, TESTER, PWORD)
        lcache = FleepCache(self.url, TESTER, PWORD)
        marko_cache = FleepCache(self.url, MARKO, PWORD)
        tester_conv = tester_cach.conversation_open('', MARKO)
        tester_cach.poll_poke(tester_conv)
        tester_cach.contacts.sync_list(tester_cach.contacts.contacts.keys())
        tester_cach.contacts.hide([contact for contact in tester_cach.contacts.emails.keys() if contact not in EMAILS])
        print tester_cach.contacts.show()
        lcache.contacts.sync_all()
        print lcache.contacts.show()
        print '-'*60

        convs = []
        for topic in TOPICS:
            convs = convs + tester_cach.conversation_find(topic)
        for conv in convs:
            conv.sync_to_last()
            print conv.show()
            print '-'*60

        filedir = os.environ['FLEEP_GIT_DIR']
        files = {'files' : open(filedir + "/tests/testavatar.png", 'rb')}
        avatarid = marko_cache.api.avatar_upload(files).get('files')[0].get('file_id')

        tester_cach.api.contact_import([{"mk_addr_type" : "adt_gmail",
            "addr_full" :  "test1@gmail.com",
            "addr_descr" :  "test1",
            "has_account" :  True}])
        tester_cach.contacts.hide(["asko@fleep.ee"])
        tester_cach.contacts.describe("juser@dev3.fleep.ee", "testing", "000")
        tester_cach.poll_poke(tester_conv)
        tester_cach.contacts.sync_all()
        print tester_cach.contacts.show()

        lcache.poll_poke(tester_conv, is_bg_poke = True)
        lcache.contacts.sync_all()
        lcache.contacts.sync_list(lcache.contacts.contacts.keys())
        print lcache.contacts.show()

        tester_cach.contacts.describe("juser@dev3.fleep.ee", "", "")
        tester_cach.contacts.hide(['test1@gmail.com'])
        marko_cache.api.avatar_delete()

    def cmd_test_disclose(self):
        """Test disclosing conversation history
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'disclose'
        emails = '%s, %s' % (ASKO, TESTER)

        asko_cache = FleepCache(self.url, ASKO, PWORD)
        # open conversation
        tester_conv = tester_cache.conversation_open(topic, TESTER)
        msgnr1 = tester_conv.message_send("to be disclosed")
        # and seed it for asko also who should get it soon
        tester_conv.add_members(ASKO)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)
        # this will sync conversation to askos cache
        msgnr2 = asko_conv.message_send("hello")
        # disclose conversation history to asko
        tester_conv.disclose_all(ASKO, 1)
        # remove some members from conversation
        tester_conv.remove_members(ASKO)
        asko_cache.poll_until(tester_conv)
        # send more messages
        msgnr3 = tester_conv.message_send("bla")
        msgnr4 = tester_conv.message_send("bla bla")
        msgnr5 = tester_conv.message_send("bla bla bla")
        # add asko back
        tester_conv.add_members(ASKO)
        # disclose only some messages
        tester_conv.disclose_all(ASKO, 8)
        asko_cache.poll_until(tester_conv)
        asko_conv.set_active()
        # show whole conversation
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)

    def cmd_test_convlist(self):
        """Test hiding conversation
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else CONVO
        emails = '%s, %s' % (ASKO, TESTER)

        asko_cache = FleepCache(self.url, ASKO, PWORD)
        tester_conv = tester_cache.conversation_open(topic, emails)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)

        print '----- initial state -----'
        print tester_cache.show_convlist(TOPICS)

        msgnr1 = asko_conv.message_send("whatever")
        tester_conv.sync_to_last()
        print '----- after asko sends message -----'
        print tester_cache.show_convlist(TOPICS)

        tester_conv.mark_read(msgnr1)
        asko_conv.message_edit("new stuff", msgnr1)
        asko_conv.add_members(MARKO)
        tester_conv.sync_to_last()
        print '----- after system message and revision -----'
        print tester_cache.show_convlist(TOPICS)

        tester_conv.hide()
        tester_conv.sync_to_last()
        print "----- after conversation hide -----"
        print tester_cache.show_convlist(TOPICS)

        msgnr2 = asko_conv.message_send("can you see this?")
        tester_conv.sync_to_last()
        print "----- after new message is received should be unhidden -----"
        print tester_cache.show_convlist(TOPICS)

        tester_conv.delete()
        tconv = tester_cache.conversation_open("testconv", TESTER)
        tester_cache.poll_poke(tconv)
        print "----- after conversation delete -----"
        print tester_cache.show_convlist(TOPICS)

        asko_conv.message_send("halloo")
        tester_cache.poll_poke(tconv)
        tester_conv = tester_cache.conversation_get(asko_conv.conversation_id)
        print "----- asko sends message -----"
        print tester_cache.show_convlist(TOPICS)
        print tester_conv.show(from_first = True)

        asko_conv.disclose_all(TESTER, 1)
        tester_cache.poll_poke(tester_conv)
        print "\n----- disclose should reveal all messages -----"
        print tester_conv.show(from_first = True)

        tester_conv.leave()
        tester_conv.delete()
        tester_cache.poll_poke(tconv)
        print "\n----- tester leave and delete -----"
        print tester_cache.show_convlist(TOPICS)

        asko_conv.message_send("halloo")
        tester_cache.poll_poke(tconv)
        print "----- conv should not reappear after asko sends message -----"
        print tester_cache.show_convlist(TOPICS)

    def cmd_test_flag(self):
        """Test setting client flags
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        # set flag
        tester_cache.set_flag('test_flag')
        tester_cache.set_flag('show_wizard')
        print tester_cache.flags
        # remove flag
        tester_cache.set_flag('test_flag', False)
        print tester_cache.flags
        # try to remove a flag that doesn't exist
        tester_cache.set_flag('random_flag', False)
        print tester_cache.flags

    def cmd_test_alias(self):
        self.start_email_client()

        tester_cache = FleepCache(self.url, TESTER, PWORD)
        tester_cache.alias_remove_all()

        print '----','Register Fleeper 1 and Fleeper 2','----'
        fleeper1 = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        fleeper2 = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        fleeper3 = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)

        fleeper2.register()
        fleeper2_cache = FleepCache(self.url, fleeper2.email, fleeper2.password)
        fleeper2.api.account_configure(display_name = "Fleeper 2")

        print '----','Users created','----'
        fconv = fleeper2_cache.conversation_open(
            "alias_testing", fleeper3.email)
        fleeper2_cache.contacts.describe(fleeper3.email, 'Fleeper 3')
        fconv.message_send('Testime aliaseid')
        print fconv.show(from_first = True)

        print '----','Add Fleeper 1 email as Fleeper 2 alias','----'
        fleeper2_cache.api.alias_add(fleeper1.email)
        fleeper1.confirm_alias()
        fleeper2_cache.poll_poke(fconv, is_bg_poke = True)
        fleeper2_cache.contacts.describe(fleeper1.email, 'Fleeper 1')
        fleeper2_cache.poll(False)

        print '----',"Fleeper 2 aliases",'----'
        print fleeper2_cache.get_aliases()

        print '----','Tester has no visibility to create conversation','----'
        tester_cache.api.expect = codes.ERR_FATAL
        tester_cache.conversation_get(fconv.conversation_id)
        tester_cache.api.expect = codes.SUCCESS

        print '----',"Add just random email that wont be confirmed",'----'
        tester_cache.api.alias_add('tester1@fleep.ee')
        tester_cache.sync_alias()
        tester_cache.contacts.describe('tester1@fleep.ee', 'Tester YX')
        print tester_cache.get_aliases()

        print '----',"Fleepr 1 should give an error as connected to another account",'----'
        tester_cache.poll(wait = False)
        tester_cache.api.expect = codes.ERR_BL_ERROR
        tester_cache.api.alias_add(fleeper1.email)
        tester_cache.api.expect = codes.SUCCESS

        print '----','Fleepr Colm should get added as pending','----'
        tester_cache.api.alias_add(fleeper3.email)
        tester_cache.sync_alias()
        tester_cache.contacts.describe(fleeper3.email, 'Fleeper Colm')
        print tester_cache.get_aliases()

        print '----','Fleepr Colm confirms alias','----'
        notification_id = fleeper3.confirm_alias()
        fleeper2_cache.poll_poke(fconv, is_bg_poke = True)
        print tester_cache.get_aliases()

        print '----','Next try with same notificationid should fail','----'
        tester_cache.api.expect = codes.ERR_BL_ERROR
        tester_cache.api.alias_confirm(notification_id)
        tester_cache.api.expect = codes.SUCCESS

        print  '----','Add Fleeper4 alias','----'
        fleeper4 = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        tester_cache.api.alias_add(fleeper4.email)
        notif_id = fleeper4.confirm_alias(do_confirm=False)
        print '----', 'Remove alias to expire that notification', '----'
        tester_cache.api.alias_remove(fleeper4.email)
        print  '----','Add Fleeper4 alias again','----'
        tester_cache.api.alias_add(fleeper4.email)
        notification_id = fleeper4.confirm_alias(do_confirm=False)
        tester_cache.sync_alias()
        tester_cache.contacts.describe(fleeper4.email, 'Fleeper Nely')
        print tester_cache.get_aliases()

	print '----','Expired notification should fail','----'
        tester_cache.api.expect = codes.ERR_BL_ERROR
        self.sys_api.api_call('sys/shard/time_travel',
            object_id = notification_id,
            mk_time_action = 'expire_notification',
            time_interval = '0 days')
        tester_cache.api.alias_confirm(notification_id)
        print  '----','Notification from first add should be expired','----'
        tester_cache.api.alias_confirm(notif_id)
        tester_cache.api.expect = codes.SUCCESS
        print tester_cache.get_aliases()

        print '----','Remove aliases','----'
        tester_cache.api.alias_remove('tester1@fleep.ee')
        tester_cache.api.alias_remove(fleeper3.email)
        tconv = tester_cache.conversation_open("testconv", TESTER)
        tester_cache.alias_remove_all()
        tester_cache.poll_poke(tconv)
        print '----',"Tester aliases - should be clean!",'----'
        print tester_cache.get_aliases()

        tester_cache.contacts.hide([fleeper1.email])
        tester_cache.contacts.hide([fleeper2.email])
        tester_cache.contacts.hide([fleeper3.email, fleeper4.email])

    def cmd_test_daily(self):
        self.start_email_client()

        dailytester = Fleeper(imap=self.imap, smtp=self.smtp, domain=self.domain)
        dailytester.register()

        dt_cache = FleepCache(self.url, dailytester.email, dailytester.password)

        dt_cache.api.account_configure(email_interval = 'daily')

        print dailytester.email

        tester_cache = FleepCache(self.url, TESTER, PWORD)

        asko_cache = FleepCache(self.url, ASKO, PWORD)

        # test conv less than 3 messages
        conv1 = tester_cache.conversation_open("email testing", dailytester.email)

        conv1.message_send("hallo")
        conv1.message_send("hmm")

        # test conv more than 3 messages, from multiple senders
        conv2 = tester_cache.conversation_open("email testing 2", ASKO + "," + dailytester.email)

        aconv = asko_cache.conversation_get(conv2.conversation_id)

        conv2.message_send("1")
        conv2.message_send("2")
        aconv.message_send("3")
        aconv.message_send("4")

        self.cmd_time_travel(dailytester.email, '2 days')

        event_1, msgs = dailytester.wait_for_email()

        conv2.message_send("newmsg")
        tester_cache.contacts.hide([dailytester.email])

        self.cmd_time_travel(dailytester.email, '2 days')

        event_2 = dailytester.wait_for_regex(regex="newmsg")

        print event_1
        print event_2

        print "First email:\n"
        print event_1[1].get('text_raw')
        print "\nSecond email:\n"
        print event_2[1].get('text_raw')

    def cmd_test_file(self):
        """Test file upload
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'file'
        emails = '%s, %s' % (ASKO, TESTER)

        asko_cache = FleepCache(self.url, ASKO, PWORD)

        # upload avatar
        filedir = os.environ['FLEEP_GIT_DIR']
        files = {'files' : open(filedir + "/tests/testavatar.png", 'rb')}
        avatarid = tester_cache.api.avatar_upload(files).get('files')[0].get('file_id')
        if avatarid:
            print "Avatar uploaded!"

        # upload file
        file_url = tester_cache.upload_file_url(filedir + "/tests/testfile.txt")
        print "File uploaded!"

        # open conversation
        tester_conv = tester_cache.conversation_open(topic, emails, message = '',
            attachments = [file_url])
        asko_cache.poll_until(tester_conv)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id, True)

        # post file to chat
        double_file_url = tester_cache.upload_file_url(filedir + "/tests/testfile.txt")
        msgnr1 = tester_conv.message_send(None, attachments = [double_file_url])
        tester_cache.poll_poke(tester_conv)
        print "Upload file without message"

        # send file by asko
        asko_testfile_url = asko_cache.upload_file_url(filedir + "/tests/testavatar.png")
        asko_testfile1_url = asko_cache.upload_file_url(filedir + "/tests/testfile1.txt")
        msgnr2 = asko_conv.message_send('Two files', attachments = [asko_testfile_url,asko_testfile1_url])
        print "Two files uploaded!"

        print tester_conv.show(from_first = True)
        asko_cache.poll_until(tester_conv)
        print asko_conv.show(from_first = True)

        atts = asko_conv.get_ref_urls(msgnr2)

        asko_conv.message_edit('One file removed', msgnr2, attachments = [atts[0]])

        edit_file_url = tester_cache.upload_file_url(filedir + "/tests/testavatar.png")
        atts = tester_conv.get_ref_urls(msgnr1)
        atts.append(edit_file_url)
        tester_conv.message_edit('New file added', msgnr1, attachments = atts)

        print "Message edit tested"

        print tester_conv.show(from_first = True)
        asko_cache.poll_until(tester_conv)
        print asko_conv.show(from_first = True)

        # pin file message
        tester_conv.message_pin(msgnr1)

        print "File pin tested"
        print tester_conv.show_pinboard()
        asko_cache.poll_until(tester_conv)
        print asko_conv.show_pinboard()

        # edit and unpin
        tester_conv.message_edit('File removed', msgnr1, attachments = [])

        print "File pin edit tested"
        print tester_conv.show_pinboard()
        asko_cache.poll_until(tester_conv)
        print asko_conv.show_pinboard()

        tester_conv.message_unpin(msgnr1)

        print "Pin removed"
        print tester_conv.show_pinboard()
        print tester_conv.show(from_first = True)
        asko_cache.poll_until(tester_conv)
        print asko_conv.show_pinboard()
        print asko_conv.show(from_first = True)

        atts = tester_conv.get_ref_urls(msgnr1)

        tester_conv2 = tester_cache.conversation_open(topic + '2', emails, message = '',
            attachments = atts)

        print "Copy file to another conversation"
        print tester_conv2.show(from_first = True)

        # delete file message
        asko_conv.message_delete(msgnr2, "1")
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)


    def cmd_test_hook(self):
        """Test hooks
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        topic = self.options.topic if self.options.topic else 'hook'

        tester_conv = tester_cache.conversation_open(topic, ASKO)
        tester_conv.message_send("hello")
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)

        hook_url = tester_conv.create_hook("testhook")

        tester_cache.poll_poke(tester_conv)

        print '----- hook creation -----'
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)

        print '----- tester view hooks -----'
        print tester_conv.show_hooks()
        print '----- asko view hooks -----'
        print asko_conv.show_hooks()

        # send text
        requests.post(hook_url, data = {'message': "whatever"}, verify = True)

        # send json
        msg = {'message': "let's try json"}
        json = json_encode(msg)
        requests.post(hook_url, data = json,
            headers = {'content-type': 'application/json; charset=utf-8'}, verify = True)

        print '----- after messages have been sent through hook -----'
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)

        hook_key = tester_conv.hooks.keys()[0]
        tester_conv.drop_hook(hook_key)
        print '----- drop hook -----'
        print tester_conv.show(from_first = True)

    def cmd_test_presence(self):
        """Test presence and activity
        """
        topic = self.options.topic if self.options.topic else "presence"
        emails = '%s, %s' % (ASKO, MARKO)
        listen_cache = FleepCache(self.url, TESTER, PWORD)
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        tester_conv = tester_cache.conversation_open(topic, emails)
        tester_conv.set_active()
        listen_cache.poll_until(tester_conv)
        we_nr = tester_conv.message_send('We need to talk...')
        print '-----','presence conversation created and first message sent','-----'
        print tester_conv.show()
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)

        print '\n-----','first message received from asko','-----'
        asko_conv.mark_read()
        asko_conv.message_send('Hi!')
        tester_cache.poll_until(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test writing pen with *new* message','-----'
        asko_conv.show_pen()
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *clearing* writing pen with message *send*','-----'
        msg_nr = asko_conv.message_send('Switching to secure frequency!')
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test writing pen with *new* message *again*','-----'
        asko_conv.show_pen()
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *cancel* writing pen for *new* message','-----'
        asko_conv.hide_pen()
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test writing pen with existing message *edit*','-----'
        asko_conv.show_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *clearing* writing pen with mesage *edit*','-----'
        asko_conv.message_edit('Switching to secure frequency! now! sir!', msg_nr)
        tester_cache.poll_until(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *edit* message *again*','-----'
        del_nr = asko_conv.message_send('Is there something you can tell me over insecure frequency?')
        asko_conv.show_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *delete* not interfering with *edit*','-----'
        asko_conv.message_delete(del_nr)
        tester_cache.poll_until(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *lock* pinboard message for editing','-----'
        asko_conv.message_pin(msg_nr)
        asko_conv.show_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *cancel* message edit','-----'
        asko_conv.hide_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *cancel* pinned message *lock*','-----'
        asko_conv.hide_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *lock* pinboard message for editing *again*','-----'
        asko_conv.show_pen(msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *cancel* pinned message *lock* with message edit','-----'
        edit_nr = asko_conv.message_edit('I have turned off gravity', msg_nr)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test privacy with *new*, *edit* and pin lock *show*','-----'
        asko_conv.show_pen(msg_nr)
        asko_cache.api.account_configure(is_full_privacy = True)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *privacy* read horizon should be *hidden*','-----'
        tester_conv.message_send('You are on mute')
        asko_conv.mark_read()
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test that unpin fails while message is locked','-----'
        tester_cache.api.expect = codes.ERR_BL_ERROR
        tester_conv.message_unpin(msg_nr)
        tester_cache.api.expect = codes.SUCCESS

        print '\n-----','test privacy with *new*, *edit* and pin lock *hide*','-----'
        asko_conv.hide_pen()
        asko_conv.hide_pen(msg_nr)
        asko_cache.api.account_configure(is_full_privacy = False)
        tester_conv.message_send('You were on mute')
        asko_cache.poll_until(tester_conv)
        tester_cache.poll_poke(asko_conv)
        print tester_conv.show(from_first = True)

        print '\n-----','test *privacy* read horizon should be *visible* again','-----'
        asko_conv.mark_read()
        asko_conv.message_send('i was on mute')
        tester_cache.poll_until(asko_conv)
        print tester_conv.show(from_first = True)

        """
        print '\n----- test that pin lock is extended with multiple calls ----'
        asko_conv.show_pen(pin_nr)
        print '... Time travel 40 minutes'
        self.cmd_time_travel('40 minutes')
        asko_conv.show_pen(pin_nr)
        print '... Time travel 40 minutes'
        self.cmd_time_travel('40 minutes')
        asko_cache.poll_until(tester_conv)
        print '... Sleep 1 minute'
        time.sleep(60)
        tester_cache.poll(False)
        print tester_conv.show(from_first = True)

        print '\n----- test that pin lock is removed automatically after 1 hr ----'
        print '... Time travel 1 hour'
        self.cmd_time_travel('1 hour')
        print '... Sleep 1 minute'
        time.sleep(60)
        tester_cache.poll(False)
        print tester_conv.show(from_first = True)
        """

        tester_cache.contacts.sync_fadr('tasko')
        tester_cache.contacts.sync_fadr('tmarko')

        print '\n-----','test contacts connect time and activity time','-----'
        print tester_conv.show(show_active = True)

    def cmd_test_import(self):
        topic = self.options.topic if self.options.topic else "import"
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        tester_conv = tester_cache.conversation_open(topic, ASKO)

        hook_url = tester_conv.create_hook("importhook", 'import')

        msgs = [
            { 'message_key' : None, 'message' : 'whatever',
              'posted_time' : int(time.time()) - 1000, 'sender_name' : 'tester'},
            { 'message_key' : 'a1', 'message' : 'what if',
              'posted_time' : int(time.time()) - 900, 'sender_name' : 'asko'},
            { 'message_key' : 'a1', 'message' : 'what if i can get',
              'posted_time' : int(time.time()) - 800, 'sender_name' : 'asko'} ]

        requests.post(hook_url,
            headers = {"Content-Type": "application/json"},
            data = json.dumps({'messages': msgs}))

        tester_conv.sync_to_last()
        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id, True)
        asko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)

    def cmd_test_premium(self):
        topic = self.options.topic if self.options.topic else "premium"

        tester_cache = FleepCache(self.url, TESTER, PWORD)
        tester_conv = tester_cache.conversation_open(topic, ASKO)

        self.sys_api.payment_add_custom_subscription(
            subscription_name = "test",
            subscriber_email = 'tester@fleep.ee',
            organisation_name = '',
            domains = [])

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)

        self.sys_api.payment_update_custom_subscription(
            subscription_name = "test",
            add_emails = [],
            remove_emails = ["tester@fleep.ee"])

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)

        hook_url = tester_conv.create_hook("hook", 'import')

        msgs = []

        for i in range(50):
            msgs.append({ 'message_key' : None, 'message' : 'msg'+str(i),
              'posted_time' : int(time.time()) - 10000000,
              'sender_name' : 'asko'})

        requests.post(hook_url,
            headers = {"Content-Type": "application/json"},
            data = json.dumps({'messages': msgs, 'is_read' : True}))

        tester_conv.mark_read()

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)

        tester_conv.sync_to_last()

        asko_cache = FleepCache(self.url, ASKO, PWORD)
        asko_conv = asko_cache.conversation_get(tester_conv.conversation_id)
        asko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)

        self.sys_api.payment_update_custom_subscription(
            subscription_name = "test",
            add_emails = ["tester@fleep.ee"],
            remove_emails = [])

        tester_cache.poll_poke(tester_conv, is_bg_poke = True)
        tester_cache.poll_poke(tester_conv, is_bg_poke = True)

        tester_conv.sync_to_last()
        asko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print asko_conv.show(from_first = True)


    def cmd_test_payment(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        payment_token_id = tester_cache.api.payment_conf().get('payment_token_id')
        tester_cache.api.payment_subscribe(payment_token_id, "4111 1111 1111 1111",
            "666", "Tester", "06", "2016", "whatever", "EE", ["tester@fleep.ee"])
        time.sleep(10)
        tester_cache.api.payment_conf()

    def cmd_test_search(self):
        """Test conversation search
        """
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "search"
        tester_conv = tester_cache.conversation_open(topic, MARKO)

        tester_conv.message_send("stuff")
        tester_conv.message_send("more stuff")
        tester_conv.message_send("other stuff")

        tester_conv.sync_to_last()

        print tester_conv.show(from_first = True)

        tester_cache.poll_poke(tester_conv)

        tester_cache.api.search_reset()
        print tester_conv.search("stuff")
        print tester_conv.search("more stuff")
        print tester_conv.search("nope")


    def cmd_test_task(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else "tasks"
        tester_conv = tester_cache.conversation_open(topic, MARKO)

        marko_cache = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cache.conversation_get(tester_conv.conversation_id)

        tester_conv.create_task("do something")

        tester_conv.message_send("do something else")

        tester_conv.assign_task(2, [marko_cache.account.get('account_id')])

        tester_conv.sync_to_last()

        print tester_conv.show(from_first = True)
        print tester_conv.show_tasklist()

        tester_conv.task_done(2)

        tester_conv.message_pin(2)

        tester_conv.message_unpin(2)

        tester_conv.make_task(3)

        tester_conv.sync_to_last()

        print tester_conv.show(from_first = True)
        print tester_conv.show_tasklist()

        tester_conv.archive_task(3)

        tester_conv.task_todo(2)

        print tester_conv.show(from_first = True)
        print tester_conv.show_tasklist()


    def cmd_test_label(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        listen_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'labels'

        tester_conv = tester_cache.conversation_open(topic, TESTER)

        listen_cache.poll_until(tester_conv)

        lconv = listen_cache.conversation_get(tester_conv.conversation_id)

        tester_conv.store(labels = ["stuff"])
        listen_cache.poll_poke(lconv)

        print tester_conv.show_labels()
        print lconv.show_labels()

        tester_conv.store(labels = ["wev"])
        tester_conv.store(labels = ["wev", "kek"])
        listen_cache.poll_poke(lconv)

        print tester_conv.show_labels()
        print lconv.show_labels()

        tester_conv.store(labels = ["kek"])
        listen_cache.poll_poke(lconv)

        print tester_conv.show_labels()
        print lconv.show_labels()

    def cmd_test_store_message(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else 'store-message'
        tester_conv = tester_cache.conversation_open(topic, MARKO)

        # send messages
        mnr1 = tester_conv.message_store(message = 'meh')
        mnr2 = tester_conv.message_store(message = 'stuff')
        mnr3 = tester_conv.message_store(message = 'test delete')
        mnr4 = tester_conv.message_store(message = 'test unshare')

        marko_cache = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cache.conversation_get(tester_conv.conversation_id, True)

        # test edit and add subject
        tester_conv.message_store(message_nr = mnr1, message = 'heh', subject = 'hi')

        marko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

        # test pin and remove subject
        tester_conv.message_store(message_nr = mnr1, subject = '')

        tester_conv.message_store(message_nr = mnr1, tags = ['pin'], pin_weight = 0)

        tester_conv.message_store(message_nr = mnr4, tags = ['pin'], pin_weight = 2)

        marko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

        # test unpin and task
        tester_conv.message_store(mnr1, tags = ['pin', 'is_archived'])

        tester_conv.message_store(mnr2, tags = ['is_todo'], assignee_ids = [marko_cache.account.get('account_id')])

        tester_conv.message_store(mnr2, tags = ['is_done'])

        tester_conv.message_store(mnr4, tags = ['pin', 'is_archived'])

        tester_conv.message_store(mnr4, tags = [])

        marko_conv.sync_to_last()
        marko_cache.poll_poke(tester_conv)
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

        # test archive and delete
        tester_conv.message_store(mnr2, tags = ['pin', 'is_archived'])

        tester_conv.message_store(mnr3, tags = ['is_deleted'])

        # unshared message should not be able to be edited by different member
        marko_cache.api.expect = codes.ERR_BL_ERROR
        marko_conv.message_store(message_nr = mnr4, message = 'huh')
        marko_cache.api.expect = codes.SUCCESS

        marko_conv.sync_to_last()
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

        #  test adding/deleting reactions
        tester_conv.message_store(message_nr = mnr2, add_reactions = ['r1'])

        marko_conv.sync_to_last()
        marko_cache.poll_poke(tester_conv)
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

        tester_conv.message_store(message_nr = mnr2, add_reactions = ['r2'], del_reactions = ['r1'])

        marko_conv.sync_to_last()
        marko_cache.poll_poke(tester_conv)
        print tester_conv.show(from_first = True)
        print marko_conv.show(from_first = True)

    def cmd_test_store_conv(self):
        tester_cache = FleepCache(self.url, TESTER, PWORD)
        topic = self.options.topic if self.options.topic else STORE_CONV
        tester_conv = tester_cache.conversation_open(topic, MARKO)

        mnr1 = tester_conv.message_store(message = 'testing conv store')

        marko_cache = FleepCache(self.url, MARKO, PWORD)
        marko_conv = marko_cache.conversation_get(tester_conv.conversation_id, True)
        marko_conv.set_active()

        # test change topic, add and remove emails, change labels
        tester_conv.store(topic = 'store2', remove_emails = MARKO,
            labels = ['label'], read_message_nr = 7)

        print tester_conv.show_labels()
        print tester_conv.show(from_first = True)

        tester_conv.message_store(message = 'marko should see this')

        tester_conv.store(add_emails = MARKO, disclose_emails = MARKO, topic = STORE_CONV, labels = [])

        print tester_conv.show_labels()
        print tester_conv.show(from_first = True)

        marko_conv.sync_to_last()
        print marko_conv.show(from_first = True)

        tester_conv2 = tester_cache.conversation_open('', TESTER)

        tester_conv.store(is_autojoin = True)
        tester_conv.store(is_disclose = True)
        tester_conv.store(is_url_preview_disabled = True)

        url_key = tester_conv.autojoin_url.split('/')[-1]

        juser_cache = FleepCache(self.url, JUSER, PWORD)
        juser_cache.api.conversation_autojoin(url_key)
        juser_conv = juser_cache.conversation_get(tester_conv.conversation_id, True)

        # see that api call does not fail if already member
        tester_cache.api.conversation_autojoin(url_key)

        print juser_conv.show(from_first = True)
        print tester_conv.show(from_first = True)

        tester_conv.store(is_autojoin = False)
        tester_conv.store(is_disclose = False)
        tester_conv.store(is_url_preview_disabled = False)

        tester_conv.store(remove_emails = JUSER)

        # autojoin should fail when disabled
        juser_cache.api.expect = codes.ERR_BL_ERROR
        juser_cache.api.conversation_autojoin(url_key)
        juser_cache.api.expect = codes.SUCCESS

        mnr2 = tester_conv.message_store(message = 'hiding something')

        tester_conv.store(add_emails = JUSER)

        print juser_conv.show(from_first = True)
        print tester_conv.show(from_first = True)

        print "### test hide"
        tester_conv.store(hide_message_nr = mnr2)
        tester_cache.poll_poke(tester_conv2)
        print tester_cache.show_convlist(TOPICS)

        print "### test unhide"
        marko_conv.message_store(message = 'heh')
        tester_conv.sync_to_last()
        tester_cache.poll_poke(tester_conv)
        print tester_cache.show_convlist(TOPICS)

        print "### test delete"
        tester_conv.store(is_deleted = True)
        tester_cache.poll_poke(tester_conv2)

        print tester_cache.show_convlist(TOPICS)

if __name__ == '__main__':
    script =  TestClient('syscli', sys.argv[1:])
    script.start()

