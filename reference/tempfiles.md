# Temp Files & Atomic Writes

Safe temporary file patterns for POSIX shell. `mktemp` is not in the POSIX standard but is
universally available on Linux, macOS, and BSDs.

## Create a Temp Directory

Prefer a temp directory over individual temp files — one `rm -rf` cleans everything:

```sh
TMPDIR=""

cleanup() {
	rc=$?
	[ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
	exit "$rc"
}
trap cleanup EXIT

TMPDIR="$(mktemp -d)" || die "failed to create temp dir"
```

All intermediate files go inside `$TMPDIR`:

```sh
tmpfile="${TMPDIR}/data.json"
curl -fsSL "$url" -o "$tmpfile" || die "download failed"
```

## Create a Single Temp File

When a directory is overkill:

```sh
tmpfile="$(mktemp)" || die "failed to create temp file"
trap 'rm -f "$tmpfile"' EXIT
```

## Atomic Writes

Never write directly to the final output path. A crash mid-write leaves a corrupt file:

```sh
# BAD: partial write on failure
generate_config > config.toml

# GOOD: atomic rename
generate_config > "${TMPDIR}/config.toml" || die "config generation failed"
mv "${TMPDIR}/config.toml" config.toml
```

`mv` within the same filesystem is atomic. If the target may be on a different filesystem, copy
then rename:

```sh
cp "${TMPDIR}/config.toml" "${target_dir}/.config.toml.tmp" \
	|| die "copy failed"
mv "${target_dir}/.config.toml.tmp" "${target_dir}/config.toml"
```

## Naming Conventions

Use descriptive names inside the temp dir — they aid debugging when things go wrong:

```sh
TMPDIR="$(mktemp -d)" || die "mktemp failed"

input_file="${TMPDIR}/input.csv"
transformed="${TMPDIR}/transformed.csv"
output_file="${TMPDIR}/output.json"
```

## Portable mktemp Flags

Only these flags are reliably portable across GNU and BSD `mktemp`:

| Flag | Meaning |
|------|---------|
| `-d` | Create a directory instead of a file |
| (none) | Create a file, print its path |

Avoid `-t template`, `-p dir`, `--suffix`, and `--tmpdir` — their behavior differs between GNU and
BSD. Use the default and build paths from there.
