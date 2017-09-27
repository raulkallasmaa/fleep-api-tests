
import {UserCache, thenSequence} from '../lib';

let UC = new UserCache([
    'Demo User'
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

function cleanHeaders(res, drop) {
    let hdrs = Object.assign({}, res.headers);

    expect(res.statusCode).toEqual(200);

    drop.forEach(function (name) {
        expect(hdrs).toHaveProperty(name);
        delete hdrs[name];
    });
    return hdrs;
}

function mkheaders(ctype, base) {
    return Object.assign({'content-type': ctype}, base);
}


let DROP_HTML = ['content-length', 'content-security-policy', 'date', 'etag', 'last-modified', 'server', 'connection'];

let DROP_STATIC = ['content-length', 'date', 'etag', 'last-modified', 'server', 'connection',
    // fixme: test caching
    'cache-control', 'expires'];


let COMMON = {
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "x-frame-options": "deny",
    "x-xss-protection": "1; mode=block"
};

let GZIP = {
    "content-encoding": "gzip",
    "vary": "Accept-Encoding",
};

let NOGZ = {
    "accept-ranges": "bytes",
};

let PRIVATE_PAGE = Object.assign({}, COMMON, GZIP, {
    "cache-control": "private, max-age=60",
    "referrer-policy": "origin-when-cross-origin",
    "vary": "Accept-Encoding, Cookie",
});

let PUBLIC_PAGE = Object.assign({}, PRIVATE_PAGE, {
    'cache-control': 'public, max-age=3600'
});

let STATIC_COMMON = Object.assign({}, COMMON, {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    //"referrer-policy": "origin-when-cross-origin",
});

let STATIC_NOGZ = Object.assign({}, STATIC_COMMON, NOGZ);
let STATIC_GZ = Object.assign({}, STATIC_COMMON, GZIP);


test('http headers', function () {
    let client = UC.demo;
    return thenSequence([
        // installs cookies
        () => client.login(),

        // rendered templates
        () => client.raw_request('/'),
        (res) => expect(cleanHeaders(res, DROP_HTML)).toEqual(mkheaders('text/html; charset=utf-8', PUBLIC_PAGE)),
        () => client.raw_request('/login'),
        (res) => expect(cleanHeaders(res, DROP_HTML)).toEqual(mkheaders('text/html; charset=utf-8', PRIVATE_PAGE)),
        () => client.raw_request('/chat'),
        (res) => expect(cleanHeaders(res, DROP_HTML)).toEqual(mkheaders('text/html; charset=utf-8', PRIVATE_PAGE)),

        // static files in root
        () => client.raw_request('/robots.txt'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('text/plain; charset=utf-8', STATIC_NOGZ)),
        () => client.raw_request('/favicon.ico'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('image/x-icon', STATIC_NOGZ)),

        // static assets: css
        () => client.raw_request('/static/page_chat.css'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('text/css; charset=utf-8', STATIC_GZ)),
        () => client.raw_request('/v/xxx/page_chat.css'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('text/css; charset=utf-8', STATIC_GZ)),

        // static assets: svg
        () => client.raw_request('/static/chat-sprite-svg.svg'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('image/svg+xml', STATIC_NOGZ)),
        () => client.raw_request('/v/xxx/chat-sprite-svg.svg'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('image/svg+xml', STATIC_NOGZ)),

        // static assets: js
        () => client.raw_request('/static/assets/fleep/common.js'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('application/javascript; charset=utf-8', STATIC_GZ)),
        () => client.raw_request('/v/xxx/assets/fleep/common.js'),
        (res) => expect(cleanHeaders(res, DROP_STATIC)).toEqual(mkheaders('application/javascript; charset=utf-8', STATIC_GZ)),
    ]);
});

