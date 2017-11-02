// random low-level helpers

import { execFile } from 'child_process';
import { readFile, writeFile } from 'fs';
import { randomBytes, createCipheriv } from 'crypto';
import { jar as cookieJar } from 'request';
import rp from 'request-promise';
import https from 'https';
import stream from 'stream';
import pngjs from 'pngjs';

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

// Mime headers in HTTP request
function parseMimeHeaders(str) {
    let rx = /(\S[^:]+):(.*(\r?\n[ \t].*)*)/g;
    let res = {};
    for (let m = rx.exec(str); m; m = rx.exec(str)) {
        let k = m[1].trim().toLowerCase();
        let v = m[2].trim().replace(/\s+/g, ' ');
        res[k] = v;
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

// write file data
function writeFileAsync(fn, data, opts) {
    return new Promise(function (resolve, reject) {
        writeFile(fn, data, opts, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
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

// random data
function generateData(size) {
    let input = Buffer.alloc(size);
    let key = randomBytes(32);
    let iv = randomBytes(16);
    let ciph = createCipheriv('AES-256-CTR', key, iv);
    return ciph.update(input);
}

class BufStream extends stream.Writable {
    constructor() {
        super();
        this._dstbuf = Buffer.alloc(1024);
        this._dstpos = 0;
    }

    _write(chunk, encoding, callback) {
        let endpos = this._dstpos + chunk.length;
        if (endpos > this._dstbuf.length) {
            let buf2 = Buffer.alloc(endpos * 2);
            this._dstbuf.copy(buf2, 0, 0, this._dstpos);
            this._dstbuf = buf2;
        }
        chunk.copy(this._dstbuf, this._dstpos);
        this._dstpos += chunk.length;
        callback();
    }

    load_dstbuf() {
        return this._dstbuf.slice(0, this._dstpos);
    }
}

// random image
function generatePNG(opts) {
    return new Promise((resolve, reject) => {
        let full = Object.assign({
            width: 200,
            height: 150,
            bitDepth: 8,
            colorType: 2,
            inputColorType: 2,
            inputHasAlpha: false,
        }, opts);
        let data = generateData(full.width * full.height * 3);
        let dst = new BufStream(resolve, reject);
        let png = new pngjs.PNG(full);
        png.data = data;
        png.on('error', function (err) { reject(err); });
        png.on('end', function () { resolve(dst.load_dstbuf()); });
        png.pack().pipe(dst);
    });
}

// returns promise that runs over seq of .then() callbacks
//
// seq elements can be either functions or plain values
// functions will be used as .then() callbacks
//
// usage:
//   .then(function () { return thenSequence([f1, f2]);})
//   .then(() => thenSequence([f1, f2]))
// which is equal to:
//   .then(f1).then(f2)
function thenSequence(seq) {
    let p = Promise.resolve();
    seq.forEach(function (elem) {
        if (((typeof elem === 'object' && elem != null) || typeof elem === 'function') && typeof elem.then === 'function') {
            // reject Promise-s as they are launched as soon they are created
            throw new Error("thenSequence - Promise does not work here");
        } else if (typeof elem === 'function') {
            // ordinary function, not a promise, use as .then() callback
            p = p.then(elem);
        } else {
            // just a value
            p = p.then(function () { return elem; });
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
    writeFileAsync,
    loadConfigAsync,
    parseMimeHeaders,
    cookieJar,
    newAgent,
    randomUUID,
    randomInt,
    generateData,
    generatePNG,
    thenSequence,
};

