
//import { requestPromise } from '../lib/utils';
import tls from 'tls';

import { ENV_HOST } from '../lib/usercache';

// "Jun 28 04:44:00 2017 GMT"
function parseCertDate(dstr) {
    let parts = dstr.split(' ');
    let mmap = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    let mon = mmap[parts[0]];
    if (mon == null) {
        throw new Error("cannot parse date: " + dstr);
    }
    let iso = parts[3] + '-' + mon + '-' + parts[1] + ' ' + parts[2] + ' ' + parts[4];
    return Date.parse(iso);
}

function connectTLS(opts) {
    return new Promise((resolve, reject) => {
        if (!opts.host || !opts.port) {
            throw new Error("need host and port");
        }
        let sock = tls.connect(opts);
        function logEvent(name) {
            if (sock != null) {
                //console.log("event: "+name);
            }
        }
        function handleState(name, isErr, errArg) {
            sock.on(name, (arg) => {
                if (isErr && arg) {
                    logEvent(name + ': ' + arg);
                    if (sock) {
                        sock.end();
                        sock = null;
                        reject(arg || new Error(name));
                    }
                } else {
                    logEvent(name);
                }
            });
        }
        handleState('connect');
        handleState('data');
        handleState('end');
        handleState('close');
        handleState('drain');
        handleState('error', true, true);
        handleState('lookup', true, true);
        handleState('timeout', true);
        handleState('OCSPResponse');

        sock.on('secureConnect', () => {
            logEvent('secureConnect');
            if (sock.authorized) {
                resolve({
                    cipher: sock.getCipher(),
                    cert: sock.getPeerCertificate(),
                    proto: sock.getProtocol(),
                });
            } else {
                reject(new Error(sock.authorizationError));
            }
            sock.end();
            sock = null;
        });
    });
}

function checkHttps(uri, ca) {
    let tmp = uri.split('://');
    let protomap = {https: 443, imaps: 993, submission: 587, ssmtp: 465};
    return () => connectTLS({host: tmp[1], port: protomap[tmp[0]]})
        .then((resp) => {
            expect(resp.proto).toEqual('TLSv1.2');

            let now = Date.now(); // ms
            let days = 10;
            let day_ms = 24 * 60 * 60 * 1000;
            let danger = now + days * day_ms;

            let cdate_ms = parseCertDate(resp.cert.valid_to);
            if (cdate_ms <= danger) {
                /* eslint no-bitwise:0 */
                let age = ((cdate_ms - now) / day_ms) | 0;
                return Promise.reject(new Error("cert dangerously old: " + age + " days remaining"));
            }
            if (resp.cert.issuer.O !== ca) {
                return Promise.reject(new Error("invalid issuer: " + JSON.stringify(resp.cert.issuer)));
            }
            return Promise.resolve();
        });
}

let DIGICERT = "DigiCert Inc";
let LETSENCRYPT = "Let's Encrypt";

let domlist = [
    ['https://fleep.io', DIGICERT],
    ['https://fleep.it', DIGICERT],
    ['https://fleep.im', DIGICERT],
    ['https://builds.fleep.ee', DIGICERT],
    ['https://box.fleep.ee', DIGICERT],
    ['https://fleephub.com', LETSENCRYPT],
    ['https://dev-monitor.fleep.ee', LETSENCRYPT],
    ['https://monitor.fleephub.com', LETSENCRYPT],
    ['https://stats.fleep.io', DIGICERT],
    ['https://test.fleep.ee', LETSENCRYPT],
    ['https://dev0.fleep.ee', LETSENCRYPT],
    //['https://dev1.fleep.ee', LETSENCRYPT],
    //['https://dev2.fleep.ee', LETSENCRYPT],
    //['https://dev3.fleep.ee', LETSENCRYPT],
    ['https://dev4.fleep.ee', DIGICERT],
    ['https://dev5.fleep.ee', LETSENCRYPT],
    //['https://dev6.fleep.ee', LETSENCRYPT],
    ['https://dev7.fleep.ee', LETSENCRYPT],
    //['https://dev8.fleep.ee', LETSENCRYPT],
    //['https://dev9.fleep.ee', LETSENCRYPT],
    ['https://dev10.fleep.ee', DIGICERT],
    //['https://dev11.fleep.ee', LETSENCRYPT],
    //['https://dev12.fleep.ee', LETSENCRYPT],
    //['https://dev13.fleep.ee', LETSENCRYPT],
    ['https://dev14.fleep.ee', DIGICERT],
    ['https://dev15.fleep.ee', DIGICERT],
];

if (1) {
    // test only current domain
    domlist = [
        ['https://' + ENV_HOST, LETSENCRYPT]
    ];
}

describe('testing tls cert age', () => {
    domlist.forEach((info) => {
        let uri = info[0];
        let ca = info[1];
        it(uri + ' (' + ca + ')', checkHttps(uri, ca));
    });
});

