
#NFLAGS = --trace-warnings --trace-sync-io
#JFLAGS = --verbose

all: lint jest

jest:
	@echo "[jest] env=$(FLEEP_ENV_NAME)"
	@node $(NFLAGS) ./node_modules/.bin/jest --verbose $(JFLAGS) tests

lint:
	@echo "[eslint]"
	@./node_modules/.bin/eslint --verbose lib tests

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

etests: lint
	@echo "[jest] env=$(FLEEP_ENV_NAME)"
	@./node_modules/.bin/jest --verbose tests/imap

mtests: lint
	@echo "[jest] env=$(FLEEP_ENV_NAME)"
	@./node_modules/.bin/jest --verbose tests/mime

