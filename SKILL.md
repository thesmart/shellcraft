---
name: shellcraft
description:
  "Activate when the user asks to write / automate with a script. Triggers: shell script, sh
  script, bash script, CLI tool, command-line tool, getoptions argument parsing. Do NOT activate
  for Python, Node.js, or other non-shell scripting tasks."
license: PolyForm Internal Use License 1.0.0
compatibility: Designed for Claude Code (and compatible)
metadata:
  author: github.com/thesmart
  version: "1.0"
---

Read all the following files into context:

1. [Shell Conventions](./reference/conventions.md)
2. [Shell Utilities](./reference/utilities.md)
3. [Shell Options Parsing](./reference/getoptions.md)

# Script Authoring Procedure

Follow these steps to generate a portable, well-structured POSIX `sh` shell script.

## Step 1: Make a Plan

1. Define the goal clearly
   1. Write one-sentence summary: what the script does.
      - If not succinctly clear, maybe script is too complex?
   2. Use the summary to name the script file
2. Identify details re: inputs and outputs.
3. Consider edge cases and failure modes.
4. Outline the control flow.
   1. major steps in plain language and/or pseudocode
   2. consider loops, pipelines, subshells, tmp files, traps, cleanup
   3. choose external utilities if needed, try to stick w/ built-ins
5. Write an example of how an end-user would use the script to accomplish the goal.

Evaluate the plan and ensure the it aligns with end-user's stated intent.

## Step 2: Write the Script

Follow the plan and write the script using this template:

```sh
#!/bin/sh

# --- imports ---

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/path/to/getoptions.sh" # @inline getoptions

# --- helpers ---

parser_definition() {
	setup REST help:usage -- "Usage: {{SCRIPT_NAME}} [options] [arguments]"
	msg -- 'Options:'
	disp :usage -h --help
}

die() { echo "error: $*" >&2; exit 1; }

# --- getoptions ---

eval "$(getoptions parser_definition parse)"
parse "$@"
eval "set -- $REST"

# --- script ---

# WRITE SCRIPT HERE

```

> NOTE: replace `{{SCRIPT_NAME}}` with the script's file name.

Replace `{{SCRIPT_NAME}}` with the script's file name.

Make the script executable (`chmod ug+x`) if needed.

## Step 3: Verification

1. Validate syntax: `sh -n script-name`
2. Verify `--help` output is clear and complete.
3. Test the script using the example from the plan:
   - Create a random tmp directory using `mktemp`.
   - Generate necessary input files to the random tmp directory.
   - Direct any output to the random tmp directory.

Fix any issues encountered and try again.

## Step 4: Build

Build the script by running `inline`:

```console
vendor/inline --target path/to/script --inline path/to/getoptions.sh --key getoptions --overwrite
```

## Step 5: Install

Read `$PATH` and `$HOME`. Select two or three of the most suitable locations for potentially
installing the script. Prefer at least one path in `$HOME`. Ask the end-user if they would like to
install the script, provide options with rationale for why that might be a good location.
