# Input Validation

Common POSIX-safe validation patterns. Use these for arguments not covered by getoptions
validators.

## Non-empty

```sh
[ -n "$var" ] || die "var must not be empty"
```

## File Exists

```sh
[ -f "$path" ] || die "file not found: $path"
[ -r "$path" ] || die "file not readable: $path"
```

## Directory Exists

```sh
[ -d "$dir" ] || die "directory not found: $dir"
[ -w "$dir" ] || die "directory not writable: $dir"
```

## Is a Number

```sh
case "$val" in
	''|*[!0-9]*) die "not a number: $val" ;;
esac
```

With negative numbers:

```sh
case "$val" in
	-[0-9]*|[0-9]*) ;; # ok
	*) die "not a number: $val" ;;
esac
```

## Value in Set

```sh
case "$mode" in
	start|stop|restart) ;; # ok
	*) die "invalid mode: $mode (expected start|stop|restart)" ;;
esac
```

## Safe Defaults

```sh
output_dir="${OUTPUT_DIR:-./out}"
max_retries="${MAX_RETRIES:-3}"
```

## Writable Output Path

```sh
output_dir="$(dirname "$output_file")"
[ -d "$output_dir" ] || mkdir -p "$output_dir" || die "cannot create: $output_dir"
[ -w "$output_dir" ] || die "not writable: $output_dir"
```

## Command Available

```sh
command -v jq >/dev/null || die "jq is required but not found"
```
