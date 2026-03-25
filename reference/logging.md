# Logging & Verbosity

Standard POSIX logging functions. All output goes to stderr so stdout stays clean for data.

## Core Functions

```sh
log() { printf '%s\n' "$*" >&2; }
warn() { printf 'warning: %s\n' "$*" >&2; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
```

## Timestamped Logging

When scripts run in cron, CI, or long-running contexts:

```sh
log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }
```

## Verbose Mode

Add a `--verbose` / `-v` flag via getoptions and gate debug output:

```sh
VERBOSE=""

verbose() {
	[ -n "$VERBOSE" ] && printf '%s\n' "$*" >&2
}

# In parser_definition:
#   flag VERBOSE -v --verbose -- "Enable verbose output"
```

Usage:

```sh
verbose "downloading $url"
curl -fsSL "$url" -o "$tmpfile" || die "download failed"
verbose "saved to $tmpfile"
```

## Quiet Mode

Suppress all non-error output:

```sh
QUIET=""

log() {
	[ -n "$QUIET" ] && return
	printf '%s\n' "$*" >&2
}

# In parser_definition:
#   flag QUIET -q --quiet -- "Suppress non-error output"
```
