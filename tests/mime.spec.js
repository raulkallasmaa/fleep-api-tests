
import { parseMime } from '../lib/mime';

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

