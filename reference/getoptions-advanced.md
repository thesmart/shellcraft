## Advanced getoptions Features

> Features used by fewer than 3 of the top 25 shell utilities. Read this only when the specific
> feature is needed.

### Custom Error Handler

Declare with `error:FN` in setup. Without it, getoptions prints a default message and exits 1.

```sh
setup REST error:error help:usage -- "Usage: ..."
```

The handler receives:

| Arg   | Content                                                            |
| ----- | ------------------------------------------------------------------ |
| `$1`  | default error message                                              |
| `$2`  | error type: `unknown`, `noarg`, `required`, `pattern:PAT`, `FN:RC` |
| `$3`  | the option that failed                                             |
| `$4+` | context (validator arguments)                                      |

For `validate:` errors, `$2` is `VALIDATOR_NAME:RETURN_CODE` (e.g. `range:2`).

Return codes from the handler:

- **0** — fall through to the default message
- **1** — your message was printed; exit 1
- **2+** — exit with that code

```sh
error() {
  case $2 in
    unknown)    printf '%s\n' "Unrecognized option: $3" ;;
    number:*)   printf '%s\n' "Not a number: $3" ;;
    range:1)    printf '%s\n' "Not a number: $3" ;;
    range:2)    printf '%s\n' "Out of range ($5-$6): $3"; return 2 ;;
    *)          return 0 ;;  # show default message
  esac
  return 1
}
```

### POSIX Array Accumulation

```sh
# in parser_definition:
parray() { param ":append_array_posix $@"; }
parray PARRAY --array-posix init:'PARRAY=""' var:VALUE
```

```sh
append_array_posix() {
  set -- "$1" "$OPTARG"
  until [ "${2#*\'}" = "$2" ] && eval "$1=\"\$$1 '\${3:-}\$2'\""; do
    set -- "$1" "${2#*\'}" "${2%%\'*}'\"'\"'"
  done
}

# read back with:
eval disp_array PARRAY "$PARRAY"
```

### Action with Parameters

Pass extra arguments to an action function:

```sh
param :'action "$1" p1 p2' --act1 --act2 var:param
```

```sh
action() { printf 'option=%s params=%s,%s arg=%s\n' "$1" "$2" "$3" "$OPTARG"; exit 0; }
```

### Advanced `init:` Modes

| Mode            | Effect                                   |
| --------------- | ---------------------------------------- |
| `init:=VAL`     | literal initial value                    |
| `init:@none`    | skip initialization entirely             |
| `init:@empty`   | set to `''` (default)                    |
| `init:@unset`   | leave variable unset; test with `${X+x}` |
| `init:@export`  | export without setting a value           |
| `init:@VARNAME` | initialize from another variable's value |
| `init:'CODE'`   | run arbitrary init code                  |

### Prehook Extension

Override `prehook` inside `parser_definition` to intercept all directive calls. Useful for
debugging, logging, or transforming definitions.

```sh
extension() {
  prehook() {
    helper=$1 varname_or_action=$2; shift 2
    printf '[debug] %s %s %s\n' "$helper" "$varname_or_action" "$*" >&2
    invoke "$helper" "$varname_or_action" "$@"
  }
}

parser_definition() {
  extension
  setup REST help:usage -- "Usage: ..."
  # all directives below are now intercepted
  flag FLAG -f --flag -- "a flag"
}
```

`invoke` calls the original directive handler — always call it to preserve normal behavior.

### Compound Flag (one flag sets multiple vars)

Used by: rsync (`-P` = `--partial --progress`), wget (`-m`). Use an action variable on `flag`:

```sh
flag :set_P -P -- "same as --partial --progress"
```

```sh
set_P() { PARTIAL=1; PROGRESS=1; }
```

### Three-Way Alias (`-q` / `--quiet` / `--silent`)

Used by: grep, make. Declare the same variable with multiple directives; hide the synonyms:

```sh
flag QUIET -q --quiet  -- "suppress output"
flag QUIET    --silent hidden:true
```

### Numeric Short Flags (`-0` .. `-9`)

Used by: zip (compression level), psql (`-1`). Digit characters are valid short option names.
Combine with a shared variable:

```sh
flag LEVEL -0 on:0 -- "store only (no compression)"
flag LEVEL -1 on:1 -- "fastest compression"
flag LEVEL -9 on:9 -- "best compression"
```

### Comma-Separated List Value (`-p 1,2,3`)

Used by: htop (`-p PID,PID,...`). `param` captures the raw string; split in the script:

```sh
param PIDS -p var:PID,... -- "process IDs (comma-separated)"
```

```sh
# after parsing, split:
IFS=, set -- $PIDS
for pid do
  # ...
done
```

### Limitations

These patterns cannot be handled by getoptions and require pre-processing `$@` or manual handling
outside the parser:

- **Multi-argument option** (`--arg name value` consuming two tokens) — only jq uses this
- **Colon-namespaced option** (`-c:v codec`) — only ffmpeg uses this
- **Option terminates parsing** (`-c cmd` makes all remaining args non-options) — python, jq
