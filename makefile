.PHONY: install build

setup: install

install:
	yarn install
	./tools/install.sh

# update-definitions:
# 	node client/util/update-definitions.js

build:
	mkdir -p build
	$(foreach HOOK_C_FILENAME, $(shell ls ./hook-src/ | grep '\.c' | grep -v '\/'), \
		HOOK_C_FILENAME=$(HOOK_C_FILENAME); \
		wasmcc ./hook-src/$(HOOK_C_FILENAME) -o ./build/$(HOOK_C_FILENAME).wasm  -O0 -Wl,--allow-undefined -I../; \
		./binaryen/bin/wasm-opt -O2 ./build/$(HOOK_C_FILENAME).wasm -o ./build/$(HOOK_C_FILENAME).wasm; \
		./hook-cleaner-c/hook-cleaner ./build/$(HOOK_C_FILENAME).wasm; \
		./xrpld-hooks/src/ripple/app/hook/guard_checker ./build/$(HOOK_C_FILENAME).wasm; \
	)

# integration-runner:
# 	./tools/integration.sh

# set-hook: integration-runner set-hook
set-hook:
	npx ts-node ./src/setHook.tsx

# clean:
# 	rm -rf build/*
