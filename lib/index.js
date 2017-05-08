// top-level exports for 'lib'

import { dump_record, promiseWait } from './utils';
import { TestClient } from './testclient';
import { UserCache } from './usercache';
import { Logger } from './logger';

// test strict mode...
//delete Object.prototype; // throws a TypeError

export {
    UserCache,
    dump_record,
    promiseWait,
    TestClient,
    Logger,
};
