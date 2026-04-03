# getoptions 3.3.2

`getoptions-3.3.2.sh` is a POSIX option parser for shell scripts.

> **DO NOT** read `getoptions-3.3.2.sh` — it is a large library file. This document provides all
> the context needed to use it. Reading the file directly wastes context.

## How to Use

1. Source the library:

   ```sh
   SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
   . "${SCRIPT_DIR}/getoptions-3.3.2.sh"
   ```

2. Define a `parser_definition` function using directives (see below).

3. Install the parser — this processes `$@` in place; after this line, options are consumed and
   `$@` contains only positional arguments:
   ```sh
   eval "$(getoptions parser_definition - "$0") die 'failed to parse arguments'"
   ```
   `-` = default parser name, `"$0"` = script name for error messages.

## Feature Guide

| Feature             | Use when                                               |
| ------------------- | ------------------------------------------------------ |
| positional args     | script takes files, names, or other non-option args    |
| `flag`              | boolean on/off, no value needed                        |
| `param`             | option requires a value (`-o file`)                    |
| `option`            | value is optional (`--color[=WHEN]`)                   |
| `disp`              | print help/version and exit                            |
| `cmd`               | script has subcommands (`tool run`, `tool remote add`) |
| `counter:true`      | repeatable intensity flag (`-vvv`)                     |
| `--{no-}flag`       | flag needs negation (`--no-pager`)                     |
| `pattern:`          | value must be one of a fixed set (`json \| yaml`)      |
| `validate:`         | value needs runtime checking (numeric, range)          |
| action variable     | repeatable option, key=value, mutual exclusion guard   |
| subcommand dispatch | `tool <cmd> [opts]` like git, docker, kubectl          |

## Directives

### `setup REST [attrs...] -- "Usage: ..."`

Must be first. `REST` collects remaining positional args.

| Attribute     | Effect                                            |
| ------------- | ------------------------------------------------- |
| `help:NAME`   | generate help function `NAME` (e.g. `help:usage`) |
| `abbr:true`   | allow unambiguous abbreviation of long options    |
| `plus:true`   | enable `+o` style flags                           |
| `on:VAL`      | default `on` value for all flags/options          |
| `no:VAL`      | default `no` value for all flags/options          |
| `export:true` | export all variables                              |
| `width:N`     | help label column width (default 30)              |
| `mode:+`      | collect unrecognized options in REST              |

### `flag VAR SHORT LONG [attrs...] -- "description"`

Boolean flag. No argument value.

```sh
flag  FLAG_A   -a                                    -- "simple flag"
flag  FLAG_F   -f +f --{no-}flag                     -- "expands to --flag / --no-flag"
flag  FLAG_W         --with{out}-flag                -- "expands to --with-flag / --without-flag"
flag  VERBOSE  -v    --verbose  counter:true init:=0 -- "-vvv sets VERBOSE=3"
```

### `param VAR SHORT LONG [attrs...] -- "description"`

Requires a value. Accepts `--param value`, `--param=value`, or `-pVALUE`.

```sh
param  PARAM   -p --param                            -- "a string parameter"
param  NUMBER  -n --number   validate:number         -- "validated number"
param  RANGE      --range    validate:'range 10 100' -- "validated range"
param  PATTERN    --pattern  pattern:'foo | bar'     -- "restricted to pattern"
```

### `option VAR SHORT LONG [attrs...] -- "description"`

Optional value. `--option=val` → val; `--option` → `on` value; `--no-option` → `no` value.

```sh
option OPTION  -o --option  on:"default"             -- "optional value flag"
```

### `disp VAR|:ACTION SHORT LONG -- "description"`

Prints variable or runs action (`:` prefix), then exits.

```sh
disp :usage  -h --help     # calls help function (from help:usage in setup)
disp VERSION    --version  # prints $VERSION and exits
```

### `msg -- "text"`

Help-only text. No parsing effect.

```sh
msg -- 'Options:'
msg -- ''
msg label:"LABEL" -- "DESCRIPTION"
```

### `cmd NAME -- "description"`

Declare a subcommand. Only valid when `setup` uses `REST`.

## Common Attributes

| Attribute            | Applies to       | Effect                                         |
| -------------------- | ---------------- | ---------------------------------------------- |
| `on:VAL`             | flag, option     | value when flag is set / option used without = |
| `no:VAL`             | flag, option     | value when negated (`--no-X`, `+x`)            |
| `init:=VAL`          | flag, param, opt | initial value (`=` prefix for literal)         |
| `validate:FN`        | param, option    | call `FN`; nonzero = validation failure        |
| `validate:'FN args'` | param, option    | validator with extra arguments                 |
| `pattern:'a \| b'`   | param, option    | restrict value to case pattern                 |
| `counter:true`       | flag             | increment on each occurrence                   |
| `export:true`        | any              | export this variable                           |
| `hidden:true`        | any              | hide from help output                          |
| `var:NAME`           | param, option    | metavar in help (e.g. `var:FILE`)              |

## Help Text

`help:usage` in `setup` generates a `usage` function. Wire to `--help`:

```sh
disp :usage -h --help
```

Each directive's `-- "text"` becomes a help line. Multi-line:

```sh
param OUTFILE -o --output var:FILE -- "write output to FILE" "(default: stdout)"
```

## Positional Arguments

After `eval getoptions`, `$@` contains only positionals.

```sh
input="$1"; output="$2"
[ $# -ge 1 ] || die "missing required argument: <input>"
for file do printf '%s\n' "$file"; done
```

## Subcommands

Each level gets its own `parser_definition` and `eval getoptions` call.

### Definition

```sh
parser_definition() {
  setup REST help:usage -- "Usage: tool [-v] <command> [...]"
  msg -- 'Commands:'
  cmd run    -- "run a task"
  cmd remote -- "manage remotes"
  msg -- '' 'Options:'
  flag VERBOSE -v --verbose -- "verbose output"
  disp :usage    --help
}

parser_definition_run() {
  setup REST help:usage -- "Usage: tool run [-n]"
  flag DRY_RUN -n --dry-run -- "dry run"
  param ENV    -e --env     -- "environment name"
  disp :usage     --help
}

parser_definition_remote() {
  setup REST help:usage -- "Usage: tool remote <subcommand>"
  cmd add    -- "add a remote"
  cmd remove -- "remove a remote"
  disp :usage    --help
}

parser_definition_remote_add() {
  setup REST help:usage -- "Usage: tool remote add [-f] <name> <url>"
  flag FETCH -f --fetch -- "fetch after adding"
  disp :usage   --help
}
```

Naming: `parser_definition_<cmd>` / `parser_definition_<cmd>_<subcmd>`.

### Dispatch

```sh
eval "$(getoptions parser_definition - "$0") die 'failed to parse arguments'"
cmd=$1; shift
case $cmd in
  run)
    eval "$(getoptions parser_definition_run - "$0") die 'failed to parse arguments'"
    ;;
  remote)
    eval "$(getoptions parser_definition_remote - "$0") die 'failed to parse arguments'"
    subcmd=$1; shift
    case $subcmd in
      add)
        eval "$(getoptions parser_definition_remote_add - "$0") die 'failed to parse arguments'"
        name=$1 url=$2
        ;;
      *) printf '%s\n' "error: unknown subcommand: $subcmd" >&2; exit 1 ;;
    esac
    ;;
  *) printf '%s\n' "error: unknown command: $cmd" >&2; exit 1 ;;
esac
```

## Validators

A validator inspects `$OPTARG`. Return 0 to accept, nonzero to reject. Can modify `$OPTARG`.

```sh
number() { case $OPTARG in (*[!0-9]*) return 1 ;; esac; }

range() {
  number || return 1
  [ "$1" -le "$OPTARG" ] && [ "$OPTARG" -le "$2" ]
}
```

```sh
param NUMBER --number  validate:number
param RANGE  --range   validate:'range 10 100'
```

`validate:` and `pattern:` can combine — validator runs first.

## Action Variables

Variable name starting with `:` executes code instead of assigning. Receives `$1` (option name) and
`$OPTARG` (value).

### Repeatable option

```sh
param :add_header -H --header init:'HEADERS=""' var:HEADER -- "HTTP header (repeatable)"
```

```sh
add_header() { HEADERS="${HEADERS}${HEADERS:+ }${OPTARG}"; }
```

### Mutually exclusive flags

```sh
flag :set_mode -c on:create  -- "create archive"
flag :set_mode -x on:extract -- "extract archive"
flag :set_mode -t on:list    -- "list contents"
```

```sh
set_mode() { [ -z "$MODE" ] || die "cannot combine -c, -x, -t"; MODE="$OPTARG"; }
```

### Key=value params

```sh
param :add_config -c var:KEY=VALUE -- "set config key=value"
```

```sh
add_config() { key="${OPTARG%%=*}"; val="${OPTARG#*=}"; }
```
