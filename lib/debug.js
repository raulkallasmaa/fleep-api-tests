// working logging

import fs from 'fs';
import util from 'util';

function debugLog() {
    let msg = util.format(...arguments);

    msg = "{DEBUG} " + msg + "\n";

    if (0) {
        fs.writeFileSync('debug.log', msg, {encoding: 'utf8', flag: 'a'});
    } else {
        //console.log(msg);
    }
}

export { debugLog };

