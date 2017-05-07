// random low-level helpers

import { execFile } from 'child_process';

import { jar as cookieJar } from 'request';
import rp from 'request-promise';
import https from 'https';

// use common defaults
let requestPromise = rp.defaults({
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
function parse_ini(data) {
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
function execPromise(cmd, args, opts) {
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

export {
    execPromise,
    parse_ini,
    dump_record,
    requestPromise,
    cookieJar,
    newAgent,
};

