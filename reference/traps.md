# Trap & Cleanup Patterns

## Basic Cleanup

Guarantee temp files are removed on exit, interrupt, or error:

```sh
TMPDIR=""

cleanup() {
	[ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
}
trap cleanup EXIT

TMPDIR="$(mktemp -d)" || die "failed to create temp dir"
```

The `EXIT` trap fires on normal exit, `die`, or unhandled errors. No need to also trap `INT`/`TERM`
unless you need special interrupt behavior.

## Preserving Exit Code

If cleanup should not mask the original failure:

```sh
cleanup() {
	rc=$?
	[ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
	exit "$rc"
}
trap cleanup EXIT
```

## Multiple Cleanup Steps

Register steps as you go:

```sh
_cleanup_cmds=""

on_exit() {
	_cleanup_cmds="$1
${_cleanup_cmds}"
}

cleanup() {
	rc=$?
	printf '%s\n' "$_cleanup_cmds" | while IFS= read -r cmd; do
		[ -n "$cmd" ] && eval "$cmd"
	done
	exit "$rc"
}
trap cleanup EXIT

# Usage:
TMPDIR="$(mktemp -d)"
on_exit "rm -rf '$TMPDIR'"

cp config.toml config.toml.bak
on_exit "mv config.toml.bak config.toml"
```

## Interrupt Handling

When you need to print a message on Ctrl-C:

```sh
trap 'printf "\ninterrupted\n" >&2; exit 130' INT
```

Exit code 130 is the convention for SIGINT (128 + signal number 2).
