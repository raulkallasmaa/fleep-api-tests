// top-level exports for 'lib'

import { dump_record, waitAsync } from './utils';
import { TestClient, matchRec, matchStream } from './testclient';
import { UserCache } from './usercache';
import { Logger } from './logger';

// test strict mode...
//delete Object.prototype; // throws a TypeError

export {
    UserCache,
    dump_record,
    waitAsync,
    TestClient,
    Logger,
    matchRec,
    matchStream,
};
