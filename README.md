# Shellcraft Agent Skill

![context](https://img.shields.io/badge/context-9.1k_tokens-blue)

An opinionated agent skill for writing **POSIX.1-2017** compliant shell scripts (i.e. `sh`, not
`bash`, `zsh`, etc.).

> **NOTE:** This skill constraints the use of allowed utilities. The one allowed departure from
> POSIX is the use of `mktemp`. See [Shell Utilities & Portability Notes](./reference/utilities.md)
> for details.

## Why Shellcraft

Most shell scripting skills default to Bash, hedge on portability, or provide reference material
without a clear workflow. Shellcraft takes a different approach:

- **Strictly POSIX `sh`** — no bashisms, no `set -o pipefail`, no `[[ ]]`, no arrays. Scripts run
  on `dash`, `ash`, BusyBox, and every `/bin/sh` out there.
- **Full argument parsing** — integrates getoptions, a real POSIX option parser with long flags,
  subcommands, validation, and auto-generated `--help`. Not a hacky `getopts` wrapper.
- **End-to-end workflow** — a structured 5-step procedure (plan, write, verify, build, install)
  guides the agent from requirements through to a shippable artifact.
- **Single-file distribution** — the `inline` build tool vendors dependencies into one
  self-contained script. No `source` paths to break, no `vendor/` directory to ship.
- **Utility allow-list** — an explicit list of safe POSIX utilities with per-command portability
  notes. Non-standard tools require a `command -v` guard.
- **Bashism guardrails** — a concrete cheatsheet of Bash constructs and their POSIX replacements,
  preventing the most common AI mistakes before they happen.
- **Production patterns included** — retry loops, file locking, rollback/undo, trap cleanup, stderr
  capture, logging with verbosity control — all POSIX-clean.
- **Pipeline safety** — explicit guidance for the `pipefail` gap, subshell variable scoping, and
  safe line-by-line processing patterns.
- **String handling without forks** — parameter expansion reference for prefix/suffix stripping,
  defaults, and conditional substitution. Avoids spawning `sed`/`awk` for basic string work.
- **Temp file lifecycle** — canonical `mktemp` + trap cleanup pattern, atomic writes via rename,
  and portable flag guidance (GNU vs BSD `mktemp` differences).

---

## Installation

### Skillfish

```sh
skillfish add thesmart/shellcraft/skill
```

### Manual

Clone into your Claude Code skills directory:

```sh
git clone https://github.com/thesmart/shellcraft.git ~/.claude/skills/shellcraft
```

---

## License Terms

This software is licensed under the [PolyForm Internal Use License 1.0.0](./LICENSE).

Informal license summary:

- **Internal use only**: Use and modify freely within your organization.
- **No distribution**: You cannot redistribute outside your organization, no sublicensing.
- **No warranty**: Provided "as is" with no liability.
