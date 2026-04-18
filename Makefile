.PHONY: build check check-deps dep-node dep-npx dep-python dep-skillcost fmt bump-major bump-minor bump-patch set-skill-version update-skills tag tokens test

dep-node:
	@command -v node >/dev/null 2>&1 || { echo "Error: node not found. Install Node.js 24+: https://nodejs.org/" >&2; exit 1; }
	@node -e 'process.exit(parseInt(process.versions.node.split(".")[0], 10) >= 24 ? 0 : 1)' || { echo "Error: node >= 24 required (found $$(node --version))" >&2; exit 1; }

dep-npx:
	@command -v npx >/dev/null 2>&1 || { echo "Error: npx not found. Install Node.js: https://nodejs.org/" >&2; exit 1; }

dep-skillcost:
	@command -v skillcost >/dev/null 2>&1 || { echo "Error: skillcost not found. Install: pip install skillcost  (or: uv tool install skillcost)" >&2; exit 1; }

check-deps: dep-npx dep-node

build: dep-node
	@echo "--- build: SKILL.tmpl.md -> SKILL.md ---"
	node scripts/build.js SKILL.tmpl.md > SKILL.md
	@echo "--- build: done ---"

fmt: check-deps
	@echo "--- fmt: prettier on markdown ---"
	npx prettier --write '**/*.md'
	npx prettier --write '**/*.json'
	@echo "--- fmt: done ---"

bump-major bump-minor bump-patch: check-deps
	@if [ -n "$$(git status --porcelain)" ]; then echo "Error: uncommitted changes in repo" >&2; exit 1; fi
	@PART=$$(echo $@ | sed 's/bump-//'); \
	OLD=$$(cat VERSION); \
	NEW=$$(sh ./vendor/semver bump $$PART "$$OLD") || { echo "Error: semver bump failed" >&2; exit 1; }; \
	if [ -z "$$NEW" ]; then echo "Error: semver returned empty version" >&2; exit 1; fi; \
	echo "--- $@: $$PART $$OLD -> $$NEW ---"; \
	printf '%s\n' "$$NEW" > VERSION
	@$(MAKE) set-skill-version
	@git add VERSION SKILL.md || { echo "Error: git add failed" >&2; exit 1; }; \
	NEW=$$(cat VERSION); \
	git commit -m "v$$NEW" || { echo "Error: git commit failed" >&2; exit 1; }; \
	echo "--- $@: verify ---"; \
	cat VERSION; \
	git --no-pager log --oneline -1; \
	echo "--- $@: done ---"

set-skill-version:
	@vendor/set-skill-version SKILL.md "$$(cat VERSION)"
	@vendor/set-skill-version SKILL.tmpl.md "$$(cat VERSION)"

update-skills: check-deps
	@echo "--- update-skills ---"
	npx skills update --all -y
	@echo "--- update-skills: done ---"

tag:
	@if [ -n "$$(git status --porcelain)" ]; then echo "Error: uncommitted changes in repo" >&2; exit 1; fi
	@VERSION=$$(cat VERSION); \
	if [ -z "$$VERSION" ]; then echo "Error: VERSION file is empty" >&2; exit 1; fi; \
	TAG="v$$VERSION"; \
	if git rev-parse "$$TAG" >/dev/null 2>&1; then echo "Error: tag $$TAG already exists" >&2; exit 1; fi; \
	echo "--- tag: $$TAG ---"; \
	git tag -m "$$TAG" "$$TAG" || { echo "Error: git tag failed" >&2; exit 1; }; \
	echo "--- tag: verify ---"; \
	git --no-pager tag -l "$$TAG"; \
	git push origin "$$TAG"; \
	echo "--- tag: done ---"

tokens: dep-skillcost
	@skillcost SKILL.md

test: dep-node
	@echo "--- test: node --test scripts/*.test.js ---"
	node --test scripts/*.test.js
	@echo "--- test: done ---"
