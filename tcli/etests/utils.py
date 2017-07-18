"""Utilities for email tests"""

import os, io, subprocess
import logging
import skytools
import pprint

def popen(cmd, input_data = None, **kwargs):
    """Read command stdout, check for exit code.
    """
    PIPE = subprocess.PIPE
    if input_data is not None:
        p = subprocess.Popen(cmd, stdin=PIPE, stdout=PIPE, stderr=PIPE, **kwargs)
    else:
        p = subprocess.Popen(cmd, stdout=PIPE, stderr=PIPE, **kwargs)
    out, err = p.communicate(input_data)
    if p.returncode != 0:
        raise Exception("command failed: %r - %s" % (cmd, err.strip()))
    return out

class Conf(object):
    """Load and hold config information.
    """

    def __init__(self, 
            domain,
            imap_server,
            imap_user,
            imap_password,
            smtp_server,
            smtp_user, 
            smtp_password, 
            email_pattern):

        self.domain = domain
        
        self.imap_server = imap_server
        self.imap_user = imap_user
        self.imap_password = imap_password

        self.smtp_server = smtp_server
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password

        self.email_pattern = email_pattern

    def __repr__(self):
        """Return str repr of Conf object for logging
        """
        data = dict(self.__dict__)
        data["smtp_password"] = "*"*10
        data["imap_password"] = "*"*10
        return "\nConf:\n%s" % pprint.pformat(data, indent=4)


    @classmethod
    def load(cls):
        """Load test config.
        """
        env = os.environ["FLEEP_ENV_NAME"]
        
        if env.startswith("dev"):
            domain = env + ".fleep.ee"
        else:
            raise ValueError("full env load not supported")

        logging.info("Loading config...")

        cf = cls.load_gpg_conf('testsetup', 'config/testsetup_dev.ini.gpg')
        
        imap_server = cf.get('imap_server')
        imap_user = cf.get('imap_user')
        imap_password = cf.get('imap_password')
                                
        smtp_server = cf.get('smtp_server')
        smtp_user = cf.get('smtp_user')
        smtp_password = cf.get('smtp_password')
        email_pattern = cf.get('email_pattern')

        conf = Conf(domain, 
                    imap_server, imap_user, imap_password,
                    smtp_server, smtp_user, smtp_password, 
                    email_pattern)
        logging.info(conf)
        return conf


    @staticmethod
    def load_gpg_conf(main_section, gpg_file_name):
        """Load from gpg.
        """
        key_dir = os.environ.get('FLEEP_KEY_DIR')
        conf = skytools.Config(main_section, None)
        file_name = os.path.join(key_dir, gpg_file_name)
        enc = open(file_name, 'rb').read()
        data = popen(['gpg', '-q', '-d', '--batch'], input_data = enc)
        file_o = io.BytesIO(data)
        file_o.name = gpg_file_name
        conf.cf.readfp(file_o)
        conf.reload()
        return conf
