import {UserCache, thenSequence} from '../lib';
let UC = new UserCache([
    'Box User',
], __filename, jasmine);

beforeAll(() => UC.setup());
afterAll(() => UC.cleanup());

test('send email', function () {
    let box = UC.box;
    return thenSequence([
        () => box.send_mail({
            from: box.email_fullname,
            to: box.email_fullname,
            subject: 'just trying',
            text: 'some text in body',
        }),
        (res) => expect(res.accepted).toEqual([box.email]),
    ])
        .catch(function (err) {
            expect(err).toEqual({});
            return true;
    });
});

test('receive email', function () {
    let box = UC.box;
    return thenSequence([
        () => UC.waitMail(box.email),
        (res) => expect(res[0].body).toEqual("some text in body"),
        () => box.send_mail({
            from: box.email_fullname,
            to: box.email_fullname,
            subject: 'test idle',
            text: 'another text in body',
        }),
        () => UC.waitMail(box.email),
        (res) => expect(res[0].body).toEqual("another text in body"),
        ])
        .catch(function (err) {
            expect(err).toEqual({});
            return true;
    });
});