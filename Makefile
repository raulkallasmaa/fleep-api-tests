
all:
	@mkdir -p logs
	npm test

%:
	@mkdir -p logs
	npm test $@

big-test:
	@mkdir -p logs
	BIG_TEST=1 npm test

lint:
	npm run pretest

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

