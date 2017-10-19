import {UserCache, thenSequence} from '../lib';
import {parseMimeHeaders, generateData} from '../lib/utils';

let UC = new UserCache([
    'Bob Marley',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

// fetch single range
function fetchRange(p, client, file_url, start, len, origdata) {
    let last = start + len - 1;
    let range = start + '-' + last;
    let expLast = last < origdata.length ? last : origdata.length - 1;
    let expRange = start + '-' + expLast;
    return p.then(() => thenSequence([
        () => client.raw_request(file_url, {
            headers: {'Range': 'bytes=' + range},
            encoding: null,
        }),
        (res) => {
            expect(res.statusCode).toEqual(206);
            expect(res.headers['content-length']).toEqual((expLast - start + 1) + '');
            expect(res.headers['content-range']).toEqual('bytes ' + expRange + '/' + origdata.length);
            expect(res.body).toEqual(origdata.slice(start, start + len));
            return res;
        }
    ]));
}

// several ranges at once
function fetchMultiRange(p, client, file_url, startLenList, origdata) {
    let resqmap = {};

    // generate range header
    let qlist = startLenList.map((pair) => {
        let rng = pair[0] + '-' + (pair[0] + pair[1] - 1);

        // remember expected responses
        resqmap['bytes ' + rng + '/' + origdata.length] = origdata.slice(pair[0], pair[0] + pair[1]);
        return rng;
    }).join(', ');

    return p.then(() => thenSequence([
        () => client.raw_request(file_url, {
            headers: {'Range': 'bytes=' + qlist},
            encoding: null,
        }),
        (res) => {
            expect(res.statusCode).toEqual(206);

            let ctype = res.headers['content-type'];
            let mtype = ctype.split(';')[0];
            expect(mtype).toEqual('multipart/byteranges');

            let boundary = /[; ]boundary\s*=\s*["]?([^;"']+)/.exec(ctype)[1];
            expect(boundary).toBeTruthy();

            let endPos = res.body.indexOf('\r\n--' + boundary + '--\r\n');
            expect(endPos).toBeGreaterThan(0);

            let count = 0;
            let bstart = '--' + boundary + '\r\n';
            let curPos = res.body.indexOf('--' + boundary + '\r\n');
            expect(curPos).toBeGreaterThanOrEqual(0);
            curPos += bstart.length;
            bstart = '\r\n' + bstart;

            while (curPos < endPos) {
                let curEnd = res.body.indexOf(bstart, curPos);
                if (curEnd < 0) {
                    curEnd = endPos;
                }
                let curData = res.body.slice(curPos, curEnd);
                curPos = curEnd + bstart.length;

                let hdrEnd = curData.indexOf('\r\n\r\n');
                let dataStart = hdrEnd + 4;
                let hdrString = curData.slice(0, dataStart - 2).toString('utf8');
                let hdrs = parseMimeHeaders(hdrString);
                client.log.info("MIME subpart: %j", hdrs);

                let clen = parseInt(hdrs['content-length'], 10);
                expect(dataStart + clen).toBeLessThanOrEqual(curData.length);

                let curBody = curData.slice(dataStart, dataStart + clen);
                let curRange = hdrs['content-range'];
                expect(resqmap).toHaveProperty(curRange);

                let expData = resqmap[curRange];
                expect(expData).toBeTruthy();
                expect(curBody).toEqual(expData);
                delete resqmap[curRange];

                count++;
            }
            expect(count).toEqual(startLenList.length);
            expect(Object.keys(resqmap).length).toEqual(0);
            return res;
        }
    ]));
}

// error range
function fetchRangeError(client, file_url, startLenList, origdata, expStatus) {
    // generate range header
    let rvalue = typeof startLenList === 'string' ? startLenList :
        ('bytes=' + startLenList.map((pair) => pair[0] + '-' + (pair[0] + pair[1] - 1)).join(','));
    return thenSequence([
        () => client.raw_request(file_url, {
            headers: {'Range': rvalue},
            encoding: null,
        }),
        (res) => {
            let status = res.statusCode + ' ' + res.statusMessage;
            client.log.info("BadRange: %j, expStatus=%s got=%s crange=%j", rvalue, expStatus, status, res.headers['content-range']);
            expect(res.statusCode).toEqual(416);
            expect(res.headers['content-range']).toEqual('bytes */' + origdata.length);
        }
    ]);
}

test('HTTP Range test', function () {
    let client = UC.bob;
    let conv_topic = 'fileRange';
    let filename = 'range_test_data.bin';
    let data = generateData(17 * 1024);
    let file_url;
    return thenSequence([
        // create conv
        () => client.api_call("api/conversation/create", {topic: conv_topic}),
        (res) => expect(res.header.topic).toEqual(conv_topic),
        () => client.poll_filter({mk_rec_type: 'conv', topic: conv_topic}),

        // send files to the conv
        () => client.api_put("api/file/upload", filename, data),
        (res) => client.api_call("api/message/store/" + client.getConvId(conv_topic), {
            message: 'postfileforrange',
            attachments: res.files.map((f) => f.upload_url),
        }),
        () => client.poll_filter({mk_rec_type: 'message', message: /postfileforrange/}),
        () => {
            let file = client.getRecord('file', 'file_name', filename);
            expect(!!file).toEqual(true);
            file_url = file.file_url;
        },

        // full GET, check headers
        () => client.raw_request(file_url, {encoding: null}),
        (res) => {
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toEqual('application/octet-stream');
            expect(res.headers['content-security-policy']).toEqual("default-src 'none'");
            expect(res.headers['content-disposition']).toEqual('attachment; filename="' + filename + '"');
            expect(res.headers['cache-control']).toMatch(/^private, max-age=[0-9]+$/);
            expect(res.headers['accept-ranges']).toEqual('bytes');
            expect(res.headers['content-length']).toEqual(data.length + '');
            expect(data).toEqual(res.body);
            expect(Buffer.compare(data, res.body)).toEqual(0);
        },

        // partial requests
        () => {
            // test block boundaries
            let p = Promise.resolve();
            for (let i = 0; i < 40; i++) {
                p = fetchRange(p, client, file_url, i * 17, 3 * 17, data);
            }

            // partial overflow
            p = fetchRange(p, client, file_url, data.length - 10, 20, data);

            // several ranges at once
            p = fetchMultiRange(p, client, file_url, [
                [0, 19],
                [200, 5 * 19],
                [1025, 10],
                [data.length - 67, 67],
            ], data);
            return p;
        },

        // errors
        () => {
            // Too Many Ranges
            let badranges = [];
            for (let i = 0; i < 103; i++) {
                badranges.push([i, 1]);
            }
            return fetchRangeError(client, file_url, badranges, data);
        },

        // no ranges
        () => fetchRangeError(client, file_url, [], data),

        // no data in range
        () => fetchRangeError(client, file_url, [[data.length + 1, 10]], data),
        () => fetchRangeError(client, file_url, 'bytes=200-100', data),

        // bad unit
        () => fetchRangeError(client, file_url, 'crap=1-2', data),
    ]);
});

