"""Basic email testing"""

from fleep import dbdict

from nose.tools import ok_, eq_

from datetime import datetime
import logging

from .utils import Conf
from .users import Fleeper, Emailer
from .imapclient import IMAPClient
from .smtpclient import SMTPClient

#
#  setup logging
#

#logging.basicConfig(
#        format="%(asctime)s %(filename)s - %(levelname)s:\n\t %(message)s",
#    datefmt="%H:%M:%S")

#ROOT = logging.getLogger()
#ROOT.setLevel(logging.INFO)

def prettify(func):
    """Decorator for logging method calls & duration.
    """
    msg = func.__doc__
    def wrapper(*args, **kwargs):
        """A wrapper."""
        logging.info(msg)
        start = datetime.now()
        retval = func(*args, **kwargs)
        end = datetime.now()
        duration = end - start
        logging.info("%s successfully completed in %d seconds\n%s",
                func.__name__,
                duration.total_seconds(),
                80*'*')
        return retval
    #  copy function metadata
    #  to deceive nosetest
    wrapper.__dict__ = func.__dict__
    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper

class State(object):
    """Dummy object for recording state across
    test cases.
    """
    conversation_id = None
    msg_nr = None

    def clear(self):
        """Clear state."""
        self = State()

class TestEmail(object):
    """Test class for emails.

    Notes:

    1.
        Initial setup sould be done at class
        level as nose runs setup functions
        on every testcase separately.
    2.
        Test methods should follow the pattern
        'test_<xxx>_<name>', where <xxx> is a
        descriminator that guarantees the execution
        order.
    3.
        Test methods are run in alphebetical order.

    """
    logging.info("Starting initial setup...")
    state = State()

    conf = Conf.load()
    imap = IMAPClient(
        username=conf.imap_user,
        password=conf.imap_password,
        host=conf.imap_server)
    imap.connect()
    imap.login()

    smtp = SMTPClient(
        username=conf.smtp_user,
        password=conf.smtp_password,
        host=conf.smtp_server)
    smtp.connect()
    smtp.login()

    # setup fleep accounts
    fleeper1 = Fleeper(
        imap=imap,
        smtp=smtp,
        domain=conf.domain)

    fleeper2 = Fleeper(
        imap=imap,
        smtp=smtp,
        domain=conf.domain)

    emailer1 = Emailer(
        imap=imap,
        smtp=smtp,
        domain=conf.domain)

    logging.info('Finished initial setup \n%s', 80*'*')

    @prettify
    def test_001_register(self):
        """Test Fleep registration & login.

        1. Register fleeper1
        2. Wait for registration email
        3. Click on verification link
        4. Login
        5. Initial poll
        """
        ok_(self.fleeper1.register())

    @prettify
    def test_002_recieve_email(self):
        """Test recieving email.

        1. Send email from emailer1 to fleeper1
        2. Wait for the message to arrive
        """
        subject = "Email subject 1"
        message = "Email message 1"

        self.emailer1.send(
            recipients = [self.fleeper1],
            subject = subject,
            message = message)

        event = self.fleeper1.wait_for_fleep_message(regex=message)
        self.state.conversation_id = event["conversation_id"]
        eq_(event["message"], u'<msg><p>Email message 1</p></msg>')

    @prettify
    def test_003_recieve_email(self):
        """Send a second email with the same subject as the last one.

        1. Check if message is sent to the same conversation
        """
        subject = "Email subject 2"
        message = "Email message 2"

        self.emailer1.send(
            recipients = [self.fleeper1],
            subject = subject,
            message = message)

        event = self.fleeper1.wait_for_fleep_message(regex=message)

        eq_(event["conversation_id"], self.state.conversation_id)
        eq_(event["subject"], subject)
        eq_(event["message"], u'<msg><p>Email message 2</p></msg>')

    @prettify
    def test_004_recieve_email(self):
        """Send a message with a new subject.

        1. Check if message is sent to the same conversation
        """

        subject = "Email subject 3"
        message = "Email message 3"

        self.emailer1.send(
            recipients = [self.fleeper1],
            subject = subject,
            message = message)

        event = self.fleeper1.wait_for_fleep_message(regex=message)

        eq_(event["conversation_id"], self.state.conversation_id)
        eq_(event["subject"], subject)
        eq_(event["message"], u'<msg><p>Email message 3</p></msg>')

        self.state.msg_nr = event["message_nr"]

    @prettify
    def test_005_new_member(self):
        """Check messages after new member has been added
        to the conversation.

        1. Register new fleep account
        2. Add it to the conversation
        3. Check if email messages get a new conversation
        """
        self.fleeper2.register()
        self.fleeper1.api.conversation_add_members(
            conversation_id = self.state.conversation_id,
            emails = self.fleeper2.email,
            from_message_nr = self.state.msg_nr)

        subject = "Email subject 4"
        message = "Email message 4"

        self.emailer1.send(
            recipients = [self.fleeper1],
            subject = subject,
            message = message)

        event = self.fleeper1.wait_for_fleep_message(regex=message)

        eq_(event['subject'], subject)
        assert self.state.conversation_id != event['conversation_id']

    @prettify
    def test_006_fleep_response(self):
        """Post a fleep message to the first chat.

        1. Send a message from Fleep.
        2. Check for corresponding email
        """
        subject = "Fleep subject 1"
        message = "Fleep message 1"

        self.fleeper1.api.message_store(
            conversation_id = self.state.conversation_id,
            message = message,
            subject = subject,
            from_message_nr = self.state.msg_nr)

        match, _ = self.emailer1.wait_for_email(message)
        ok_(match)

    @prettify
    def test_007_fleep_response(self):
        """Post a fleep message with the same topic as the last one.

        1. Send a message from Fleep.
        2. Check for corresponding email
        """
        subject = "Fleep subject 2"
        message = "Fleep message 2"

        self.fleeper1.api.message_store(
            conversation_id = self.state.conversation_id,
            message = message,
            subject = subject,
            from_message_nr = self.state.msg_nr)

        match, _ = self.emailer1.wait_for_email(message)
        ok_(match)

    @prettify
    def test_008_fleep_response(self):
        """Post a fleep message with the same subject as the last one.

        1. Send a message from Fleep.
        2. Check for corresponding email
        """
        subject = "Fleep subject 2"
        message = "Fleep message 3"

        self.fleeper1.api.message_store(
            conversation_id = self.state.conversation_id,
            message = message,
            subject = subject,
            from_message_nr = self.state.msg_nr)

        match, _ = self.emailer1.wait_for_email(message)
        ok_(match)

    def test_009_group_mail(self):
        """Send an email to 2 fleep users.
        """
        subject = "Group mail subject 1"
        message = "Group mail message 1"

        self.emailer1.send(
            recipients = [self.fleeper1, self.fleeper2],
            subject = subject,
            message = message)

        fleeper1_event = self.fleeper1.wait_for_fleep_message(regex=message)
        fleeper2_event = self.fleeper2.wait_for_fleep_message(regex=message)

        eq_(fleeper1_event["conversation_id"], fleeper2_event["conversation_id"])

    def test_010_mega_mail(self):
        """Send an email to 250 recipients.
        """
        #return # FIXME: batch_lookup fails on this
        subject = "Mail to 250 recipients"
        message = "Mail to 250 recipients"

        email_recipients = [dbdict(full_email='tester+%s@xxxsurramurraxxx.com' % i) #  random email addrs in email headers
            for i in range(248)]
        smtp_recipients  =  [self.fleeper1, self.fleeper2]
        self.emailer1.send(
            recipients = smtp_recipients,
            subject = subject,
            message = message,
            email_recipients = email_recipients) #  don't actually send to email recipients, only add to email headers

    def teardown(self):
        """Tear down testclass. Used by nosetests.
        """
        pass
        #self.imap.logout()

