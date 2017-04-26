
all:
	@echo "*eslint*"
	@./node_modules/.bin/eslint lib tests
	@echo "*jest*"
	@./node_modules/.bin/jest tests

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

