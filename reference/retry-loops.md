# Retry loops

For commands that might fail transiently (network calls, lock contention):

```sh
retry() {
    max_attempts="$1"
    shift
    attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
        if "$@"; then
            return 0
        fi
        warn "attempt $attempt/$max_attempts failed: $*"
        attempt=$((attempt + 1))
        sleep 2
    done
    return 1
}

retry 3 curl -fsSL "$url" -o "$tmpfile" || die "download failed after 3 attempts"
```
