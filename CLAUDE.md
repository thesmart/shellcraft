# Agent Instructions

You are responsible for Shellcraft code repository that is an Agent Skill for writing shell scripts
and libraries.

Contributing to this skill **requires** installing and then loading the external skill
`/skill-creator` for context. Read [`.agent/skills/CLAUDE.md`](./.agents/skills/CLAUDE.md) for
required skills.

## Project Layout

Read [`README.md`](./README.md) for project specification.

- `SKILL.md` — skill entry point; defines what refs to load and when
- `reference/` — on-demand reference docs (conventions, getoptions, utilities, patterns)
- `examples/` — runnable POSIX sh example scripts organized by pattern
- `vendor/getoptions-3.3.2.sh` — POSIX option parser lib (source into scripts)
- `vendor/getoptions-3.3.2.md` — getoptions reference doc
- `vendor/getoptions-3.3.2/` — getoptions source tree, used to generate
  `vendor/getoptions-3.3.2.sh`
- `vendor/semver` — semver comparison utility script
- `vendor/inline` — tool to inline `source`d files into a single-file build
- `vendor/set-skill-version` — updates `VERSION` and skill metadata version
- `.agents/skills/skill-creator/` — sub-skill for creating and improving `SKILL.md`; use when asked
  to improve the skill, run evals, or measure skill performance. Read
- `Makefile` — repo tasks (build, lint, test, version bumps)
- `VERSION` — canonical semver for this project
- `skills-lock.json` — locked versions of agent skills used by this project

## Glossary

| Term                                              | Canonical name          | Definition                                                                                                        |
| ------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| script, executable, utility                       | **shell script**        | A directly-executable shell file: no extension, `chmod ug+x`.                                                     |
| library, lib, sourced file                        | **shell lib**           | A `.sh` file meant to be imported or inlined by other scripts, not executed directly.                             |
| flags, options, arguments, parameters, CLI inputs | **arguments**           | The command-line args declared in `parser_definition()` and parsed by `getoptions`.                               |
| vendor libs                                       | **vendor lib**          | A third-party shell file (`.sh`) under `vendor/`, provided as is for use by the skill.                            |
| vendor context                                    | **vendor context file** | A Markdown (`.md`) file co-located with a vendor lib that documents its API. Read this instead of the lib source. |
