---
name: shellcraft
description: "Writes portable POSIX sh scripts with getoptions argument parsing, single-file builds, and production patterns (traps, temp files, logging, pipelines). Triggers: shell script, sh script, bash script, CLI tool, command-line tool, getoptions, argument parsing, Makefile recipe, cron job, init script, git hook, CI/CD shell step, deployment script, automation task. Do NOT activate for Python, Node.js, or other non-shell scripting tasks."
license: PolyForm Internal Use License 1.0.0
compatibility: Designed for Claude Code (and compatible)
metadata:
  author: github.com/thesmart
  version: "2.1.0"
---

# Agent Skill: Shellcraft

@reference/conventions.md

@reference/utilities.md

Read these additional references only when the script requires them:

- [Arguments Parsing](./reference/getoptions.md)
- [Bashisms to Avoid](./reference/bashisms.md) — porting a bash script to POSIX, or reviewing
  existing code for portability
- [Logging & Verbosity](./reference/logging.md) — script needs `--verbose`, `--quiet`, timestamped
  logs, or structured stderr output
- [Trap & Cleanup](./reference/traps.md) — script creates resources that must be cleaned up on
  exit, error, or interrupt
- [Input Validation](./reference/validation.md) — script validates files, paths, numbers, or enum
  values beyond what getoptions handles
- [Temp Files & Atomic Writes](./reference/tempfiles.md) — script uses `mktemp`, writes
  intermediate files, or must write output atomically
- [Pipelines & Line Processing](./reference/pipelines.md) — script reads lines from files or
  commands, chains filters, or uses `xargs`/FIFOs
- [Strings & Pattern Matching](./reference/strings.md) — script manipulates strings (prefix/suffix
  stripping, `case` patterns, regex, here-docs)
- [Imports](./reference/imports.md) — sourcing libraries, resolving paths relative to `SCRIPT_DIR`
- [Capturing stderr](./reference/capture-stderr.md) — capturing error output from a failing command
  while checking its exit status
- [Locked Execution](./reference/locks.md) — exclusive locking when only one instance of a script
  should run at a time
- [Retry Loops](./reference/retry-loops.md) — retrying transient failures (network calls, lock
  contention)
- [Rollback](./reference/rollback.md) — undo-on-failure for scripts that make multiple changes that
  should be all-or-nothing
- [Advanced getoptions](./reference/getoptions-advanced.md) — less common getoptions features (read
  only when the specific feature is needed)

## Script Authoring Procedure

All conventions and utilities target **POSIX.1-2017** (IEEE Std 1003.1-2017), Shell & Utilities
volume.

Follow these steps to author the target script.

### Step 1: Make a Plan

1. Define the goal clearly
   1. Write one-sentence summary: what the target script does.
      - If not succinctly clear, maybe script is too complex?
   2. Use the summary to name the script file
2. Identify the target script's arguments and outputs.
3. Consider edge cases and failure modes.
4. Outline the control flow.
   1. major steps in plain language and/or pseudocode
   2. consider loops, pipelines, subshells, tmp files, traps, cleanup
   3. choose external utilities if needed, try to stick w/ built-ins
5. Decide if the target script needs parameter parsing:
   - **Yes** — script has flags, named params, or subcommands: use `getoptions-3.3.2.sh`
   - **No** — script only takes positional arguments: skip getoptions, define `usage()` manually
6. Decide the dependency bundling strategy (when using vendor libs):
   - **bundled** (default) — copy `getoptions-3.3.2.sh` + `getoptions-3.3.2.md` to `shell_modules/`
     alongside the script. Add to VCS; shared by all scripts in that directory.
   - **inlined** — embed the lib directly into the script via `vendor/inline`. Use when the script
     must be self-contained (distributed binary, `curl | sh`, CI without a repo).
   - **none** — no vendor libs; parse manually. Use when named options are trivial or absent.

   Infer the right strategy automatically: portability/distribution → inlined; project repo →
   bundled; minimal options → none. If genuinely unclear, ask the end-user.

7. Write an example of how an end-user would use the target script to accomplish the goal.

Evaluate the plan and ensure the it aligns with end-user's stated intent.

### Step 2: Write the Script

Follow the plan and write the script using the appropriate template. Make the script executable
(`chmod ug+x`) if needed.

#### With Option Parsing

Target script has flags, named params, or subcommands — use `getoptions-3.3.2.sh` (vendor context
file: [vendor/getoptions-3.3.2.md](./vendor/getoptions-3.3.2.md)):

```sh
#!/bin/sh

# --- helpers ---

die() { printf '%s\n' "error: $*" >&2; exit 1; }

# --- imports (see: reference/imports.md) ---

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/shell_modules/getoptions-3.3.2.sh" # @inline getoptions

# --- getoptions ---

parser_definition() {
   # Replace {{SCRIPT_NAME}} with the script's file name
   setup REST help:usage -- "Usage: {{SCRIPT_NAME}} [options] [arguments]"
   msg -- 'Options:'
   disp :usage -h --help
}

# If script requires arguments, uncomment next line:
# [ $# -eq 0 ] && set -- --help

eval "$(getoptions parser_definition - "$0") die 'failed to parse arguments'"

# --- script ---

# WRITE SCRIPT HERE

```

#### Without Option Parsing

Script takes only positional arguments — no import needed, define help manually:

```sh
#!/bin/sh

# --- helpers ---

die() { printf '%s\n' "error: $*" >&2; exit 1; }

usage() {
   printf 'Usage: {{SCRIPT_NAME}} <arg1> [arg2]\n'
   printf '\n'
   printf 'Description of what the script does.\n'
}

case ${1-} in --help|-h) usage; exit 0 ;; esac

# --- script ---

# WRITE SCRIPT HERE

```

### Step 3: Verification

1. Validate syntax: `sh -n script-name`
2. Verify `--help` output is clear and complete.
3. Test the script using the example from the plan:
   - Create a random tmp directory using `mktemp`.
   - Generate necessary input files to the random tmp directory.
   - Direct any output to the random tmp directory.

Fix any issues encountered and try again.

### Step 4: Bundle Dependencies

Skip this step for shell libs. Execute the strategy chosen in Step 1:

**bundled** — copy vendor libs and their context files to `shell_modules/`:

```console
cp vendor/getoptions-3.3.2.sh  shell_modules/
cp vendor/getoptions-3.3.2.md  shell_modules/
```

The `shell_modules/` directory is a sibling of the target script. The `.md` context file is
essential — it lets future agents understand the dependency without access to the shellcraft skill.
Commit `shell_modules/` to VCS alongside the script.

**inlined** — embed all `@inline`-tagged imports into a distributable single-file build:

```console
vendor/inline --target path/to/script --inline path/to/lib.sh --key <key> --overwrite
```

**none** — no build step needed.

### Step 5: Install

Read `$PATH` and `$HOME`. Select two or three of the most suitable locations for potentially
installing the script. Prefer at least one path in `$HOME`. Ask the end-user if they would like to
install the script, provide options with rationale for why that might be a good location.
