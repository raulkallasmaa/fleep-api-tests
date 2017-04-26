// random low-level helpers

"use strict";

import { execFile } from 'child_process';

import { jar as cookieJar } from 'request';
import requestPromise from 'request-promise';

function dump_record(desc, obj) {
    console.log(desc + ": " + JSON.stringify(obj, null, 2));
}

// extract keys, ignore sections
function parse_ini(data) {
    var res = {};
    var lines = data.split('\n');
    for (var i = 0; i < lines.length; i++) {
        let ln = lines[i].trim();
        if (ln.length === 0 || ln[0] === '#' || ln[0] === ';' || ln[0] === '[') {
            continue;
        }
        var pos = ln.indexOf('=');
        if (pos > 0) {
            var k = ln.substring(0, pos).trim();
            var v = ln.substring(pos+1).trim();
            res[k] = v;
        }
    }
    return res;
}

// promise wrapper on child_process
function execPromise(cmd, args, opts) {
    return new Promise(function (resolve, reject) {
        var proc = execFile(cmd, args, opts, function (ex, out, err) {
            if (ex) {
                reject(ex);
            } else if (proc.status != null && proc.status !== 0) {
                reject(new Error("process exited with error status: "+proc.status));
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
};

