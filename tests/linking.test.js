import {UserCache, thenSequence} from '../lib';
import {imap_test_servers} from '../lib/usercache';
import ImapClient from 'emailjs-imap-client';

let UC = new UserCache([
    'Box User',
    'Linked <box>',
    'Spam@',
    'External@',
], __filename, jasmine);

beforeAll(() => UC.setup().then(() => cleanImapAll()));
afterAll(() => UC.cleanup());

let LINKED1 = {
     "imap_host": "<imaphost:Linked>",
     "imap_port": 993,
     "imap_username": "<imapuser:Linked>",
     "mail_address": "<email:Linked>",
     "mail_id": "<mlink:Linked>",
     "mk_imap_connection": "ssl",
     "mk_mail_status": "mail_add",
     "mk_mail_type": "mail",
     "mk_rec_type": "mail",
     "mk_smtp_connection": "ssl",
     "smtp_host": "<imaphost:Linked>",
     "smtp_port": 465,
     "smtp_username": "<imapuser:Linked>",
};

function cleanImap(srv, name) {
    let imap = new ImapClient(srv.imap_server, 993, {
        useSecureTransport: true,
        id: {name: 'ApiTest'},
        auth: {
            user: srv.email.split('@')[0],
            pass: srv.password,
        }});
    imap.logLevel = imap.LOG_LEVEL_WARN;

    return thenSequence([
        () => imap.connect(),
        () => imap.selectMailbox('INBOX'),
        () => imap.deleteMessages('INBOX', '1:*'),
        () => imap.listMessages('INBOX', '1:*', ['UID', 'INTERNALDATE', 'FLAGS', 'BODY.PEEK[]'], {byUid: true}),
        (list) => expect(list.length).toEqual(0),
        () => imap.close(),
    ]);
}

function cleanImapAll() {
    // clear all test mailboxes
    let k, plist = [];
    for (k in imap_test_servers) {
        plist.push(cleanImap(imap_test_servers[k], k));
    }
    return Promise.all(plist);
}

describe('email linking', function () {
    let srv, mail_rec;

    // set up imap linking
    beforeAll(() => UC.linked && thenSequence([
        () => UC.linked.login(),
        () => { srv = imap_test_servers.box; },
        () => UC.linked.api_call("api/mail/add", {
            mail_address: UC.linked.email,

            smtp_username: srv.email.split('@')[0],
            smtp_host: srv.imap_server,
            smtp_port: 465,
            smtp_password: srv.password,
            mk_smtp_connection: 'ssl',

            imap_username: srv.email.split('@')[0],
            imap_host: srv.imap_server,
            imap_port: 993,
            imap_password: srv.password,
            mk_imap_connection: 'ssl',
        }),
        () => {
            mail_rec = UC.linked.matchStream({mk_rec_type: 'mail'});
            expect(UC.clean(mail_rec)).toEqual(LINKED1);
        }
    ]));

    // stop imap linking
    afterAll(() => UC.linked && thenSequence([
        () => UC.linked.api_call("api/mail/store", {mail_id: mail_rec.mail_id, is_removed: true}),
        () => {
            let rec = UC.linked.cache_get(mail_rec);
            expect(rec).toEqual({
                "mail_id": "<mlink:Linked>",
                "mk_rec_type": "mail",
                "mk_mail_status": "mail_removed",
            });
        }
    ]));

    test('receive mail', function () {
        return UC.linked && thenSequence([
            () => UC.linked.api_call("api/mail/list"),
            (res) => expect(UC.clean(res)).toEqual({stream: [LINKED1]}),
            () => UC.linked.poll_filter({
                mk_rec_type: "mail",
                mk_mail_status: "mail_confirmed",
                mail_id: mail_rec.mail_id,
            }),
            () => UC.spam.send_mail({
                to: UC.linked.email_fullname,
                subject: 'first linked mail',
                text: 'some spammy text',
            }),
            () => UC.linked.poll_filter({
                mk_rec_type: "message",
                mk_message_type: "email",
                subject: "first linked mail",
                message: /spammy/,
            }),
        ]);
    });

    test('send mail', function () {
        return UC.linked && thenSequence([
            () => UC.linked.api_call("api/conversation/create", {topic: 'sendVia', emails: UC.external.email}),
            (res) => UC.linked.api_call("api/message/store/" + res.header.conversation_id, {
                message: 'hello', subject: 'testmail'
            }),
            () => UC.linked.poll_filter({'subject': 'testmail'}),
            () => UC.external.waitMail({body: /hello/, subject: /testmail/}),
        ]);
    });

});

