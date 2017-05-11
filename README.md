
api-tests for fleep
===================

blackbox tests against dev servers.

usage
-----

- reinstall npm modules: `make refresh`
- run tests: `make` or `npm test`
- run specific test: `make poll` or `npm test poll`
- check versions of npm modules: `make check-versions`

fleep docs
----------

- https://fleep.io/fleepapi/

JS docs for backend developers
------------------------------

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
- https://facebook.github.io/jest/docs/api.html
- https://nodejs.org/dist/latest-v6.x/docs/api/
- https://github.com/request/request
- https://github.com/request/request-promise
- https://lodash.com/docs/

test api (see jest doc for details)
-----------------------------------

- it('should do foo', func) - test
- test('if foo works', func) - test
- describe(desc, func) - subgroup of tests
- it.skip, test.skip, describe.skip - skip this test
- it.only, test.only, describe.only - run only this test

