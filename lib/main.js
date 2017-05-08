
import { setup_sys } from './usercache';
import { exit } from 'process';

function main() {
    setup_sys(true).then(() => {
        console.log("boot ok");
        exit(0);
    })
    .catch((ex) => {
        console.log("boot failed: " + ex);
        exit(1);
    });
}

export { main };

