# Agent Instructions

You are responsible for Shellcraft code repository that is an Agent Skill for writing shell scripts
and libraries.

Read [`README.md`](./README.md) for project specification.

## Project Layout

```
bin/                       # build and install scripts
examples/             # runnable script examples
SKILL.md             # skill entry point loaded by the agent
reference/           # reference docs loaded on demand
vendor/              # vendor code, do not edit
vendor/getoptions.sh # POSIX option parser lib
vendor/semver        # semver comparison utility
vendor/shellspec-0.28.1/ # testing framework
scripts/             # empty folder where the skill can write scripts to
Makefile                   # repo tasks that use bin/ scripts
VERSION                    # canonical semver for the project
```

@reference/conventions.md
