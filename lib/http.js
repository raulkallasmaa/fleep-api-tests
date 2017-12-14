// https client

import https from 'https';
import rp from 'request-promise';
import { jar as cookieJar } from 'request';

// new instance of connection pooling agent
function newAgent() {
    if (0) {
        // do connection pooling
        return new https.Agent({
            keepAlive: true,
            maxSockets: 2,
            maxFreeSockets: 1,
        });
    }
    // no connection pooling
    return false;
}

// use common defaults
let requestAsync = rp.defaults({
    headers: {'User-Agent': 'ApiTest'},
    gzip: true,
    ciphers: 'EECDH+HIGH'
});

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
    req = Object.assign({
        timeout: 80 * 1000,
        simple: false,
        resolveWithFullResponse: true,
    }, req);

    log.info("[%s] launch %s: %s %s\n", now_str(), desc, req.method, req.uri);
    let start_time = Date.now();
    return requestAsync(req)
        .then((res) => {
                let status = res.statusCode + ' ' + res.statusMessage;
                if (res.statusCode >= 300) {
                    throw new ServerError(res);
                }
                if (/json/.test(res.headers['content-type'])) {
                    log.info("[%s] %s: %s\nduration: %s\n" +
                                  "request headers: %s\nrequest: %s\nresponse: %s %s\nresponse headers: %s\n",
                                  now_str(), get_href(res), Date.now() - start_time,
                                  fmt_http_headers(res.request.headers),
                                  JSON.stringify(req.body, null, 2),
                                  status,
                                  JSON.stringify(res.body, null, 2),
                                  fmt_http_headers(res.headers));
                } else {
                    log.info("[%s] %s: %s\nduration: %s\n" +
                                  "request headers: %s\nresponse headers: %s\n",
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
                log.info("[%s] %s ERROR: %s\nduration: %s\n",
                              now_str(), req.uri, err, Date.now() - start_time);
            } else {
                let status = res.statusCode + ' ' + res.statusMessage;
                log.info("[%s] %s ERROR: %s\nduration: %s\nrequest headers %s\nrequest: %s\nerror: %s %s\n",
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

