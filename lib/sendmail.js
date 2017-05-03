
import ImapClient from 'emailjs-imap-client';

class ImapListener {
    constructor(imap_host, imap_port, imap_user, imap_pass, sessionFilter) {
        this.client = new ImapClient(imap_host, imap_port, {
            auth: {user: imap_user, pass: imap_pass},
            useSecureTransport: true
        });
        this.looping = false;
        this.poller = null;
        this.mails_by_user = {};
        this.waiters_by_user = {};
        this.sessionFilter = sessionFilter;
    }

    launch() {
        this.looping = true;
        this.poller = this.client.connect()
            .then(() => this.client.selectMailbox('INBOX'))
            .then(() => this.mainloop());
    }

    mainLoop() {
        let seq = '1:*';
        let qry = ['uid', 'flags', ];
        return this.client.listMessages('INBOX', seq, qry, {byUid: true})
            .then((list) => {
                console.log(list);
                return Promise.resolve();
            });
    }

    getMail() {
    }
}

export { ImapListener };

