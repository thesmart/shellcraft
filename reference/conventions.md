## Shell Script Conventions

Shell scripts shall **ALWAYS**:

- be POSIX-standard shell for maximum compatibility
- use `#!/bin/sh` shebang
- check `--help` first before other args
- resolve `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"`, use for relative sourcing
- handle errors explicitly, check every command that can fail
- exit with code 0 on success, exit with code >= 1 on failure
- output clear error messages
- use [getoptions](./getoptions.md) for parameter parsing
  - validate all arguments/options via `parser_definition`
- use built-in [utilities](./utilities.md), or verify before using a non built-in
- source using [imports](./imports.md)

Shell scripts shall:

- **NEVER** modify global shell state
- **NEVER** write a path that isn't explicit via args
- **NEVER** use `set -o pipefail` (not POSIX-standard)

### Output

- prefer `printf '%s\n' "$msg"` over `echo "$msg"` — `echo` behavior varies across shells
- use `printf '%s'` (no newline) when building partial output
- errors and diagnostics to stderr (`>&2`), data to stdout

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

Scripts should exit `0` on success, `2` on usage errors, and `1` on all other failures.

Best practices:

- scripts should be idempotent where applicable
- validate inputs for safety
- use subshell isolation to avoid modifying shell state
- use `|| die "message"` pattern
- use `mktemp` for in-progress work (prevent partial artifacts)
- use `trap` handlers for safety and cleanup
- file extension:
  - `.sh` for shell libs
  - no extension, `chmod ug+x`
- `--help` prints complete documentation

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
