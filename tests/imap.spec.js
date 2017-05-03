
import { UserCache } from '../lib';
let UC = new UserCache([ 'Box User', ]);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

describe('test email sending', () => {
    it('should send email',
        () => UC.box.send_mail({
            from: UC.box.email_fullname,
            to: UC.box.email_fullname,
            subject: 'just trying',
            text: 'some text in body',
        })
        .then((res) => {
            expect(res.accepted).toEqual([UC.box.email]);
            return true;
        }));
});

describe('test email recv', () => {
    it('should recv email',
        () => UC.waitMail(UC.box.email)
        .then((res) => {
            expect(res[0].body).toEqual("some text in body");
            return true;
        })
        .then(() => UC.box.send_mail({
            from: UC.box.email_fullname,
            to: UC.box.email_fullname,
            subject: 'test idle',
            text: 'another text in body',
        }))
        .then(() => UC.waitMail(UC.box.email))
        .then((res) => {
            expect(res[0].body).toEqual("another text in body");
            return true;
        }));
});

/*
describe('test email recv', () => {
    it('should recv email',
        () => Promise.resolve());
});
*/
