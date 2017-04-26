// top-level exports for 'lib'

import { dump_record } from './utils';
import { UserCache } from './usercache';

// test strict mode...
//delete Object.prototype; // throws a TypeError

export {
    UserCache,
    dump_record
};
