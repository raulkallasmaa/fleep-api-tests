
//import { requestPromise } from '../lib/utils';
import tls from 'tls';
import globby from 'globby';
import fs from 'fs';

import { KEY_DIR, ENV_HOST, BIG_TEST } from '../lib/usercache';
import { execAsync } from '../lib/utils';

let statAsync = Promise.promisify(fs.stat);

let CERT_PATS = [KEY_DIR + '/cf/*/*.crt', KEY_DIR + '/intca/*/*.crt'];
let CERT_FILES = globby.sync(CERT_PATS);

// "Jun 28 04:44:00 2017 GMT"
function parseCertDate(dstr) {
    let parts = dstr.split(/ +/g);
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
    return new Promise(function (resolve, reject) {
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
            sock.on(name, function (arg) {
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

        sock.on('secureConnect', function () {
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

function checkDate(dstr, desc, secondary) {
    let now = Date.now(); // ms
    let warn_days = 31;
    let err_days = 14;
    let day_ms = 24 * 60 * 60 * 1000;
    let err_ms = now + err_days * day_ms;
    let warn_ms = now + warn_days * day_ms;

    let cdate_ms = parseCertDate(dstr);
    let age = ((cdate_ms - now) / day_ms) | 0;

    if (cdate_ms <= err_ms) {
        /* eslint no-bitwise:0 */
        return Promise.reject(new Error("cert dangerously old: " + age + " days remaining - " + desc));
    } else if (cdate_ms <= warn_ms) {
        console.warn("cert too old: " + age + " days remaining - " + desc);
    }
    return Promise.resolve();
}

function checkHttps(uri, ca) {
    let tmp = uri.split('://');
    let protomap = {https: 443, imaps: 993, submission: 587, ssmtp: 465};

    test(uri + ' (' + ca + ')', function () {
        return connectTLS({host: tmp[1], port: protomap[tmp[0]]})
            .then(function (resp) {
                expect(resp.proto).toEqual('TLSv1.2');

                if (resp.cert.issuer.O !== ca) {
                    return Promise.reject(new Error("invalid issuer: " + JSON.stringify(resp.cert.issuer)));
                }

                return checkDate(resp.cert.valid_to, uri);
            });
    });
}

let DIGICERT = "DigiCert Inc";
let LETSENCRYPT = "Let's Encrypt";

let LiveList = [
    ['https://fleep.io', DIGICERT],
    ['https://builds.fleep.ee', DIGICERT],
    ['https://stats.fleep.io', DIGICERT],
    ['imaps://mbox.fleep.ee', LETSENCRYPT],
    ['ssmtp://mbox.fleep.ee', LETSENCRYPT],
    ['https://fleep.it', LETSENCRYPT],
    ['https://fleep.im', LETSENCRYPT],
    ['https://fleephub.com', LETSENCRYPT],
    ['https://monitor.fleephub.com', LETSENCRYPT],
    ['https://dev-monitor.fleep.ee', LETSENCRYPT],
    ['https://dev-statistics.fleep.ee', LETSENCRYPT],
    ['https://test.fleep.ee', LETSENCRYPT],
];

let DevList = [
    ['https://dev0.fleep.ee', LETSENCRYPT],
    ['https://dev1.fleep.ee', LETSENCRYPT],
    //['https://dev2.fleep.ee', LETSENCRYPT],
    //['https://dev3.fleep.ee', LETSENCRYPT],
    ['https://dev4.fleep.ee', DIGICERT],
    ['https://dev5.fleep.ee', LETSENCRYPT],
    //['https://dev6.fleep.ee', LETSENCRYPT],
    ['https://dev7.fleep.ee', LETSENCRYPT],
    //['https://dev8.fleep.ee', LETSENCRYPT],
    //['https://dev9.fleep.ee', LETSENCRYPT],
    ['https://dev10.fleep.ee', LETSENCRYPT],
    ['https://dev11.fleep.ee', LETSENCRYPT],
    //['https://dev12.fleep.ee', LETSENCRYPT],
    //['https://dev13.fleep.ee', LETSENCRYPT],
    ['https://dev14.fleep.ee', DIGICERT],
    ['https://dev15.fleep.ee', LETSENCRYPT],
];

LiveList.forEach(function (info) {
    checkHttps(info[0], info[1]);
});
DevList.forEach(function (info) {
    let curHost = 'https://' + ENV_HOST;
    if (true || BIG_TEST || info[0] === curHost) {
        checkHttps(info[0], info[1]);
    }
});

function certCheck(fn, errors) {
    let secondary = false;
    return statAsync(fn.replace('.crt', '.key.gpg'))
        .catch(function (err) {
            secondary = true;
        })
        .then(function () {
            if (secondary) {
                // ignore certs without corresponding key
                return Promise.resolve();
            }
            return execAsync('openssl', ['x509', '-text', '-in', fn])
                .then(function (data) {
                        let m = /Not After *:(.*)$/m.exec(data);
                        let after = m[1].trim();
                        return checkDate(after, fn, secondary);
                });
        })
        .catch(function (err) {
            errors.push(err.toString());
        });
}

test('Certificates in keys repo (#' + CERT_FILES.length + ')', function () {
    let p = Promise.resolve();
    let errlist = [];
    CERT_FILES.forEach(function (fn) {
        p = p.then(function () { return certCheck(fn, errlist); });
    });
    return p.then(function () {
        if (errlist.length > 0) {
            return Promise.reject(new Error(errlist.join('\n')));
        }
        return Promise.resolve();
    });
});

