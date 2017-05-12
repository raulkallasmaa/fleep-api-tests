// random low-level helpers

import { execFile } from 'child_process';
import { readFile } from 'fs';
import { randomBytes } from 'crypto';
import { jar as cookieJar } from 'request';
import rp from 'request-promise';
import https from 'https';

// use common defaults
let requestAsync = rp.defaults({
    headers: {'User-Agent': 'ApiTest'},
    gzip: true,
    ciphers: 'EECDH+HIGH'
});

// new instance of connection pooling agent
function newAgent() {
    if (0) {
        // do connection pooling
        return new https.Agent({
            keepAlive: true,
            maxSockets: 2,
            maxFreeSockets: 1,
        });
    }
    // no connection pooling
    return false;
}

// print record out in readable form
function dump_record(desc, obj) {
    console.log(`${desc}: ${JSON.stringify(obj, null, 2)}`);
}

// extract keys, ignore sections
function parseConfig(data) {
    let res = {};
    let lines = data.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let ln = lines[i].trim();
        if (ln.length === 0 || ln[0] === '#' || ln[0] === ';' || ln[0] === '[') {
            continue;
        }
        let pos = ln.indexOf('=');
        if (pos > 0) {
            let k = ln.substring(0, pos).trim();
            let v = ln.substring(pos + 1).trim();
            res[k] = v;
        }
    }
    return res;
}

// promise wrapper on child_process
function execAsync(cmd, args, opts) {
    return new Promise((resolve, reject) => {
        let proc = execFile(cmd, args, opts, (ex, out, err) => {
            if (ex) {
                reject(ex);
            } else if (proc.status != null && proc.status !== 0) {
                reject(new Error(`process exited with error status: ${proc.status}`));
            } else {
                resolve(out);
            }
        });
    });
}

// return arg after waiting msec milliseconds
function waitAsync(msec, arg) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, msec, arg);
    });
}

// returns promise that receives block of bytes
function randomBytesAsync(num) {
    return new Promise((resolve, reject) => {
        randomBytes(num, (err, buf) => {
            if (err) {
                reject(err);
            } else {
                resolve(buf);
            }
        });
    });
}

// read file data
function readFileAsync(fn, opts) {
    return new Promise(function (resolve, reject) {
        readFile(fn, opts, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// read file, optionally decrypting it
function secureReadFile(fn) {
    if (/\.gpg$/.test(fn)) {
        return execAsync('gpg', ['-d', '--batch', fn]);
    } else {
        return readFileAsync(fn, {encoding: 'utf8'});
    }
}

// parse ini file, optionally recryptping
function loadConfigAsync(fn) {
    return secureReadFile(fn).then(parseConfig);
}

// random 31-bit non-negative int. (31 bits to avoid negative values)
function randomInt() {
    /*eslint no-bitwise:0 */
    return parseInt(randomBytes(4).toString('hex'), 16) & 0x7FFFFFFF;
}

// random uuid4
function randomUUID() {
    /*eslint no-bitwise:0 */
    //let randomBytes = require('crypto').randomBytes;
    let buf = randomBytes(16), res = '', i;
    let hextbl = "0123456789abcdef";
    buf[6] = 0x40 | (buf[6] & 0x0F);
    buf[8] = 0x80 | (buf[8] & 0x3F);
    for (i = 0; i < 16; i++) {
        res += hextbl[buf[i] >> 4];
        res += hextbl[buf[i] & 15];
        if ((i & 1) === 1 && i > 2 && i < 10) {
            res += '-';
        }
    }
    return res;
}

// returns promise that runs over seq of .then() callbacks
//
// seq elements can be either functions or plain values
// functions will be used as .then() callbacks
//
// usage:
//   .then(function () { return thenSequence([f1, f2]);})
function thenSequence(seq) {
    let p = Promise.resolve();
    seq.forEach(function (elem) {
        if (typeof elem === 'function') {
            // ordinary function, not a promise, use as .then() callback
            p = p.then(elem);
        } else {
            // either promise or plain value
            p = p.then(function () {
                if (typeof elem === 'object' && typeof elem.then === 'function') {
                    // reject Promise-s as they are launched as soon they are created
                    return Promise.reject(new Error("runSequenceAsync - Promise does not work here"));
                }
                return Promise.resolve(elem);
            });
        }
    });
    return p;
}

export {
    randomBytesAsync,
    execAsync,
    waitAsync,
    requestAsync,
    readFileAsync,
    loadConfigAsync,
    dump_record,
    cookieJar,
    newAgent,
    randomUUID,
    randomInt,
    thenSequence,
};

