
import { parseMime } from '../lib/mime';
import { randomInt, randomUUID } from '../lib/utils';

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

describe('test mime parsing', () => {
    it('parse headers', () => {
        expect(parseMime(mail1)).toEqual({
            "headers": {
                "date": "Tue, 02 May 2017 20:07:26 +0000",
                "from": [ "tester+box.2661894524.e222e8c11e@box.fleep.ee", ],
                "subject": "just trying",
                "to": [ "tester+box.2661894524.e222e8c11e@box.fleep.ee" ],
            },
            "body": "some text in body"
        });
    });
});

describe('test random utils', () => {
    it('should return random integer', () => {
        /* eslint no-bitwise:0 */
        let v1 = randomInt();
        let v2 = randomInt();

        expect(typeof v1).toEqual("number");
        expect(typeof v2).toEqual("number");
        expect(v1 | 0).toEqual(v1);
        expect(v2 | 0).toEqual(v2);
        expect(v1 !== v2).toEqual(true);
    });
    it('should return random uuid', () => {
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
});

