
PATH := ./node_modules/.bin:$(PATH)
export PATH

all:
	eslint lib tests
	jest tests

refresh:
	rm -rf dist node_modules
	npm install

check-versions:
	npm outdated --depth 0

