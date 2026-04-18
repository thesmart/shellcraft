# Contributing

## Prerequisites

- Run `make check-deps`.

## Edit → Build → Verify

The skill entry point is `SKILL.md`, but **do not edit it directly** — it is generated from
[SKILL.tmpl.md](SKILL.tmpl.md) by expanding `@path/to/ref.md` imports.

```sh
# Regenerate SKILL.md:
make build
make fmt
make set-skill-version
```

Commit `SKILL.md` along with your source changes.

## Release

```sh
make bump-patch   # or bump-minor / bump-major
                  # bumps VERSION, updates SKILL.md frontmatter, commits
make tag          # creates v<version> tag and pushes to origin
```

Bumps require a clean working tree. Tag pushes trigger publication.
