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

## Shell Conventions

Shell scripts and libraries **SHALL**:

- target POSIX.1-2017 for maximum compatibility (exception: `mktemp` is OK)
- handle errors explicitly; check every command that can fail
- use built-in [utilities](./utilities.md)
- source using [imports](./imports.md)

Shell scripts and libraries **SHALL NOT**:

- modify global shell state
- use `set -o pipefail` (not POSIX-standard)

Shell scripts **SHALL**:

- use `#!/bin/sh` shebang
- handle `--help` before all other args
- exit `0` on success, `2` on bad arguments, `1` on all other failures
- use [`getoptions`](./getoptions.md) to declare and validate arguments
- write error messages to stderr (`>&2`) — include what failed and how to fix it

Shell scripts **SHALL NOT**:

- write to a path that isn't explicit via an argument (use stdout instead)

Shell scripts **SHOULD**:

- resolve `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"` when sourcing relative files
- be idempotent where possible

Shell libraries **SHALL**:

- use `return`, not `exit` — `exit` terminates the parent shell
- omit the shebang — libs are sourced, not executed directly

### Glossary

| Term                                              | Canonical name          | Definition                                                                                                        |
| ------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| script, executable, utility                       | **shell script**        | A directly-executable shell file: no extension, `chmod ug+x`.                                                     |
| library, lib, sourced file                        | **shell lib**           | A `.sh` file meant to be imported or inlined by other scripts, not executed directly.                             |
| flags, options, arguments, parameters, CLI inputs | **arguments**           | The command-line args declared in `parser_definition()` and parsed by `getoptions`.                               |
| vendor libs                                       | **vendor lib**          | A third-party shell file (`.sh`) under `vendor/`, provided as is for use by the skill.                            |
| vendor context                                    | **vendor context file** | A Markdown (`.md`) file co-located with a vendor lib that documents its API. Read this instead of the lib source. |

### Naming

- functions and variables: `snake_case`
- constants and env vars: `UPPER_SNAKE_CASE`
- file names: `kebab-case` (lowercase, hyphens)
- use `readonly` for constants set once at startup

### Exit Codes

| Code  | Meaning                          |
| ----- | -------------------------------- |
| `0`   | Success                          |
| `1`   | General error                    |
| `2`   | Usage / invalid arguments        |
| `126` | Command found but not executable |
| `127` | Command not found                |
| `130` | Interrupted (SIGINT / Ctrl-C)    |

Best practices:

- use `|| die "message"` pattern for error propagation
- use `printf '%s\n' "$msg"` over `echo "$msg"` — `echo` behavior varies across shells
- use `printf '%s'` (no newline) when building partial output
- use `trap` handlers for cleanup and safety
- use `mktemp` for in-progress work (prevents partial artifacts)
- shell scripts: no file extension, `chmod ug+x`
- shell libs: `.sh` file extension, no execute bit

### Argument Conventions

Here is a pseudo-grammar for style of CLI arguments:

```ebnf
args           = [ command , " " , { subcommand , " " } ]
               , { option , " " }
               , { positional , " " }
               , [ separator , " " , { positional } ] ;

option         = short_group | long_option ;

short_group    = "-" , SHORT_CHAR , { SHORT_CHAR }
               , [ " " , value ] ;

long_option    = "--" , LONG_NAME , [ "=" , value | " " , value ] ;

separator      = "--"

command        = TOKEN ;
subcommand     = TOKEN ;
value          = TOKEN ;
positional     = TOKEN ;

(* The "--" is optional and rare. When present, it
   terminates option parsing — everything after it
   is collected as positional arguments in `$@`. *)
```

#### File Argument Validation

**ALWAYS, EXPLICITLY** validate file/directory args early with `die`, before real work. Skip
emptiness, symlinks, and extensions — focus on safety not business logic.

**File input:**

```sh
[ -e "$FILE" ] || die "file not found: $FILE"
[ -f "$FILE" ] || die "not a regular file: $FILE"
[ -r "$FILE" ] || die "file not readable: $FILE"
```

**Directory input:**

```sh
[ -e "$DIR" ] || die "directory not found: $DIR"
[ -d "$DIR" ] || die "not a directory: $DIR"
[ -r "$DIR" ] || die "directory not readable: $DIR"
[ -x "$DIR" ] || die "directory not traversable: $DIR"
```

**File output:**

```sh
_outdir="$(dirname "$FILE")"
[ -d "$_outdir" ] || die "parent directory not found: $_outdir"
[ -w "$_outdir" ] || die "parent directory not writable: $_outdir"
if [ -e "$FILE" ]; then
  [ -f "$FILE" ] || die "not a regular file: $FILE"
  [ -w "$FILE" ] || die "file not writable: $FILE"
fi
```

**Directory output:**

```sh
[ -e "$DIR" ] || die "directory not found: $DIR"
[ -d "$DIR" ] || die "not a directory: $DIR"
[ -w "$DIR" ] || die "directory not writable: $DIR"
```

## POSIX Utilities

External utilities from **POSIX.1-2017** (IEEE Std 1003.1-2017), Shell & Utilities volume,
Chapter 4. These are assumed to be present on the system and may be used freely without a
`command -v` guard.

- `awk`: pattern scanning and text processing
- `basename`: return non-directory portion of pathname
- `bc`: arbitrary precision calculator language
- `cat`: concatenate and print files
- `chgrp`: change file group ownership
- `chmod`: change file modes
- `chown`: change file ownership
- `cksum`: write file checksums and sizes
- `cmp`: compare two files byte-by-byte
- `comm`: select or reject lines common to two sorted files
- `command`: identify a command type
- `cp`: copy files
- `csplit`: split files based on context
- `cut`: extract fields/columns from lines
- `date`: print or set the system date and time
- `dd`: convert and copy a file
- `df`: report free disk space
- `diff`: compare files line by line
- `dirname`: return directory portion of pathname
- `du`: estimate file space usage
- `env`: set environment and execute a command
- `expand`: convert tabs to spaces
- `expr`: evaluate expressions (prefer `$(( ))` for arithmetic)
- `false`: return false value (exit 1)
- `file`: determine file type
- `find`: find files
- `fold`: fold long lines for finite width output
- `getconf`: get system configuration values
- `grep`: search file contents for patterns
- `head`: output first part of files
- `iconv`: codeset conversion
- `id`: print user and group IDs
- `join`: relational join of two sorted files
- `kill`: terminate or signal a process
- `link`: create a hard link to a file
- `ln`: link files
- `locale`: get locale-specific information
- `logger`: log messages to the system log
- `logname`: return the user's login name
- `ls`: list directory contents
- `mkdir`: make directories
- `mkfifo`: make FIFO special files (named pipes)
- `mktemp`: create a temporary file or directory (**not POSIX** — see notes below)
- `mv`: move files
- `nice`: invoke a utility with an altered nice value
- `nl`: line numbering filter
- `nohup`: invoke a utility immune to hangups
- `od`: dump files in various formats
- `paste`: merge corresponding lines of files
- `patch`: apply changes to files
- `pathchk`: check pathnames
- `printf`: format and print data
- `ps`: report process status
- `renice`: set nice values of running processes
- `rm`: remove directory entries
- `rmdir`: remove directories
- `sed`: stream editor
- `sh`: shell, the standard command language interpreter
- `sleep`: suspend execution for an interval
- `sort`: sort lines of text
- `split`: split files into pieces
- `strings`: find printable strings in files
- `stty`: set the options for a terminal
- `tail`: output last part of files
- `tee`: duplicate stdin to stdout and a file
- `touch`: change file access and modification times
- `tput`: terminal capability queries (colors, cursor)
- `tr`: translate or delete characters
- `true`: return true value (exit 0)
- `tsort`: topological sort
- `tty`: return user's terminal name
- `type`: check how a name would be interpreted
- `uname`: print system information
- `unexpand`: convert spaces to tabs
- `uniq`: report or filter out repeated lines
- `unlink`: call the unlink function
- `wc`: count lines, words, and bytes
- `xargs`: build and execute commands from stdin

**ALWAYS** verify non-standard utilities (not on the list above) before using:

```sh
command -v jq >/dev/null || die "jq is required but not found"
```

## Portability Notes

Utilities with common non-portable pitfalls:

### `date`

`+%s` (epoch seconds) is **not POSIX**. GNU uses `-d`, BSD uses `-j -f` for date parsing. Stick to
format strings like `+%Y-%m-%d` or `+%H:%M:%S`.

### `echo`

Behavior of `echo` varies across shells and platforms — backslash interpretation and `-n` flag
handling are not standardized. **Prefer `printf '%s\n'`** for reliable output:

```sh
# bad: may interpret escapes or not, depending on platform
echo "value is\t$val"

# good: consistent everywhere
printf 'value is\t%s\n' "$val"
```

### `find`

POSIX-safe primaries: `-name`, `-type`, `-exec {} \;`, `-newer`, `-perm`, `-print`.

**Not POSIX:** `-maxdepth`, `-mindepth`, `-print0`, `-regex`, `-delete`. Use `-prune` to limit
depth:

```sh
# equivalent to -maxdepth 1
find . ! -name . -prune -type f
```

### `grep`

BRE (basic regular expressions) by default. Use `-E` for extended regex. **No `-P`** (Perl regex)
in POSIX. Use `-q` for silent match testing:

```sh
echo "$line" | grep -qE '^[0-9]+$' || die "not a number"
```

### `ls`

**Never parse `ls` output** — filenames with spaces, newlines, or special characters will break it.
Use `find` or shell glob patterns instead:

```sh
# bad: parsing ls
for f in $(ls *.txt); do ...

# good: glob
for f in *.txt; do
    [ -f "$f" ] || continue
    ...
done
```

### `mktemp`

**Not in any POSIX spec** but ubiquitous across GNU coreutils, BSD, and BusyBox. `mktemp` and
`mktemp -d` work on all major implementations. Avoid `-t` with a template — the syntax differs
between GNU and BSD. Assumed available because there is no portable alternative for safe temp file
creation.

### `read`

Only `-r` is POSIX (disable backslash escaping). **Always use `read -r`.**

Not portable: `-n`, `-t`, `-p`, `-a`, `-s`, `-d`.

### `sed`

BRE by default. Use `-E` for extended regex (POSIX 2024, widely supported).

**`-i` (in-place) is not POSIX.** Use a temp file:

```sh
sed 's/old/new/g' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
```

### `sleep`

Fractional seconds (`sleep 0.5`) are **not POSIX** — only integer seconds are guaranteed.

### `sort`

POSIX-safe flags: `-n`, `-r`, `-k`, `-t`, `-u`, `-f`, `-b`.

Not POSIX: `-V` (version sort), `-z` (null delimiter), `-h` (human numeric).

### `test` / `[ ]`

Use `=` not `==` for string comparison. `-a` (and) and `-o` (or) are obsolescent — chain separate
tests instead:

```sh
# bad
[ -f "$f" -a -r "$f" ]

# good
[ -f "$f" ] && [ -r "$f" ]
```

### `tr`

Use POSIX character classes: `[:upper:]`, `[:lower:]`, `[:digit:]`, `[:alpha:]`, `[:space:]`.

```sh
echo "$val" | tr '[:lower:]' '[:upper:]'
```

### `xargs`

`-0` (null delimiter) is **not POSIX**. Use newline-delimited input or `find -exec` instead.

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
