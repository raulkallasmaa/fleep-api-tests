"""Utility classes for emulating users"""

import os
import requests
import re
import time
import pprint
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.utils import formatdate
from email import encoders as Encoders
import string
import random

from cli.api import FleepApi
from fleep.markup.process_xml import convert_xml_to_text
import logging
import json

def compose_email(from_addr, to_addrs, subject, body, files=None):
    """Compose email.

    Args:
        from_addr:
            str, full email address
            in the format %s <%s>" % (name, email)"

        to_addrs:
            str or list, full email addresses
            in the format %s <%s>" % (name, email)"

        subject:
            str, email subject

        body:
            str, email body

        files:
            None or dict, default None
            {<filename(str)> : <filesize(int, MB)>}

    Returns:
        email message
    """
    if isinstance(to_addrs, basestring):
        to_addrs = [to_addrs]

    rnd = os.urandom(9).encode('base64').strip()

    msg = MIMEMultipart()
    msg['From'] = from_addr
    msg['To'] = ', '.join(to_addrs)
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = subject
    msg['Message-Id'] = "<%s-@%s>" % (rnd, re.sub(r'.*@([^>]+).*', r'\1', from_addr))

    msg.attach(MIMEText(body))

    #  not files to attach
    if files is None:
        return msg

    for fname, fsize in files.iteritems():
        part = MIMEBase('application', "octet-stream")

        #  generate random file
        part.set_payload(
        ''.join(random.choice(string.ascii_uppercase + string.digits)
                for x in range(fsize*1024*1024))
        )
        Encoders.encode_base64(part)
        part.add_header('Content-Disposition',
                'attachment; filename="%s"' % fname)
        msg.attach(part)
    return msg

def gen_fake_email(real_email, domain):
    """Generate fake fleep email from a real one.
    """
    tmp = re.sub('[@]', '.', real_email)
    return "%s@%s" % tmp, domain

def grep_messages(msgs, regex):
    """Grep messages.
    Args:
        regex:
            regex to match
    Returns:
        tuple (match, msg)
    """
    for msg in msgs:
        txt = msg["text_raw"]
        txt = txt.replace('\r\n', '\n')
        match = re.search(regex, txt)
        if match:
            return match.group(0), msg
    return None, None

class BaseUser(object):
    """Baseclass for all users."""
    pass


class DataMap(object):
    """Used for converting data into such format that is repeatable
    """
    def __init__(self):
        self.data_map = {}
        self.field_map = {}

    def muglify_field(self, field_name, field_value):
        """Map repetable names to unique and changing values"""
        field_key = '%s %s' % (field_name, field_value)
        if field_key not in self.data_map:
            if field_name in self.field_map:
                self.field_map[field_name] += 1
            else:
                self.field_map[field_name] = 1
            if field_value is None:
                self.data_map[field_key] = '<null>'
            else:
                self.data_map[field_key] = '%s_%s' % (field_name, self.field_map[field_name])

        return self.data_map[field_key]

    def muglify(self, rec):
        muglified_rec = {}
        sorted_keys = sorted(rec.keys())
        for field_name in sorted_keys:
            field_value = rec[field_name]
            if field_name in ('email','fleep_autogen','cmail','autojoin_url','fleep_address'):
                muglified_rec[field_name] = self.muglify_field( field_name, field_value)
            elif field_name.endswith('_id'):
                muglified_rec[field_name] = self.muglify_field( field_name, field_value)
            elif field_name.endswith('_time'):
                muglified_rec[field_name] = field_name
            elif field_name == 'label_ids':
                muglified_list = []
                for label_id in field_value or []:
                    muglified_list.append(self.muglify_field('label_id', label_id))
                muglified_rec[field_name] = muglified_list
            elif field_name in ('members','admins','leavers','guests','default_members'):
                muglified_list = []
                for account_id in field_value or []:
                    muglified_list.append(self.muglify_field('account_id', account_id))
                muglified_rec[field_name] = sorted(muglified_list)
            else:
                muglified_rec[field_name] = rec[field_name]
        return muglified_rec

class FleepCache(object):
    """Keep raw data received from server grouped by record type
    """
    def __init__(self):
        self.data = {}
        self.data_map = DataMap()

    def get_key(self, rec, mk_rec_type=None):
        """Compose cache dict key"""
        mk_rec_type = mk_rec_type or rec['mk_rec_type']
        if not rec.get('mk_rec_type'):
            logging.warning('Broken record (mk_rec_type) %s', rec)
            return None
        pk = ''
        if mk_rec_type == 'conv':           pk = rec['conversation_id']
        elif mk_rec_type == 'message':      pk = '%s %s' % (rec['conversation_id'], rec['message_nr'])
        elif mk_rec_type == 'activity':     pk = '%s %s' % (rec['conversation_id'], rec['account_id'])
        elif mk_rec_type == 'hook':         pk = '%s %s' % (rec['conversation_id'], rec['hook_key'])
        elif mk_rec_type == 'file':         pk = '%s %s' % (rec['conversation_id'], rec['attachment_id'])
        elif mk_rec_type == 'lock':         pk = '%s %s' % (rec['conversation_id'], rec['message_nr'])
        elif mk_rec_type == 'request':      pk = rec['client_req_id']
        elif mk_rec_type == 'contact':      pk = rec['account_id']
        elif mk_rec_type == 'team':         pk = rec['team_id']
        elif mk_rec_type == 'label':        pk = rec['label_id']
        elif mk_rec_type == 'reminder':     pk = rec['reminder_id']
        elif mk_rec_type == 'org_header':   pk = rec['organisation_id']
        elif mk_rec_type == 'org_member':   pk = '%s %s' % (rec['organisation_id'], rec['account_id'])
        elif mk_rec_type == 'org_conv':     pk = '%s %s' % (rec['organisation_id'], rec['conversation_id'])
        elif mk_rec_type == 'org_team':     pk = '%s %s' % (rec['organisation_id'], rec['team_id'])
        elif mk_rec_type == 'activity':     pk = '%s %s' % (rec['organisation_id'], rec['account_id'])
        else:
            logging.warning('Unhandled record type %s', mk_rec_type)
            return None
        if pk:
            return mk_rec_type + ' ' + pk
        return None

    def find_record(self, key_prefix, where_dict):
        """Find record using random fields"""
        for data_key, rec in self.data.items():
            if data_key.startswith(key_prefix):
                is_found = True
                for where_field, where_value in where_dict.items():
                    if rec[where_field] != where_value:
                        is_found = False
                if is_found:
                    return rec
        return None

    def process_record(self, rec):
        """Store record in cache with given pk"""
        data_key = self.get_key(rec)
        if data_key:
            if data_key in self.data:
                old_rec = self.data[data_key]
                old_rec.update(rec)
            else:
                self.data[data_key] = rec

    def process_stream(self, stream):
        """Process incoming records"""
        for rec in stream:
            self.process_record(rec)

    def process_retval(self, retval):
        """Process api call result"""
        if 'stream' in retval:
            self.process_stream(retval['stream'])

    @staticmethod
    def dictwhere(rec, keys):
        """Chack if record in dict matches criteria given"""
        if not keys:
            return True
        return all([keys[k] == rec[k] for k,v in rec.items() if k in keys])

    @staticmethod
    def json_pprint(mugly_rec):
        """Print json prettyly"""
        s = json.dumps(mugly_rec, indent=2, sort_keys=True)
        print mugly_rec['mk_rec_type'], '---------------'
        print '\n'.join([l.rstrip() for l in s.split('\n')])

    def print_data(self, mk_rec_type, sort_field_names, keys=None):
        keys = keys or {}
        keys['mk_rec_type'] = mk_rec_type
        contacts = filter(lambda x: self.dictwhere(x, keys), self.data.values())
        contacts = sorted(contacts, key=lambda f:
            ' '.join([f.get(sfn, '') for sfn in sort_field_names]))
        contacts = [self.data_map.muglify(contact) for contact in contacts]
        for mugly_rec in contacts:
            self.json_pprint(mugly_rec)

    def print_contacts(self, keys=None):
        """Print contacts sorted by name"""
        self.print_data('contact', ['display_name'], keys)

    def print_conversations(self, keys=None):
        """Print conversations sorted by topic"""
        self.print_data('conv', ['topic','default_topic'], keys)

    def print_organisations(self, keys=None):
        """Print conversations sorted by topic"""
        self.print_data('org_header', ['organisation_name'], keys)

    def print_teams(self, keys=None):
        """Print teams sorted by name"""
        self.print_data('team', ['team_name'], keys)

    def print_counts(self):
        counts = {}
        for mugly_rec in self.data.values():
            mk_rec_type = mugly_rec['mk_rec_type']
            counts[mk_rec_type] = counts.setdefault(mk_rec_type, 0) + 1
        print '\n'.join(['%s: %s' % (k, counts[k]) for k in sorted(counts)])

class Emailer(BaseUser):
    """User who just has email.
    """

    def __init__(self, imap, smtp, domain,
            email_pattern ='tester+%s@box.fleep.ee',
            display_name = None):

        #  setup a fake identity
        self.uid = os.urandom(9).encode("hex")
        self.name = display_name or "Test User %s" % self.uid
        self.email = email_pattern % self.uid
        self.password = os.urandom(9).encode("base64").strip()
        self.domain = domain
        self.smtp = smtp
        self.imap = imap

        self._msg_id = 0

    def __repr__(self):
        return "Emailer(name=%s, email=%s)" % self.name, self.email

    @property
    def msg_id(self):
        """Gen a msg id str while keeping state.
        """
        msg_id = "<%s%d>" % (self.uid, self._msg_id)
        self._msg_id += 1
        return msg_id

    @property
    def full_email(self):
        """Get full RFC addr.
        """
        return "%s <%s>" % (self.name, self.email)

    def _check(self, target_email, retries=10, interval=10):
        """Checking new messages..."""

        for _ in range(retries):
            logging.info('%s: checking email', target_email)
            time.sleep(interval)
            msgs = self.imap.get_messages_for(target_email)
            if msgs:
                return msgs
        return []

    def wait_for_email(self, regex=None, retries=10, interval=10):
        """Wait for email
        """
        msgs = self._check(
                target_email = self.email,
                retries = retries,
                interval = interval)
        if msgs:
            if regex is None:
                return None, msgs
            else:
                return grep_messages(msgs, regex)
        return None, {}

    def wait_for_regex(self, regex, retries=10, interval=10):
        """Returns (match, msg) or (None, None).
        """
        msgs = self._check(
                target_email = self.email,
                retries = retries,
                interval = interval)
        if msgs:
            return grep_messages(msgs, regex)
        return None, None

    def send(self, recipients, subject, message, email_recipients=None, files=None):
        """Send an email.
        """
        recipients = [recipient.full_email for recipient in recipients]
        if email_recipients:
            email_recipients = [recipient.full_email for recipient in email_recipients]
        msg = compose_email(
            from_addr = self.full_email,
            to_addrs = email_recipients or recipients,
            subject = subject,
            body = message,
            files=files)

        #logging.warning('sending email to: %s', recipients)
        self.smtp.send(
            msg = msg,
            to_addrs = recipients,
            from_addr = self.email)

class Fleeper(Emailer):
    """User who can both fleep and send emails."""

    def __init__(self, imap, smtp, domain, display_name=None):

        super(Fleeper, self).__init__(
                imap, smtp, domain=domain, display_name=display_name)
        self.domain = domain
        self.uri = "https://%s" % self.domain
        self.api = FleepApi(self.uri)
        self.cache = FleepCache()
        self.is_fleep_user = False
        self.event_horizon = 0
        self.account_id = None
        self.fleep_autogen = None

    def __repr__(self):
        return "Fleeper(name=%s, email=%s)" % (self.name, self.email)

    @property
    def fleep_email(self):
        """Get fleep email.
        """
        if not self.fleep_autogen:
            raise ValueError('No fleep_autogen')
        email = '%s@%s' % (self.fleep_autogen, self.domain)
        return "%s <%s>" % (self.name, email)

    @property
    def full_email(self):
        """Get full RFC addr.
        """
        if not self.fleep_autogen:
            raise ValueError('No fleep_autogen')
        email = '%s@%s' % (self.fleep_autogen, self.domain)
        return "%s <%s>" % (self.name, email)

    def register(self):
        """Register fleep account.
        """
        logging.info('Registering new Fleep account: %s', self.email)
        self._register()
        self._login()
        return self._poll()

    def _register(self):
        """Register as a fleep user.
        """
        self.api.account_register(
                self.email,
                self.password,
                self.name)

        rx_confirm = 'https://[a-z.0-9]+/confirm[?=%0-9a-z_-]+'
        url, _ = self.wait_for_email(rx_confirm)
        if url is None:
            raise RuntimeError('Confirmation email not found!')
        resp = requests.get(url, allow_redirects=False, verify = True)
        assert resp.status_code == 302
        self.is_fleep_user = True

    def confirm_alias(self, do_confirm=True):
        rx_confirm = 'https://[a-z.0-9]+/alias[?=%0-9a-z_-]+'
        url, _ = self.wait_for_email(rx_confirm)
        if url is None:
            raise RuntimeError('Confirmation email not found!')
        notification_id = url.split("=")[1]
        if do_confirm:
            self.api.alias_confirm(notification_id)
            self.is_fleep_user = True
        return notification_id

    def confirm_org_invite(self):
        rx_invite = 'https://[a-z.0-9]+/invite[?=%0-9a-z_-]+'
        url, _ = self.wait_for_regex(rx_invite)
        if url is None:
            raise RuntimeError('Confirmation email not found!')
        notification_id = url.split("=")[1]
        r_prepare = self.api.account_prepare_v2(notification_id)
        fleep_address = r_prepare['suggestions'][0]
        self.api.account_confirm_v2(
            notification_id, self.name, self.password, fleep_address)
        self._login()
        return self._poll()

    def _login(self):
        """Login to fleep.
        """
        r_login = self.api.account_login(self.email, self.password)
        if r_login:
            self.account_id = r_login['account_id']
            for r_profile in r_login['profiles']:
                if self.account_id == r_profile['account_id']:
                    self.fleep_autogen = r_profile['fleep_autogen']
                    break

    def wait_for_fleep_message(self, regex=None, retries=10, cache=False):
        """Wait for msgs in fleep.
        """
        for _ in range(retries):
            logging.info(
                "Checking Fleep messages for: %s", repr(regex))
            res = self._poll()
            for event in res['stream']:
                if not event['mk_rec_type'] == 'message':
                    continue
                if event['mk_message_type'] not in ('text', 'email'):
                    continue
                txt = convert_xml_to_text(event['message'])
                event["text"] = txt
                if regex:
                    if re.search(regex, txt):
                        logging.debug('Event: %s',
                            pprint.pformat(event, indent=4))
                        return event
                else:
                    return event
            if cache:
                self.cache.process_retval(res)

    def call_and_cache(self, function, *args, **kwargs):
        """Call api and store result in cache"""
        retval = self.api._webapi_call(function, *args, **kwargs)
        self.cache.process_retval(retval)
        return retval

    def _poll(self):
        """Poll for events"""
        res = self.api.account_poll(self.event_horizon)
        self.event_horizon = res["event_horizon"]
        return res
