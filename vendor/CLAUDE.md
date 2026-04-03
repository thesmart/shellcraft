# Vendor Code

Code in this folder is external and provided as-is.

Unless explicitly asked and confirmed by the user:

- **NEVER** modify any files in this directory.
- **NEVER** use the Read tool on files in this directory, that would waste context.

## Using getoptions

To learn how to use `getoptions-3.3.2.sh`, read
[`reference/getoptions.md`](../reference/getoptions.md) — do **not** read the vendor source
directly.

## Using Vendor Scripts

To understand how a vendor script works, run it with `--help`:

```sh
vendor/inline --help
vendor/semver --help
vendor/set-skill-version --help
```

This is the preferred way to learn a script's interface, flags, and usage without reading its
source.
