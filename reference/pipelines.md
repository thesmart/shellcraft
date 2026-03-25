# Pipelines & Line Processing

POSIX pipeline patterns. The key constraint: `set -o pipefail` does not exist in POSIX `sh`, so
pipeline error handling requires explicit techniques.

## Reading Lines Safely

The canonical line-reading loop:

```sh
while IFS= read -r line; do
	printf '%s\n' "$line"
done < "$input_file"
```

- `IFS=` — preserves leading/trailing whitespace
- `-r` — prevents backslash interpretation

### Read from a command

```sh
cmd_output | while IFS= read -r line; do
	process "$line"
done
```

**Subshell warning**: the `while` loop runs in a subshell because it's on the right side of a pipe.
Variables set inside the loop are lost when it exits:

```sh
# BAD: count is always 0 after the loop
count=0
cat "$file" | while IFS= read -r line; do
	count=$((count + 1))
done
printf '%s\n' "$count"  # prints 0

# GOOD: redirect instead of pipe
count=0
while IFS= read -r line; do
	count=$((count + 1))
done < "$file"
printf '%s\n' "$count"  # prints actual count
```

### Read from a command without a pipe

Use a temp file to avoid the subshell problem:

```sh
some_command > "${TMPDIR}/output.txt" || die "command failed"
while IFS= read -r line; do
	process "$line"
done < "${TMPDIR}/output.txt"
```

## Pipeline Error Detection

Since `set -o pipefail` is not POSIX, check each stage explicitly.

### Check the producer

```sh
# BAD: silently ignores curl failure
curl -fsSL "$url" | grep 'pattern'

# GOOD: stage through temp file
curl -fsSL "$url" > "${TMPDIR}/data.txt" || die "download failed"
grep 'pattern' "${TMPDIR}/data.txt"
```

### Named pipes (FIFOs)

For streaming data without temp files:

```sh
fifo="${TMPDIR}/pipe"
mkfifo "$fifo" || die "mkfifo failed"

producer > "$fifo" &
consumer < "$fifo"
wait $!  # check producer exit status
```

## Field Splitting

Split delimited data without `read -a` (which is not POSIX):

```sh
# Split colon-delimited fields
while IFS=: read -r user _ uid gid _ home shell; do
	printf 'user=%s home=%s\n' "$user" "$home"
done < /etc/passwd
```

Use `cut` for extracting specific fields:

```sh
# Third field, comma-delimited
third=$(printf '%s' "$line" | cut -d, -f3)
```

## xargs as Pipeline Alternative

Process items in bulk without a loop:

```sh
# Run up to 4 parallel jobs
find "$dir" -name '*.txt' -print | xargs -P4 -I{} process_file {}
```

Note: `-P` (parallel) is not POSIX but is available on GNU and BSD `xargs`. The `-I{}` flag is
POSIX.

## Combining Filters

Chain standard filters for data transformation:

```sh
# Sort, deduplicate, count
sort "$file" | uniq -c | sort -rn

# Extract field, filter, format
cut -d: -f1,7 /etc/passwd | grep '/bin/sh$' | sort
```

## Newline-Terminated Streams

Always ensure data is newline-terminated. Many tools silently drop the last line if it lacks a
trailing newline:

```sh
# Ensure trailing newline when writing data
printf '%s\n' "$data"

# NOT: printf '%s' "$data"  (may lose last line in pipeline)
```
