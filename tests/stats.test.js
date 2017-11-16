import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'King Kong',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('test stats submittal', function () {
    let client = UC.king;
    return thenSequence([
        () => client.api_call("api/submit/stats", {
            "stats": [{
                "event": "test",
                "properties": {}
            }]
        }),
    ]);
});

