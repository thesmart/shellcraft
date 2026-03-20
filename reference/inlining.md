# Sourcing & Inlining

Shell scripts can source libs and label them to be inlined:

```sh
# filename: myscript
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/path/to/getoptions.sh" # @inline getoptions
```

Replace the source line:

```console
inline --target myscript --inline path/to/getoptions.sh --key getoptions --overwrite
```

## When to inline

- Single-file distribution (i.e. must be self-contained)
- CI or remote execution where `vendor/` is not present

## When NOT to inline

- During development (noisy diffs, wastes context)
- Scripts that are not distributed standalone
