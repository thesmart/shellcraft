## POSIX Utilities

External utilities from **POSIX.1-2017** (IEEE Std 1003.1-2017), Shell & Utilities volume,
Chapter 4. These are assumed to be present on the system and may be used freely without a
`command -v` guard.

- `awk`: pattern scanning and text processing
- `basename`: return non-directory portion of pathname
- `bc`: arbitrary precision calculator language
- `cat`: concatenate and print files
- `chgrp`: change file group ownership
- `chmod`: change file modes
- `chown`: change file ownership
- `cksum`: write file checksums and sizes
- `cmp`: compare two files byte-by-byte
- `comm`: select or reject lines common to two sorted files
- `command`: identify a command type
- `cp`: copy files
- `csplit`: split files based on context
- `cut`: extract fields/columns from lines
- `date`: print or set the system date and time
- `dd`: convert and copy a file
- `df`: report free disk space
- `diff`: compare files line by line
- `dirname`: return directory portion of pathname
- `du`: estimate file space usage
- `env`: set environment and execute a command
- `expand`: convert tabs to spaces
- `expr`: evaluate expressions (prefer `$(( ))` for arithmetic)
- `false`: return false value (exit 1)
- `file`: determine file type
- `find`: find files
- `fold`: fold long lines for finite width output
- `getconf`: get system configuration values
- `grep`: search file contents for patterns
- `head`: output first part of files
- `iconv`: codeset conversion
- `id`: print user and group IDs
- `join`: relational join of two sorted files
- `kill`: terminate or signal a process
- `link`: create a hard link to a file
- `ln`: link files
- `locale`: get locale-specific information
- `logger`: log messages to the system log
- `logname`: return the user's login name
- `ls`: list directory contents
- `mkdir`: make directories
- `mkfifo`: make FIFO special files (named pipes)
- `mktemp`: create a temporary file or directory (**not POSIX** — see notes below)
- `mv`: move files
- `nice`: invoke a utility with an altered nice value
- `nl`: line numbering filter
- `nohup`: invoke a utility immune to hangups
- `od`: dump files in various formats
- `paste`: merge corresponding lines of files
- `patch`: apply changes to files
- `pathchk`: check pathnames
- `printf`: format and print data
- `ps`: report process status
- `renice`: set nice values of running processes
- `rm`: remove directory entries
- `rmdir`: remove directories
- `sed`: stream editor
- `sh`: shell, the standard command language interpreter
- `sleep`: suspend execution for an interval
- `sort`: sort lines of text
- `split`: split files into pieces
- `strings`: find printable strings in files
- `stty`: set the options for a terminal
- `tail`: output last part of files
- `tee`: duplicate stdin to stdout and a file
- `touch`: change file access and modification times
- `tput`: terminal capability queries (colors, cursor)
- `tr`: translate or delete characters
- `true`: return true value (exit 0)
- `tsort`: topological sort
- `tty`: return user's terminal name
- `type`: check how a name would be interpreted
- `uname`: print system information
- `unexpand`: convert spaces to tabs
- `uniq`: report or filter out repeated lines
- `unlink`: call the unlink function
- `wc`: count lines, words, and bytes
- `xargs`: build and execute commands from stdin

**ALWAYS** verify non-standard utilities (not on the list above) before using:

```sh
command -v jq >/dev/null || die "jq is required but not found"
```

## Portability Notes

Utilities with common non-portable pitfalls:

### `date`

`+%s` (epoch seconds) is **not POSIX**. GNU uses `-d`, BSD uses `-j -f` for date parsing. Stick to
format strings like `+%Y-%m-%d` or `+%H:%M:%S`.

### `echo`

Behavior of `echo` varies across shells and platforms — backslash interpretation and `-n` flag
handling are not standardized. **Prefer `printf '%s\n'`** for reliable output:

```sh
# bad: may interpret escapes or not, depending on platform
echo "value is\t$val"

# good: consistent everywhere
printf 'value is\t%s\n' "$val"
```

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
