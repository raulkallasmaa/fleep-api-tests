
import { parseMime } from '../lib/mime';
import { randomInt, randomUUID, parseMimeHeaders, generateData } from '../lib/utils';
import { matchRec, matchStream } from '../lib/testclient';

let mail1 = `Return-Path: <tester+box.2661894524.e222e8c11e@box.fleep.ee>
X-Original-To: tester+box.2661894524.e222e8c11e@box.fleep.ee
Delivered-To: tester+box.2661894524.e222e8c11e@box.fleep.ee
Received: from [127.0.0.1] (103-169-191-90.dyn.estpak.ee [90.191.169.103])
    by gn181.zone.eu (Postfix) with ESMTPSA id 024554F67AF8
    for <tester+box.2661894524.e222e8c11e@box.fleep.ee>; Tue,  2 May 2017 23:07:26 +0300 (EEST)
Content-Type: text/plain
From: Box User <tester+box.2661894524.e222e8c11e@box.fleep.ee>
To: Box User <tester+box.2661894524.e222e8c11e@box.fleep.ee>
Subject: just trying
Message-ID: <3eb50560-8a07-a6cf-0faf-af35bb5161f4@box.fleep.ee>
Content-Transfer-Encoding: 7bit
Date: Tue, 02 May 2017 20:07:26 +0000
MIME-Version: 1.0

some text in body

`;

test('setup-early', function () {
    expect(typeof Promise.config).toEqual('function');
    let setup = require('../lib/setup-early');
    expect(setup.Promise).toEqual(Promise);
    expect(setup.NativePromise === Promise).toEqual(false);
});

test('parseMime', function () {
    expect(parseMime(mail1)).toEqual({
        "date": "Tue, 02 May 2017 20:07:26 +0000",
        "from": [ "tester+box.2661894524.e222e8c11e@box.fleep.ee", ],
        "subject": "just trying",
        "to": [ "tester+box.2661894524.e222e8c11e@box.fleep.ee" ],
        "body": "some text in body"
    });
});

test('randomInt', function () {
    /* eslint no-bitwise:0 */
    let v1 = randomInt();
    let v2 = randomInt();

    expect(typeof v1).toEqual("number");
    expect(typeof v2).toEqual("number");
    expect(v1 | 0).toEqual(v1);
    expect(v2 | 0).toEqual(v2);
    expect(v1 !== v2).toEqual(true);
});

test('randomUUID', function () {
    /* eslint no-bitwise:0 */
    let v1 = randomUUID();
    let v2 = randomUUID();
    expect(typeof v1).toEqual("string");
    expect(typeof v2).toEqual("string");
    expect(v1.replace(/[0-9a-f]/g, 'x')).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    expect(v2.replace(/[0-9a-f]/g, 'x')).toEqual('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    expect([v1[14], v2[14]]).toEqual(['4', '4']);

    expect(v1 !== v2).toEqual(true);
});

test('matchRec', function () {
    expect(matchRec({}, {})).toEqual(true);
    expect(matchRec({a: null, b: 'x'}, {a: null})).toEqual(true);
    expect(matchRec({a: null, b: 'x'}, {a: null, c: 'x'})).toEqual(false);
    expect(matchRec({a: 5, b: 'x'}, {a: 5, b: 'x'})).toEqual(true);
});

test('matchStream', function () {
    expect(matchStream([{}], {})).toEqual({});
});

test('generateData', function () {
    let v1 = generateData(1024);
    let v2 = generateData(1024);
    expect(v1.length).toEqual(1024);
    expect(Buffer.compare(v1, v2) !== 0).toEqual(true);
});


test('parseMimeHeaders', function () {
    let mtest = 'k : v\r\nK2 : V2\r\n v3\r\nk3:v4\r\n\r\n';
    expect(parseMimeHeaders(mtest)).toEqual({k: 'v', k2: 'V2 v3', k3: 'v4'});
});


