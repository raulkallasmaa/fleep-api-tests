"""Simple smtp client"""

import smtplib
import logging

class SMTPClient(object):
    """Simple SMTP client. All the business logic
    should happen elsewhere.
    """

    def __init__(self, host,
            username=None,
            password=None,
            port = 465):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.connection = None

    def connect(self, local_hostname='www.fleep.ee'):
        """Create a SSL connection to the server.
        """
        logging.info("Connecting to %s", self.host)
        self.connection = smtplib.SMTP_SSL(self.host,
            local_hostname=local_hostname)
        #self.connection.set_debuglevel(1)

    def login(self):
        """Login to the server.
        """
        logging.info("Logging in as %s", self.username)
        self.connection.login(
            user = self.username,
            password = self.password)

    def send(self, to_addrs, from_addr, msg):
        """Send an email.
        Args:
            to_addrs:
                list,  RFC 822 addresses
            from_addr:
                str, sender RFC 822 address
            msg:
                email message
        Returns:
            None
        """
        logging.info("Sending email to: %s", to_addrs)
        self.connection.sendmail(from_addr, to_addrs, msg.as_string())

    def logout(self):
        """Logout.
        """
        self.connection.quit()
