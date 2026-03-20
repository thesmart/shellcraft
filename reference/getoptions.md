## getoptions

`./vendor/getoptions.sh` is the options parser library.

> WARNING: **DO NOT** waste tokens reading `getoptions.sh` unless explicitly asked to. This file
> provides the context.

### Examples:

- [basic](../examples/basic)
- [advanced](../examples/advanced)
- [cmds-and-subcmds](../examples/cmds-and-subcmds)

### `parser_definition`

Runs in a subshell — variables and functions defined inside do not pollute the global scope. Helper
functions are also available only inside the subshell.

> NOTE: `OPTIND` and `OPTARG` are reused for a different purpose than `getopts`. On success,
> `OPTIND` is reset to `1` and `OPTARG` is unset. On failure, `OPTARG` is set to the failed
> option's value.

### Custom error handler

Register via `setup REST error:myfn`. Signature: `error $1 $2 $3 [$4...]`

| `$2` (error name)      | `$3`   | `$4+`                 | `OPTARG`                  |
| ---------------------- | ------ | --------------------- | ------------------------- |
| `unknown`              | option | —                     | option value              |
| `noarg`                | option | —                     | option value              |
| `required`             | option | —                     | option value              |
| `pattern:<PATTERN>`    | option | —                     | option value              |
| `<validator>:<STATUS>` | option | validator name + args | option value              |
| `ambiguous`            | option | candidate options     | candidates joined by `, ` |

`$1` is the default error message. Return `0` to show the default; return `1` to suppress it;
return `2+` to set a custom exit status.

Example: [custom-error](../examples/custom-error)

### Prehook

Define `prehook` inside `parser_definition` to intercept helper function calls. Use `invoke` to
call the original function.

NOTE: `prehook` is not called during help generation.

Example: [prehook](../examples/prehook)

## Helper functions

Available only inside `getoptions` and `getoptions_help` (not globally defined).

### Data types

| Type       | Description                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SWITCH     | `-?`, `+?`, `--*`, `--no-*`, `--with-*`, `--without-*`,<br>`--{no-}*` (expands to `--flag` and `--no-flag`),<br>`--with{out}-*` (expands to `--with-flag` and `--without-flag`) |
| BOOLEAN    | Boolean (true: not zero-length string, false: **zero-length string**)                                                                                                           |
| STRING     | String                                                                                                                                                                          |
| NUMBER     | Number                                                                                                                                                                          |
| STATEMENT  | Function name (arguments can be added) — e.g. `foo`, `foo 1 2 3`                                                                                                                |
| CODE       | Statement or multiple statements — e.g. `foo; bar`                                                                                                                              |
| KEY-VALUE  | `key:value` — if `:value` is omitted, same as `key:key`                                                                                                                         |
| INIT-VALUE | `@on` \| `@no` \| `@unset` \| `@none` \| `@export`                                                                                                                              |

| INIT-VALUE | Effect                                                      |
| ---------- | ----------------------------------------------------------- |
| `@on`      | Set to positive value [default: `1`]                        |
| `@no`      | Set to negative value [default: empty]                      |
| `@unset`   | Unset the variable                                          |
| `@none`    | No initialization (use current value)                       |
| `@export`  | Add export flag only, no initialization (use current value) |

### `setup` — global settings (mandatory)

`setup <restargs> [settings...] [default-attributes...] [-- [messages...]]`

- `restargs` (VARIABLE) — variable to collect remaining args; use `-` to omit
- settings (KEY-VALUE):
  - `abbr`:BOOLEAN — handle abbreviated long options (requires `getoptions_abbr`)
  - `alt`:BOOLEAN — allow long options with single `-`; disables `-abc` and `-sVALUE` syntax
  - `error`:STATEMENT — custom error handler
  - `help`:STATEMENT — define help function (requires `getoptions_help`)
  - `leading`:STRING — leading chars in help option column [default: `" "` (two spaces)]
  - `mode`:STRING — scanning mode [default: empty] (see table below)
  - `plus`:BOOLEAN — treat `+`-prefixed args as options [default: auto]
  - `width`:NUMBER — width of option/subcommand column in help [default: `"30,12"`]
- default attributes (KEY-VALUE): `export`, `hidden`, `init`, `on` [default: `1`], `no` [default:
  empty]

#### Scanning modes

| mode | `getopt`      | `getoptions`                                     |
| ---- | ------------- | ------------------------------------------------ |
| `+`  | Supported     | Stop parsing when a non-option argument is found |
| `-`  | Supported     | Not supported                                    |
| `@`  | Not supported | Like `+` but preserves `--` (subcommands mode)   |

### Helper signatures

All helpers follow the pattern:
`<helper> <varname | :action> [switches...] [attributes...] [-- [messages...]]`

`msg` and `cmd` omit `varname`/`switches`.

| Helper   | Takes arg?   | Description                        |
| -------- | ------------ | ---------------------------------- |
| `flag`   | no           | Option with no argument            |
| `param`  | required     | Option with required argument      |
| `option` | optional     | Option with optional argument      |
| `disp`   | display-only | Option that only appears in help   |
| `msg`    | —            | Help message text                  |
| `cmd`    | —            | Subcommand (sets scan mode to `@`) |

NOTE: `cmd` changes the scanning mode to `@` (subcommands mode).

### Attributes by helper

| Attribute  | flag | param | option | disp | msg | cmd | Notes                                             |
| ---------- | :--: | :---: | :----: | :--: | :-: | :-: | ------------------------------------------------- |
| `abbr`     |  ✓   |   ✓   |   ✓    |  ✓   |     |     | default `1` if abbr enabled; set empty to disable |
| `counter`  |  ✓   |       |        |      |     |     | counts occurrences of the flag                    |
| `export`   |  ✓   |   ✓   |   ✓    |      |     |     | export the variable                               |
| `hidden`   |  ✓   |   ✓   |   ✓    |  ✓   |  ✓  |  ✓  | hide from help output                             |
| `init`     |  ✓   |   ✓   |   ✓    |      |     |     | `@INIT-VALUE \| =STRING \| CODE`                  |
| `label`    |  ✓   |   ✓   |   ✓    |  ✓   |  ✓  |  ✓  | option/command column text in help                |
| `on`       |  ✓   |       |   ✓    |      |     |     | positive value                                    |
| `no`       |  ✓   |       |   ✓    |      |     |     | negative value                                    |
| `pattern`  |  ✓   |   ✓   |   ✓    |      |     |     | pattern to accept                                 |
| `validate` |  ✓   |   ✓   |   ✓    |      |     |     | STATEMENT for value validation                    |
| `var`      |      |   ✓   |   ✓    |      |     |     | variable name shown in help                       |

### Help display layout

```console
Options:
+----------------------------- message -----------------------------+
:                                                                   :
+----------- label -----------+                                     :
:   width [default: 30]       :                                     :
:                             :                                     :
  -f, +f, --flag              message for --flag
  -l, +l, --long-long-option-name
                              message for --long-long-option-name
  -o, +o, --option VAR        message for --option
|     |            |
|     |            +-- var
|     +-- plus (visible if specified)
+-- leading [default: "  " (two spaces)]

Commands:
+---------------- message ----------------+
:                                         :
+-- label --+                             :
: width [12]:                             :
:           :                             :
  cmd1      subcommand1
  cmd2      subcommand2
  cmd3      subcommand3
|
+-- leading [default: "  " (two spaces)]
```
