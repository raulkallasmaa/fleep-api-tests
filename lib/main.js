
import { setup_sys } from './usercache';
import { exit } from 'process';

import process from 'process';

function main() {
    setup_sys(true).then(() => {
        console.log("testing: env=" + process.env.FLEEP_ENV_NAME + '\n');
        exit(0);
    })
    .catch((ex) => {
        console.log("boot failed: " + ex);
        exit(1);
    });
}

export { main };

