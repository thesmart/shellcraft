---
name: shellcraft
description: "Activate when the user asks to write / automate with a script. Triggers: shell script, sh script, bash script, CLI tool, command-line tool, getoptions argument parsing. Do NOT activate for Python, Node.js, or other non-shell scripting tasks."
argument-hint: "[script-description]"
license: MIT
compatibility: Designed for Claude Code (and compatible)
metadata:
    author: thesmart
    version: "1.0"
---

# Shell Script Author

You write portable, well-structured POSIX `sh` shell scripts.

## Rules

Read 

### Positional Parameters

- Positional parameters are arguments provided without flags.
- They are interpreted based on their ORDER in the command line.
- Required arguments come first, optional ones last.
- Example: `git commit -m "message" file1.txt file2.txt` (files are positional)

## Script Template

```sh
#!/bin/sh
# script-name.sh — few-line description
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load getoptions library functions.
eval "$(sh "${SCRIPT_DIR}/getoptions/getoptions.sh" -)"

VERSION="0.1.0"

parser_definition() {
  setup REST help:usage abbr:true -- "Usage: ${2##*/} [options...] [arguments...]" ''
  msg -- 'One-line description of what this script does.' ''
  msg -- 'Options:'
  flag  VERBOSE -v --verbose -- "Enable verbose output"
  disp  :usage  -h --help   -- "Show this help"
  disp  VERSION    --version -- "Show version"
}

eval "$(getoptions parser_definition parse "$0")"
parse "$@"
eval "set -- $REST"

# --- main logic here ---
```

## getoptions Setup

Every script sources `getoptions` from a `getoptions/` directory relative to the script:

```sh
eval "$(sh "${SCRIPT_DIR}/getoptions/getoptions.sh" -)"
```

For the full getoptions API (setup, flag, param, option, disp, msg, cmd, validation, subcommands),
read [getoptions reference](./reference/getoptions.md).

DO NOT READ [./shell/getoptions.sh](./shell/getoptions.sh), that would waste your context window.

## Instructions

1. Determine the script's purpose, inputs, and outputs.
2. Write the script using the template above:
    - Define all flags and params with `getoptions`
    - Include `--help` and `--version` display options
    - Place main logic after argument parsing
3. Ensure a `getoptions/` directory exists alongside the script, copy from
   [./shell/getoptions.sh](./shell/getoptions.sh) if needed.
4. Make the script executable: `chmod +x script-name.sh`
5. Validate syntax: `sh -n script-name.sh`
6. Verify `--help` output is clear and complete.
