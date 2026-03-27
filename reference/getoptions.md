## getoptions

`./vendor/getoptions.sh` is the options parser library.

> WARNING: **DO NOT** waste tokens reading `getoptions.sh` unless explicitly asked to. This file
> provides the context.

### How It Works

`getoptions` is a code generator. You define a `parser_definition` function using directives
(`flag`, `param`, `option`, `disp`, `msg`, `cmd`). Calling `getoptions` with that definition
produces a shell parser function as a string. You `eval` it to install the parser, then it
processes `$@` in place.

```sh
eval "$(getoptions parser_definition - "$0") die 'failed to parse arguments'"
```

The `- "$0"` arguments: `-` means use the default parser name, `"$0"` is the script name for error
messages. After eval, `$@` contains only positional arguments (options are consumed).

### Feature Guide

Use this table to decide which feature to reach for. Common features are documented below. Advanced
features are in [getoptions-advanced.md](./getoptions-advanced.md).

| Feature               | Use when                                                    | Do NOT use when                        | Where                                |
| --------------------- | ----------------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| positional args       | script takes files, names, or other non-option args         | everything is an option                | below                                |
| `flag`                | boolean on/off, no value needed                             | option takes a value                   | below                                |
| `param`               | option requires a value (`-o file`)                         | value is optional                      | below                                |
| `option`              | value is optional (`--color[=WHEN]`)                        | value is always required               | below                                |
| `disp`                | print help/version and exit                                 | option has side effects beyond display | below                                |
| `cmd`                 | script has subcommands (`tool run`, `tool remote add`)      | script only has flags/params           | below                                |
| `counter:true`        | repeatable intensity flag (`-vvv`)                          | flag is just on/off                    | below                                |
| `--{no-}flag`         | flag needs negation (`--no-pager`)                          | flag is one-way only                   | below                                |
| `pattern:`            | value must be one of a fixed set (`json \| yaml`)           | any string is valid                    | below                                |
| `validate:`           | value needs runtime checking (numeric, range)               | `pattern:` alone is sufficient         | below                                |
| action variable (`:`) | repeatable option, key=value, mutual exclusion guard        | simple flag or param assignment        | below                                |
| subcommand dispatch   | `tool <cmd> [opts]` like git, docker, kubectl               | flat option-only script                | below                                |
| `error:FN`            | custom error messages per option/validator                  | default error messages are fine        | [advanced](./getoptions-advanced.md) |
| POSIX array           | collect repeated values into an iterable list               | comma-joined string is enough          | [advanced](./getoptions-advanced.md) |
| advanced `init:`      | init from another var, run code, leave unset                | simple literal default (`init:=VAL`)   | [advanced](./getoptions-advanced.md) |
| prehook               | debug/log/transform directive processing                    | normal script development              | [advanced](./getoptions-advanced.md) |
| compound flag         | one flag sets multiple vars (`-P` = `--partial --progress`) | flag maps to one variable              | [advanced](./getoptions-advanced.md) |
| three-way alias       | 3+ names for one option (`-q`/`--quiet`/`--silent`)         | short + long pair is enough            | [advanced](./getoptions-advanced.md) |
| numeric short flag    | digit as flag name (`-0` .. `-9`)                           | normal letter flags work               | [advanced](./getoptions-advanced.md) |

### Directives

#### `setup REST [attrs...] -- "Usage: ..." ["additional lines..."]`

Must be first. `REST` names the variable that collects remaining positional args.

| Attribute     | Effect                                                              |
| ------------- | ------------------------------------------------------------------- |
| `help:NAME`   | generate help function `NAME` (e.g. `help:usage`)                   |
| `abbr:true`   | allow unambiguous abbreviation of long options                      |
| `plus:true`   | enable `+o` style flags (sets the `no` value)                       |
| `error:FN`    | use custom error handler (see [advanced](./getoptions-advanced.md)) |
| `on:VAL`      | default `on` value for all flags/options                            |
| `no:VAL`      | default `no` value for all flags/options                            |
| `export:true` | export all variables                                                |
| `width:N`     | help label column width (default 30)                                |
| `mode:+`      | collect unrecognized options in REST                                |

Text after `--` becomes the help header. Separate lines as additional arguments.

#### `flag VAR SHORT LONG [attrs...] -- "description"`

Boolean flag. No argument value.

```sh
flag  FLAG_A   -a                                      -- "simple flag"
flag  FLAG_F   -f +f --{no-}flag                       -- "expands to --flag / --no-flag"
flag  FLAG_W         --with{out}-flag                  -- "expands to --with-flag / --without-flag"
flag  VERBOSE  -v    --verbose  counter:true init:=0   -- "-vvv sets VERBOSE=3"
```

- `--{no-}name` expands to `--name` and `--no-name`
- `--with{out}-name` expands to `--with-name` and `--without-name`
- `+f` syntax requires `plus:true` in setup; sets the `no` value
- `counter:true` increments instead of setting; use with `init:=0`

#### `param VAR SHORT LONG [attrs...] -- "description"`

Requires a value. Accepts `--param value`, `--param=value`, or `-pVALUE` (fused short form).

```sh
param  PARAM   -p --param                              -- "a string parameter"
param  NUMBER  -n --number   validate:number           -- "validated number"
param  RANGE      --range    validate:'range 10 100'   -- "validated range"
param  PATTERN    --pattern  pattern:'foo | bar'       -- "restricted to pattern"
```

#### `option VAR SHORT LONG [attrs...] -- "description"`

Optional value. With `--option=val` the value is `val`; without `=`, gets the `on` value; with
`--no-option`, gets the `no` value.

```sh
option OPTION  -o --option  on:"default"               -- "optional value flag"
```

#### `disp VAR|:ACTION SHORT LONG [attrs...] -- "description"`

Display action. Prints variable value or runs action, then exits.

```sh
disp   :usage   -h --help       # calls the help function (from help:usage)
disp   VERSION     --version    # prints $VERSION and exits
```

The `:` prefix means run as code rather than print a variable.

#### `msg -- "text"`

Help-only text. No parsing effect. Use for section headers and blank lines.

```sh
msg -- 'Options:'
msg -- ''          # blank line in help
msg label:"LABEL" -- "DESCRIPTION"   # custom label column
```

#### `cmd NAME -- "description"`

Declare a subcommand. Only valid when `setup` uses `REST`. See [Subcommands](#subcommands) below.

### Common Attributes

| Attribute            | Applies to       | Effect                                         |
| -------------------- | ---------------- | ---------------------------------------------- |
| `on:VAL`             | flag, option     | value when flag is set / option has no `=`     |
| `no:VAL`             | flag, option     | value when negated (`--no-X`, `+x`)            |
| `init:=VAL`          | flag, param, opt | initial value (`=` prefix for literal)         |
| `validate:FN`        | param, option    | call `FN`; nonzero return = validation failure |
| `validate:'FN args'` | param, option    | validator with extra arguments                 |
| `pattern:'a \| b'`   | param, option    | restrict value to case pattern                 |
| `counter:true`       | flag             | increment on each occurrence                   |
| `export:true`        | any              | export this variable (or `export:` to disable) |
| `hidden:true`        | any              | hide from help output                          |
| `label:TEXT`         | any              | custom help label                              |
| `var:NAME`           | param, option    | metavar in help (e.g. `var:FILE`)              |

For advanced `init:` modes (`@none`, `@unset`, `@export`, `@VARNAME`, `'CODE'`), see
[advanced](./getoptions-advanced.md).

### Help Text

`help:usage` in `setup` generates a function named `usage` that prints formatted help. Wire it to
`--help` with `disp`:

```sh
disp :usage -h --help
```

Every directive's `-- "text"` argument becomes a description line in help output. Multi-line
descriptions are additional arguments after `--`:

```sh
param OUTFILE -o --output var:FILE -- "write output to FILE" \
                                      "(default: stdout)"
```

`width:N` in `setup` controls the label column width (default 30). Use `var:NAME` to set the
metavar shown after param/option labels (e.g. `--output FILE`).

The generated help looks like:

```
Usage: tool [options...] [arguments...]

Options:
  -v, --verbose              enable verbose output
  -o, --output FILE          write output to FILE
                             (default: stdout)
  -h, --help
```

### Positional Arguments

After `eval getoptions`, all options are consumed and `$@` contains only positional arguments.
Access them by position or iterate:

```sh
# by position
input="$1"
output="$2"

# validate count
[ $# -ge 1 ] || die "missing required argument: <input>"

# iterate
for file do
  printf '%s\n' "$file"
done
```

The `--` separator terminates option parsing — everything after it is positional, even if it looks
like a flag. This is handled automatically.

```sh
# user passes: tool --verbose -- --not-a-flag file.txt
# after parsing: $1="--not-a-flag"  $2="file.txt"  VERBOSE=1
```

For wrapper scripts, this means `"$@"` after parsing contains exactly the args to pass through
(e.g. `exec "$@"`).

### Subcommands

Each command level gets its own `parser_definition` and `eval getoptions` call. The top-level
parser consumes global options and the command name. Each command parser consumes its own options.

#### Definition

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
  setup REST help:usage -- "Usage: tool run [-n] [-- cmd [args...]]"
  flag DRY_RUN -n --dry-run -- "dry run"
  param ENV    -e --env     -- "environment name"
  disp :usage     --help
}

parser_definition_remote() {
  setup REST help:usage -- "Usage: tool remote <subcommand> [...]"
  msg -- 'Subcommands:'
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

#### Dispatch

```sh
eval "$(getoptions parser_definition - "$0") die 'failed to parse arguments'"
cmd=$1; shift
case $cmd in
  run)
    eval "$(getoptions parser_definition_run - "$0") die 'failed to parse arguments'"
    # $@ now has only positionals for 'run'
    ;;
  remote)
    eval "$(getoptions parser_definition_remote - "$0") die 'failed to parse arguments'"
    subcmd=$1; shift
    case $subcmd in
      add)
        eval "$(getoptions parser_definition_remote_add - "$0") die 'failed to parse arguments'"
        name=$1 url=$2
        ;;
      remove)
        eval "$(getoptions parser_definition_remote_remove - "$0") die 'failed to parse arguments'"
        name=$1
        ;;
      *) printf '%s\n' "error: unknown subcommand: $subcmd" >&2; exit 1 ;;
    esac
    ;;
  *) printf '%s\n' "error: unknown command: $cmd" >&2; exit 1 ;;
esac
```

Naming convention: `parser_definition_<command>` for commands,
`parser_definition_<command>_<subcommand>` for subcommands.

### Validators

A validator is a function that inspects `$OPTARG`. Return 0 to accept, nonzero to reject.
Validators can modify `$OPTARG` for normalization.

```sh
number() { case $OPTARG in (*[!0-9]*) return 1 ;; esac; }

range() {
  number || return 1
  [ "$1" -le "$OPTARG" ] && [ "$OPTARG" -le "$2" ] && return 0
  return 2
}

# normalizing validator — transforms input
blood_type() {
  case $OPTARG in
    a) OPTARG="A" ;; b) OPTARG="B" ;;
    [aA][bB]) OPTARG="AB" ;; o) OPTARG="O" ;;
  esac
}

# regex validator (uses awk)
regex() { awk -v s="$OPTARG" -v r="$1" 'BEGIN{exit match(s, r)==0}'; }
```

Usage in `param`:

```sh
param NUMBER     --number  validate:number
param RANGE      --range   validate:'range 10 100'
param BLOOD_TYPE --blood   validate:blood_type pattern:"A | B | O | AB"
param REGEX_VAL  --regex   validate:'regex "^[1-9][0-9]*$"'
```

`validate:` runs the function; `pattern:` restricts values via a `case` pattern. Both can be
combined — the validator runs first.

For custom error handlers that give typed error messages per validator, see
[advanced](./getoptions-advanced.md).

### Action Variables

When a variable name starts with `:`, getoptions executes it as code instead of assigning a
variable. The code receives `$1` (option name) and `$OPTARG` (value). This is the mechanism behind
repeatable options, mutual exclusion guards, and key=value parsing.

#### Repeatable option (accumulate values)

Used by: curl (`-H`), grep (`-e`), sed (`-e`), rsync (`--exclude`), kubectl (`-f`), and many
others:

```sh
param :add_header -H --header init:'HEADERS=""' var:HEADER -- "HTTP header (repeatable)"
```

```sh
add_header() { HEADERS="${HEADERS}${HEADERS:+ }${OPTARG}"; }
```

For POSIX array accumulation and action functions with parameters, see
[advanced](./getoptions-advanced.md).

#### Mutually exclusive mode flags

Used by: tar (`-c`/`-x`/`-t`). Multiple flags write to the same variable with different `on:`
values. Last flag wins:

```sh
flag MODE -c on:create  -- "create archive"
flag MODE -x on:extract -- "extract archive"
flag MODE -t on:list    -- "list contents"
```

To reject conflicting flags, use action variables with a guard:

```sh
flag :set_mode -c on:create  -- "create archive"
flag :set_mode -x on:extract -- "extract archive"
flag :set_mode -t on:list    -- "list contents"
```

```sh
set_mode() { [ -z "$MODE" ] || die "cannot combine -c, -x, -t"; MODE="$OPTARG"; }
```

#### Key=value params (`-c name=value`)

Used by: git (`-c`), awk (`-v`), psql (`-v`). `param` captures the entire string; split on `=` in a
helper:

```sh
param :add_config -c var:KEY=VALUE -- "set config key=value"
```

```sh
add_config() {
  key="${OPTARG%%=*}"
  val="${OPTARG#*=}"
  # store, validate, or accumulate as needed
}
```

### Examples

- [trivial](../examples/trivial) — minimal boilerplate
- [basic](../examples/basic) — flags, params, options, counters, patterns, validators
- [advanced](../examples/advanced) — custom errors, multi-value, arrays, actions, normalization
- [cmds-and-subcmds](../examples/cmds-and-subcmds) — nested command/subcommand parsing
- [custom-error](../examples/custom-error) — custom error handler with typed errors
- [prehook](../examples/prehook) — debug/intercept directive processing
