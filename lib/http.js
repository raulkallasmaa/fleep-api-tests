// https client

import https from 'https';
import rp from 'request-promise';
import { jar as cookieJar } from 'request';

// use common defaults
let requestAsync = rp.defaults({
    headers: {'User-Agent': 'ApiTest'},
    gzip: true,
    ciphers: 'EECDH+HIGH',
    timeout: 80 * 1000,
    simple: false,
    resolveWithFullResponse: true,
});

// none, shared, local
let POOL_TYPE = 'shared';
let POOL_OPTIONS = {
    keepAlive: true,
    keepAliveMsecs: 15 * 1000,
    maxSockets: 500,
    maxFreeSockets: 50,
};
let SHARED_POOL = new https.Agent(POOL_OPTIONS);

// new instance of connection pooling agent
function newAgent() {
    if (POOL_TYPE === 'shared') {
        return SHARED_POOL;
    } else if (POOL_TYPE === 'local') {
        return new https.Agent(POOL_OPTIONS);
    }
    // no connection pooling
    return false;
}

function now_str() {
    return new Date().toISOString().replace('T', ' ');
}

function fmt_http_headers(hdrs) {
    let k, kx, pfx = '  > ', lines = [''];
    for (k in hdrs) {
        kx = k.replace(/(^|-)[a-z]/g, function (m) { return m.toUpperCase(); });
        lines.push(pfx + kx + ': ' + hdrs[k]);
    }
    return lines.join('\n');
}

function get_href(res) {
    return res.request.uri.href;
}

class ServerError extends Error {
    constructor(response) {
        super('ServerError - ' + response.statusCode + ' ' + response.statusMessage);
        this.name = 'ServerError';
        this.response = response;
        this.statusCode = response.statusCode;
    }
}

function logRequestAsync(desc, req, log) {
    log.info("[%s] launch %s: %s %s\n", now_str(), desc, req.method, req.uri);
    let start_time = Date.now();
    return requestAsync(req)
        .then((res) => {
                let status = res.statusCode + ' ' + res.statusMessage;
                if (res.statusCode >= 300 && !req.keepErrors) {
                    throw new ServerError(res);
                }
                if (/json/.test(res.headers['content-type'])) {
                    log.info("[%s] %s: %s\n" +
                             "duration: %s\n" +
                             "request headers: %s\n" +
                             "request: %s\n" +
                             "response: %s %s\n" +
                             "response headers: %s\n",
                             now_str(), get_href(res), Date.now() - start_time,
                             fmt_http_headers(res.request.headers),
                             JSON.stringify(req.body, null, 2),
                             status,
                             JSON.stringify(res.body, null, 2),
                             fmt_http_headers(res.headers));
                } else {
                    log.info("[%s] %s: %s\nduration: %s\n" +
                             "request headers: %s\n" +
                             "response: %s\n" +
                             "response headers: %s\n",
                             now_str(), get_href(res), Date.now() - start_time,
                             fmt_http_headers(res.request.headers),
                             status,
                             fmt_http_headers(res.headers));
                }
                return res;
            })
        .catch((err) => {
            let res = err.response;
            if (!res) {
                log.info("[%s] %s ERROR: %s\n" +
                         "duration: %s\n",
                         now_str(), req.uri, err, Date.now() - start_time);
            } else {
                let status = res.statusCode + ' ' + res.statusMessage;
                log.info("[%s] %s ERROR: %s\n" +
                         "duration: %s\n" +
                         "request headers %s\n" +
                         "request: %s\n" +
                         "error: %s %s\n",
                         now_str(), get_href(res), err,
                         Date.now() - start_time,
                         fmt_http_headers(res.request.headers),
                         JSON.stringify(req.body, null, 2),
                         status,
                         JSON.stringify(res.body, null, 2));
            }
            return Promise.reject(err);
        });
}

export { logRequestAsync, now_str, newAgent, cookieJar };

