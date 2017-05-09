
all:
	npm test

%:
	npm test $@

big-test:
	BIG_TEST=1 npm test

lint:
	npm run pretest

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

