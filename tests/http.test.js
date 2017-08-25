
import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Demo User'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

function cleanHeaders(res) {
    let hdrs = Object.assign({}, res.headers);
    let drop = ['content-length', 'content-security-policy', 'date', 'etag', 'last-modified', 'server', 'connection'];
    drop.forEach(function (name) {
        expect(hdrs).toHaveProperty(name);
        delete hdrs[name];
    });
    return hdrs;
}

let PRIVATE = {
    "cache-control": "private, max-age=60",
    "content-encoding": "gzip",
    "content-type": "text/html; charset=utf-8",
    "referrer-policy": "origin-when-cross-origin",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "vary": "Accept-Encoding, Cookie",
    "x-content-type-options": "nosniff",
    "x-frame-options": "deny",
    "x-xss-protection": "1; mode=block"
};

let PUBLIC = Object.assign({}, PRIVATE, {
    'cache-control': 'public, max-age=3600'
});

test('http headers', function () {
    let client = UC.demo;
    return thenSequence([
        () => client.login(),
        () => client.raw_request('/'),
        (res) => expect(cleanHeaders(res)).toEqual(PUBLIC),
        () => client.raw_request('/login'),
        (res) => expect(cleanHeaders(res)).toEqual(PRIVATE),
        () => client.raw_request('/chat'),
        (res) => expect(cleanHeaders(res)).toEqual(PRIVATE),
    ]);
});

