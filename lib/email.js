
import ImapClient from 'emailjs-imap-client';
import { parseMime } from './mime';
import { LateResult } from './lateresult';

let shortHeaders = [
    'Date', 'Subject', 'From', 'Sender', 'Reply-To', 'To', 'Cc', 'Bcc',
    'In-Reply-To', 'References', 'Message-ID'].join(' ');

let shortQuery = ['UID', 'INTERNALDATE', 'FLAGS', 'RFC822.SIZE', 'BODY.PEEK[HEADER.FIELDS (' + shortHeaders + ')]'];
let fullQuery = ['UID', 'INTERNALDATE', 'FLAGS', 'BODY.PEEK[]']; //, 'ENVELOPE'];

class ImapListener {
    constructor(imap_host, imap_port, imap_user, imap_pass, sessionAddr) {
        this.client = new ImapClient(imap_host, imap_port, {
            auth: {user: imap_user, pass: imap_pass},
            id: {name: 'ApiTest'},
            useSecureTransport: true
        });
        this.client.logLevel = this.client.LOG_LEVEL_WARN;
        this.looping = false;
        this.poller = null;
        this.mails_by_user = {};
        this.waiters_by_user = {};
        this.sessionAddr = sessionAddr;
        this.refcnt = 0;
        this.idleWaiter = new LateResult();
        this.client.onupdate = (mbox, cmd, nr) => {
            //console.log('onupdate', mbox, cmd, nr);
            if (cmd === 'exists') {
                this.idleWaiter.sendResult(nr);
                this.idleWaiter = new LateResult();
            }
        };
    }

    incref() {
        this.refcnt++;
    }

    decref() {
        this.refcnt--;
        if (this.refcnt <= 0) {
            return this.cleanup();
        }
        return Promise.resolve();
    }

    checkHeaders(hdrs, name) {
        if (hdrs[name] == null) {
            return false;
        }
        for (let i = 0; i < hdrs[name].length; i++) {
            let addr = hdrs[name][i];
            if (addr.indexOf(this.sessionAddr) >= 0) {
                return true;
            }
        }
        return false;
    }

    loadTargets(parsed) {
        let hdrs = parsed;
        let scanHdrs = {'to':1, 'cc':1};
        let res = [];
        for (let name in scanHdrs) {
            if (hdrs[name] == null) {
                continue;
            }
            for (let i = 0; i < hdrs[name].length; i++) {
                let addr = hdrs[name][i];
                if (addr.indexOf(this.sessionAddr) >= 0) {
                    res.push(addr);
                }
            }
        }
        return res;
    }

    fetchAll() {
        let seq = '1:*';
        return this.client.listMessages('INBOX', seq, shortQuery, {byUid: true})
            .then((list) => {
                //console.log('### got listMessages result');
                //console.log(list);
                let uids = [];
                let bhdr = null;
                for (let i = 0; i < list.length; i++) {
                    if (bhdr == null) {
                        for (let k in list[i]) {
                            if (k.substr(0, 4) === 'body') {
                                bhdr = k;
                                break;
                            }
                        }
                        if (bhdr == null) {
                            throw new Error("did not find bhdr");
                        }
                    }

                    let parsed = parseMime(list[i][bhdr]);
                    if (this.checkHeaders(parsed, 'to') || this.checkHeaders(parsed, 'cc')) {
                        uids.push(list[i].uid);
                    }
                }
                if (uids.length === 0) {
                    return Promise.resolve([]);
                }
                return this.client.listMessages('INBOX', uids.join(','), fullQuery, {byUid: true})
                    .then((flist) => {
                        //console.log('### got listMessages2 result');
                        //console.log(flist);
                        for (let i = 0; i < flist.length; i++) {
                            let msg = flist[i]['body[]'];
                            let parsed = parseMime(msg);
                            let addrlist = this.loadTargets(parsed);
                            //console.log('addrlist', addrlist);
                            for (let j = 0; j < addrlist.length; j++) {
                                this.collectEmail(addrlist[j], parsed);
                            }
                        }
                        return Promise.resolve();
                    })
                    .then(() => this.client.deleteMessages('INBOX', uids.join(','), {byUid: true}))
                    .then(() => {
                        this.checkResultAll();
                        return Promise.resolve();
                    });
            });
    }

    launch() {
        this.looping = true;
        this.poller = this.client.connect()
            .then(() => this.client.selectMailbox('INBOX'))
            .then((info) => this.fetchAll())
            .then(() => this.mainLoop())
            .then(() => {
                if (0) { console.log("mainloop after"); }
                return true;
            });
    }

    cleanup() {
        //console.log('### cleanup');
        this.looping = false;
        return this.client.close();
    }

    mainLoop() {
        //console.log('### mainLoop.wait');
        return this.idleWaiter.waitResult()
            .then((nrlist) => {
                return this.fetchAll();
            })
            .then(() => {
                if (this.looping) {
                    return this.mainLoop();
                }
                return Promise.resolve();
            })
            .then(() => true);
    }

    collectEmail(addr, data) {
        if (this.mails_by_user[addr] == null) {
            this.mails_by_user[addr] = [];
        }
        this.mails_by_user[addr].push(data);
    }

    checkResultAll() {
        for (let k in this.mails_by_user) {
            this.checkResult(k);
        }
    }

    checkResult(email) {
        if (this.mails_by_user[email] != null) {
            if (this.waiters_by_user[email] != null) {
                let mails = this.mails_by_user[email];
                let waiters = this.waiters_by_user[email];

                this.mails_by_user[email] = null;
                this.waiters_by_user[email] = null;

                //console.log('### checkResult got mail - ', email);
                waiters.sendResult(mails);
            }
        }
    }

    waitMail(email) {
        if (!this.looping) {
            this.launch();
        }
        if (this.waiters_by_user[email] == null) {
            this.waiters_by_user[email] = new LateResult();
        }
        let zres = this.waiters_by_user[email];

        this.checkResult(email);
        return zres.waitResult();
    }
}

export { ImapListener };

