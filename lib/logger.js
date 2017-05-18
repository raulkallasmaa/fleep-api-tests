
import process from 'process';
import { inspect, format } from 'util';
import fs from 'fs';

import { Console } from 'console';

// 0 - quiet
// 1 - info
// 2 - debug
let ERROR = 0;
let INFO = 1;
let DEBUG = 2;

let LogLevel = parseInt(process.env.FL_DEBUG || '1', 10);

function fileLogger(testfile) {
    let logfile = testfile.replace(/[\/\\]/g, '_').replace('.spec.js', '.log');
    const output = fs.createWriteStream('./logs/' + logfile);
    let log = new Console(output, output);
    log._close = function () {
        //output.end();
    };
    return log;
}

class Logger {
    constructor(prefix, dst) {
        this.prefix = prefix;
        this.dst = dst;
    }

    // throw error if val is falsy
    assert(val, msg, ...args) {
        this.dst.assert(val, this.prefix + msg, ...args);
    }

    // print to stderr
    error(msg, ...args) {
        if (LogLevel >= ERROR) {
            this.dst.error(this.prefix + format(...arguments));
        }
    }

    // print to stdout
    info(msg, ...args) {
        if (LogLevel >= INFO) {
            this.dst.log(this.prefix + format(...arguments));
        }
    }

    // start timer
    time(label) {
        if (LogLevel >= DEBUG) {
            this.dst.time(this.prefix + label);
        }
    }

    // stop and log timer
    timeEnd(label) {
        if (LogLevel >= DEBUG) {
            this.dst.timeEnd(this.prefix + label);
        }
    }

    // print util.inspect() result
    dir(obj, opts) {
        if (LogLevel >= DEBUG) {
            this.dst.log(this.prefix + inspect(obj, opts));
        }
    }

    // print message and stacktrace
    trace(msg, ...args) {
        if (LogLevel >= DEBUG) {
            this.dst.trace(this.prefix + format(...arguments));
        }
    }

    // alias to info
    log(msg, ...args) {
        this.info(...arguments);
    }

    // alias to error
    warn(msg, ...args) {
        this.error(...arguments);
    }
}

export { Logger, fileLogger };

