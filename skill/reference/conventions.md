## Shell Script Conventions

Shell scripts shall **ALWAYS**:

- use `#!/usr/bin/env sh` as the shebang line
- be POSIX-standard `sh` shell
- be idempotent (safe to run multiple times, same result)
- check for `--help` first, before any other parsing
- validate all file/dir path parameters for safety
- use `set -euo pipefail` options
- exit with code 0 on success, exit with code >= 1 on failure
- output clear error messages
- use [getoptions](./getoptions/CLAUDE.md) for parameter parsing
- resolve the `SCRIPT_DIR` and use this for current directory:
  - i.e. `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"`
- use relative path parameters to CWD
- use `mktemp` for in-progress work (prevent partial artificats)

Shell scripts shall **NEVER**:

- use or require superuser privileges
- modify a file that isn't explicitly required as an option

### Args convention

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
