
import { exit } from 'process';
import { thenSequence, readFileAsync } from './utils';

function processResults(result) {
    console.log(JSON.stringify(result, null, 2));
}

function main() {
    return thenSequence([
        () => readFileAsync('./result.json', {encoding: 'utf8'}),
        (res) => processResults(JSON.parse(res)),
        () => exit(0),
    ]);
}

export { main };

