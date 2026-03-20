# Locked execution

Use an exclusive lock when only one script can run at a time:

```sh
# Exclusive scripts must share the same unique LOCKDIR
lockfile="${LOCKDIR:-/tmp/myscript.lock}"
acquire_lock() {
    if ! mkdir "$lockfile" 2>/dev/null; then
        die "already running (lock: $lockfile)"
    fi
    trap 'rmdir "$lockfile"' EXIT
}
acquire_lock
```

Or, use a blocking lock to wait until another script finishes:

```sh
# Exclusive scripts must share the same unique LOCKDIR
lockfile="${LOCKDIR:-/tmp/myscript.lock}"
acquire_lock() {
    while ! mkdir "$lockfile" 2>/dev/null; do
        warn "waiting for lock..."
        sleep 0.333
    done
    trap 'rmdir "$lockfile"' EXIT
}
acquire_lock
```
