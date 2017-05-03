// top-level exports for 'lib'

import { dump_record } from './utils';
import { UserCache } from './usercache';
import { debugLog } from './debug';

// test strict mode...
//delete Object.prototype; // throws a TypeError

export {
    debugLog,
    UserCache,
    dump_record
};
