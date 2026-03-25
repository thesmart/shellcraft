## Shell Utilities

Utilities target **POSIX.1-2017** (IEEE Std 1003.1-2017), Shell & Utilities volume.

These are assumed to be present on the system and may be used freely:

- `awk`: pattern scanning and text processing
- `basename`: return non-directory portion of pathname
- `cat`: concatenate and print files
- `cd`: change working directory
- `chgrp`: change file group ownership
- `chmod`: change file modes
- `chown`: change file ownership
- `cksum`: write file checksums and sizes
- `cp`: copy files
- `cut`: extract fields/columns from lines
- `date`: print or set the system date and time
- `dd`: convert and copy a file
- `df`: report free disk space
- `diff`: compare files line by line
- `dirname`: return directory portion of pathname
- `du`: estimate file space usage
- `env`: set and inspect environment and execute commands
- `exec`: replace the current process with a command
- `export`: set environment variables for child processes
- `expr`: evaluate expressions (prefer `$(( ))` for arithmetic)
- `find`: find files
- `grep`: search file contents for patterns
- `head`: output first part of files
- `id`: print user and group IDs
- `kill`: terminate or signal a process
- `ln`: link files
- `ls`: list directory contents
- `mkdir`: make directories
- `mktemp`: create a temporary file or directory (**not POSIX** — see notes below)
- `mv`: move files
- `printf`: format and print data
- `ps`: report process status
- `pwd`: return working directory name
- `read`: read a line from standard input
- `rm`: remove directory entries
- `rmdir`: remove directories
- `sed`: stream editor
- `sh`: shell, the standard command language interpreter
- `sleep`: suspend execution for an interval
- `sort`: sort lines of text
- `tail`: output last part of files
- `tee`: duplicate stdin to stdout and a file
- `test`: evaluate expression
- `touch`: change file access and modification times
- `tr`: translate or delete characters
- `trap`: catch signals and errors for cleanup
- `tput`: terminal capability queries (colors, cursor)
- `type`: check how a name would be interpreted
- `ulimit`: set or report file size limit
- `uname`: print system information
- `unset`: unset variables or functions
- `wait`: wait for background processes to finish
- `wc`: count lines, words, and bytes
- `xargs`: build and execute commands from stdin

**ALWAYS** verify non-standard utilities (not on the list) before using:

```sh
command -v jq >/dev/null || die "jq is required but not found"
```

## Portability Notes

Utilities with common non-portable pitfalls:

### `date`

`+%s` (epoch seconds) is **not POSIX**. GNU uses `-d`, BSD uses `-j -f` for date parsing. Stick to
format strings like `+%Y-%m-%d` or `+%H:%M:%S`.

### `find`

POSIX-safe primaries: `-name`, `-type`, `-exec {} \;`, `-newer`, `-perm`, `-print`.

**Not POSIX:** `-maxdepth`, `-mindepth`, `-print0`, `-regex`, `-delete`. Use `-prune` to limit
depth:

```sh
# equivalent to -maxdepth 1
find . ! -name . -prune -type f
```

### `grep`

BRE (basic regular expressions) by default. Use `-E` for extended regex. **No `-P`** (Perl regex)
in POSIX. Use `-q` for silent match testing:

```sh
echo "$line" | grep -qE '^[0-9]+$' || die "not a number"
```

### `ls`

**Never parse `ls` output** — filenames with spaces, newlines, or special characters will break it.
Use `find` or shell glob patterns instead:

```sh
# bad: parsing ls
for f in $(ls *.txt); do ...

# good: glob
for f in *.txt; do
    [ -f "$f" ] || continue
    ...
done
```

### `mktemp`

**Not in any POSIX spec** but ubiquitous across GNU coreutils, BSD, and BusyBox. `mktemp` and
`mktemp -d` work on all major implementations. Avoid `-t` with a template — the syntax differs
between GNU and BSD. Assumed available because there is no portable alternative for safe temp file
creation.

### `read`

Only `-r` is POSIX (disable backslash escaping). **Always use `read -r`.**

Not portable: `-n`, `-t`, `-p`, `-a`, `-s`, `-d`.

### `sed`

BRE by default. Use `-E` for extended regex (POSIX 2024, widely supported).

**`-i` (in-place) is not POSIX.** Use a temp file:

```sh
sed 's/old/new/g' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
```

### `sleep`

Fractional seconds (`sleep 0.5`) are **not POSIX** — only integer seconds are guaranteed.

### `sort`

POSIX-safe flags: `-n`, `-r`, `-k`, `-t`, `-u`, `-f`, `-b`.

Not POSIX: `-V` (version sort), `-z` (null delimiter), `-h` (human numeric).

### `test` / `[ ]`

Use `=` not `==` for string comparison. `-a` (and) and `-o` (or) are obsolescent — chain separate
tests instead:

```sh
# bad
[ -f "$f" -a -r "$f" ]

# good
[ -f "$f" ] && [ -r "$f" ]
```

### `tr`

Use POSIX character classes: `[:upper:]`, `[:lower:]`, `[:digit:]`, `[:alpha:]`, `[:space:]`.

```sh
echo "$val" | tr '[:lower:]' '[:upper:]'
```

### `xargs`

`-0` (null delimiter) is **not POSIX**. Use newline-delimited input or `find -exec` instead.
