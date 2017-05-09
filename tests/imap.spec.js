
import { UserCache } from '../lib';
let UC = new UserCache([ 'Box User', ]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('test email sending', function () {
    it('should send email', function () {
        return UC.box.send_mail({
                from: UC.box.email_fullname,
                to: UC.box.email_fullname,
                subject: 'just trying',
                text: 'some text in body',
            })
            .then(function (res) {
                expect(res.accepted).toEqual([UC.box.email]);
                return true;
            });
    });
});

describe('test email recv', function () {
    it('should recv email', function () {
        return UC.waitMail(UC.box.email)
            .then(function (res) {
                expect(res[0].body).toEqual("some text in body");
                return true;
            })
            .then(function () {
                return UC.box.send_mail({
                    from: UC.box.email_fullname,
                    to: UC.box.email_fullname,
                    subject: 'test idle',
                    text: 'another text in body',
                });
            })
            .then(function () {
                return UC.waitMail(UC.box.email);
            })
            .then(function (res) {
                expect(res[0].body).toEqual("another text in body");
                return true;
            });
    });
});

