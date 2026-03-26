# Imports

Shell scripts import libraries by sourcing them. Every source line should resolve paths relative to
`SCRIPT_DIR`:

```sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/path/to/lib.sh"
```

## Library vs. standalone scripts

The key question is: **will this script ever run outside the directory tree that contains its
dependencies?**

- **Library** — the script is part of a collection that ships together (e.g., build scripts, dev
  utilities, project automation). It runs from within the tree and sources shared dependencies
  directly. Inlining is never needed.
- **Standalone** — the script is installed to `$PATH`, copied to other machines, or run in
  environments where the dependency tree is not present (e.g., CI, remote execution, `curl | sh`).
  Inlining is used as a build step to produce a distributable, self-contained file.

During development, **always source** — even for scripts that will eventually be standalone. Inlined
code bloats diffs and wastes context. Inline only as a build step when producing a distributable
version.

## `@inline` directive

Tag a source line with `# @inline <key>` to mark it for inlining:

```sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "${SCRIPT_DIR}/path/to/lib.sh" # @inline mylib
```

Run the `inline` tool to replace the source line with the file contents:

```console
vendor/inline --target myscript --inline path/to/lib.sh --key mylib --overwrite
```

Inlining copies the contents of the sourced file verbatim into the target script, replacing the
source line. Inlining is not recursive — if the sourced file itself contains `@inline` directives,
those are not resolved.

### When to inline

- Producing a distributable version of a standalone script
- Script will run in environments where its dependencies are not available
- Script is copied into projects that don't carry the sourced library

### When NOT to inline

- During development (noisy diffs, wastes context)
- Library scripts (they always run from within the tree)
