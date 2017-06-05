
env = $(FLEEP_ENV_NAME)

all:
	@mkdir -p logs
	FLEEP_ENV_NAME=$(env) npm test

%:
	@mkdir -p logs
	FLEEP_ENV_NAME=$(env) npm test $@

big-test:
	@mkdir -p logs
	FLEEP_ENV_NAME=$(env) BIG_TEST=1 npm test

lint:
	npm run pretest

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

