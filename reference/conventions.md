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
