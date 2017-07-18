"""Simple imap client"""
import logging
import imaplib
from fleep.parse_email import parse_email
import time

imaplib.debug = 1

class IMAPClient(object):
    """Basic imap client. All the business logic
    should happen elsewhere.
    """

    def __init__(self,
            username=None,
            password=None,
            host=None,
            port=993):

        self.username = username
        self.password = password
        self.host = host
        self.port = port
        self.connection = None

        #  keep some kind of state
        self.logged_in = False
        self.selected = False

    def connect(self):
        """Create a SSL connection to the server.
        """
        logging.info('Connecting to %s', self.host)
        self.connection = imaplib.IMAP4_SSL(
            self.host,
            self.port)

    def login(self):
        """Login to the server.
        """
        logging.info('Logging in as %s', self.username)
        response, message = self.connection.login(
                self.username,
                self.password)
        if response == 'OK':
            self.logged_in = True
            return True, message
        return False, message


    def check(self, target_email, retries=20, interval=10):
        """Checking new messages..."""

        for _ in range(retries):
            time.sleep(interval)
            msgs = self.get_messages_for(target_email)
            if msgs:
                return msgs
        return []

    def get_messages_for(self, target_email):
        """Get messages for specific email.
        Args:
            target_email:
                str, email addr to be searched for
        """
        #  selct has to be called every time
        #  for the inbox to be refreshed
        self.connection.select()

        qry = '(ALL) (TO "%s")' % target_email

        success, data = self.connection.uid('search', None, qry)
        assert success == 'OK'

        res = []
        for uid in data[0].split():
            # fetch raw message
            success, data = self.connection.uid('fetch', uid, '(BODY.PEEK[])')
            assert success == 'OK'
            # parse message
            msg = parse_email(data[0][1], keep_source=True)
            res.append(msg)
            self.connection.uid('STORE', uid, '+FLAGS', '(\\Deleted)')
        if res:
            self.connection.expunge()
        return res

    def logout(self):
        """Logout.
        """
        if self.logged_in:
            # close mailbox
            if self.selected:
                self.connection.close()
                self.selected = False
            # logout
            self.connection.logout()
            self.logged_in = False
            self.connection = None



