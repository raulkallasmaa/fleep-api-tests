// top-level exports for 'lib'

import { waitAsync, thenSequence } from './utils';
import { TestClient, matchRec, matchStream } from './testclient';
import { UserCache } from './usercache';
import { Logger } from './logger';

// test strict mode...
//delete Object.prototype; // throws a TypeError

export {
    UserCache,
    waitAsync,
    TestClient,
    Logger,
    matchRec,
    matchStream,
    thenSequence,
};
