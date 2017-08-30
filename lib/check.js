
import { exit } from 'process';
import { thenSequence, readFileAsync, writeFileAsync } from './utils';


function processResults(result) {
    let nicejson = JSON.stringify(result, null, 2);
    //console.log(nicejson);
    return writeFileAsync('./result2.json', nicejson, {encoding: 'utf8'})
        .then(() => console.log("Wrote result2.json"));
}

function main() {
    return thenSequence([
        () => readFileAsync('./result.json', {encoding: 'utf8'}),
        (res) => processResults(JSON.parse(res)),
        () => exit(0),
    ]);
}

export { main };

