PREFIX ?= /usr/local
SHELLSPEC = vendor/shellspec-0.28.1/shellspec
SHELLCHECK = shellcheck

.PHONY: test check check-test check-vendor fmt build install bump-major bump-minor bump-patch tag

check:
	@echo "--- check: shellcheck vendor/ examples/ ---"
	find ./vendor -name '*.sh' | xargs $(SHELLCHECK) -s sh -e SC1091
	find ./examples -type f | xargs $(SHELLCHECK) -s sh -e SC1091
	@echo "--- check: done ---"

fmt:
	@echo "--- fmt: prettier on markdown ---"
	npx prettier --write '**/*.md'
	npx prettier --write '**/*.json'
	@echo "--- fmt: done ---"

bump-major bump-minor bump-patch:
	@if [ -n "$$(git status --porcelain)" ]; then echo "Error: uncommitted changes in repo" >&2; exit 1; fi
	@PART=$$(echo $@ | sed 's/bump-//'); \
	NEW=$$(sh ./src/semver bump $$PART $$(cat VERSION)); \
	echo "--- $@: $$PART $$(cat VERSION) -> $$NEW ---"; \
	printf '%s\n' "$$NEW" > VERSION; \
	git add VERSION; \
	git commit -m "v$$NEW"; \
	echo "--- $@: done ---"

tag:
	@if [ -n "$$(git status --porcelain)" ]; then echo "Error: uncommitted changes in repo" >&2; exit 1; fi
	@TAG="v$$(cat VERSION)"; \
	if git rev-parse "$$TAG" >/dev/null 2>&1; then echo "Error: tag $$TAG already exists" >&2; exit 1; fi; \
	echo "--- tag: $$TAG ---"; \
	git tag "Release $$TAG"; \
	echo "--- tag: done ---"
