
PATH := ./node_modules/.bin:$(PATH)
export PATH

all:
	eslint .
	jest

refresh:
	rm -rf dist node_modules
	npm install

check:
	npm outdated --depth 0

