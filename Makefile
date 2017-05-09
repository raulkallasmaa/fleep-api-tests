
all:
	npm test

%:
	npm test $@

big-test:
	BIG_TEST=1 npm test

lint:
	@echo "[eslint]"
	@./node_modules/.bin/eslint lib tests

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

