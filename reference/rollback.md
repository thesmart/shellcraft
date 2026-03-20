# Rollback / undo on failure

For scripts that make multiple changes that should be all-or-nothing:

```sh
rollback_steps=""

add_rollback() {
    rollback_steps="$1
$rollback_steps"
}

rollback() {
    printf '%s\n' "rolling back..."
    printf '%s\n' "$rollback_steps" | while IFS= read -r cmd; do
        [ -n "$cmd" ] && eval "$cmd"
    done
}
trap rollback EXIT

cp config.toml config.toml.bak || die "backup failed"
add_rollback 'mv config.toml.bak config.toml'

apply_new_config || die "config apply failed"
add_rollback 'systemctl restart myapp'

# If we get here, everything worked. Clear the rollback.
rollback_steps=""
trap - EXIT
```
