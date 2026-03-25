# Strings & Pattern Matching

POSIX parameter expansion, string comparison, and regex patterns. These are built into `sh` — no
external commands needed for basic string work.

## Parameter Expansion

| Syntax | Meaning | Example |
|--------|---------|---------|
| `${var:-default}` | Use `default` if `var` is unset or empty | `port="${PORT:-8080}"` |
| `${var:=default}` | Assign `default` if `var` is unset or empty | `${CACHE_DIR:=/tmp/cache}` |
| `${var:+alternate}` | Use `alternate` if `var` is set and non-empty | `${VERBOSE:+--verbose}` |
| `${var:?message}` | Exit with `message` if `var` is unset or empty | `${1:?usage: cmd <arg>}` |
| `${#var}` | Length of `var` in characters | `[ "${#name}" -le 64 ]` |

### Stripping Prefixes and Suffixes

| Syntax | Meaning | Example |
|--------|---------|---------|
| `${var#pattern}` | Remove shortest prefix match | `${path#*/}` → `bar/baz` |
| `${var##pattern}` | Remove longest prefix match | `${path##*/}` → `baz` (basename) |
| `${var%pattern}` | Remove shortest suffix match | `${file%.tar.gz}` → `data` |
| `${var%%pattern}` | Remove longest suffix match | `${path%%/*}` → first component |

Common idioms:

```sh
# Extract filename from path (like basename)
filename="${path##*/}"

# Extract directory from path (like dirname)
dir="${path%/*}"

# Strip file extension
stem="${file%.*}"

# Get file extension
ext="${file##*.}"
```

## String Comparison

Use `=` inside `[ ]`. The `==` operator is a bashism:

```sh
# GOOD
[ "$var" = "value" ]

# BAD (bashism)
[ "$var" == "value" ]
```

Always quote both sides to prevent word splitting and glob expansion:

```sh
# GOOD
[ "$a" = "$b" ]

# BAD: breaks if $a is empty or contains spaces
[ $a = $b ]
```

### Inequality and ordering

```sh
[ "$a" != "$b" ]          # not equal
[ "$a" \< "$b" ]          # string less-than (locale-dependent)
```

## case Pattern Matching

`case` is the POSIX alternative to `[[ ]]` pattern matching. It uses glob patterns, not regex:

```sh
case "$input" in
	*.tar.gz|*.tgz)  decompress_targz "$input" ;;
	*.zip)           decompress_zip "$input" ;;
	*.txt)           process_text "$input" ;;
	*)               die "unsupported format: $input" ;;
esac
```

### Common case patterns

```sh
# Boolean-like flags
case "$confirm" in
	[Yy]|[Yy][Ee][Ss]) confirmed=1 ;;
	*) confirmed="" ;;
esac

# Check if string starts/ends with substring
case "$url" in
	https://*) ;; # ok
	*) die "url must start with https://" ;;
esac

# Check if string contains substring
case "$haystack" in
	*needle*) printf 'found\n' ;;
esac
```

## Regex: BRE vs ERE

POSIX defines two regex dialects. Know which tools use which:

| Dialect | Tools | Syntax |
|---------|-------|--------|
| **BRE** (Basic) | `grep`, `sed`, `expr` | `\(group\)`, `\{n\}`, `\+` not standard |
| **ERE** (Extended) | `grep -E`, `sed -E`, `awk` | `(group)`, `{n}`, `+`, `?`, `\|` |

Key BRE gotchas:

```sh
# BRE: escape parens and braces
grep 'error\(s\)\{0,1\}' "$file"

# ERE: plain parens and braces
grep -E 'errors?' "$file"

# BRE has NO + or ? — use {1,} and {0,1}
grep 'x\{1,\}' "$file"     # one or more x

# ERE equivalent
grep -E 'x+' "$file"
```

Prefer `grep -E` (ERE) for readability. Both are POSIX.

### sed regex

```sh
# BRE (default)
sed 's/old_\(pattern\)/new_\1/' "$file"

# ERE (with -E, POSIX.1-2024 but widely supported since ~2010)
sed -E 's/old_(pattern)/new_\1/' "$file"
```

Note: `sed -E` was formally added in POSIX.1-2024 but has been portable in practice across GNU sed,
BSD sed, and busybox sed for over a decade.

## Concatenation & Building Strings

No special operators needed — juxtapose variables and literals:

```sh
greeting="Hello, ${name}!"
path="${dir}/${filename}"
csv_line="${field1},${field2},${field3}"
```

### Accumulating into a variable

```sh
result=""
for item in "$@"; do
	result="${result}${result:+,}${item}"
done
# result = "a,b,c" (no leading comma)
```

The `${result:+,}` idiom inserts a comma only when `result` is non-empty.

## Here-Documents

Multi-line text generation without `echo -e` or escape sequences:

```sh
cat <<EOF
Usage: ${prog_name} [options] <file>

Options:
  -v, --verbose   Enable verbose output
  -h, --help      Show this help
EOF
```

Use `<<'EOF'` (quoted delimiter) to suppress variable expansion:

```sh
cat <<'EOF'
This $variable is printed literally.
No expansion happens here.
EOF
```

Indent with `<<-EOF` and tabs (not spaces) for readability inside functions:

```sh
usage() {
	cat <<-EOF
		Usage: ${0##*/} [options]
		  -h  Show help
	EOF
}
```
