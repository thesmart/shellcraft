# bin/

Build tooling.

- **semver** — Built artifact. Single bundled script produced by `build.sh`. Git-ignored.
- **build.sh** — Build script. Bundles `src/` and `vendor/` code into a zip file for release.
- **install.sh** — Curl-pipe installer for end users to install the skill.

## File Headings for `./bin/*.sh`

All files in this folder shall use the following heading template:

```sh
#!/bin/sh
# Copyright (c) John Smart. Licensed under "PolyForm Internal Use License 1.0.0."
#
# <FILE_NAME>.sh — <SHORT_DESCRIPTION>
#
# Usage: bin/<FILE_NAME>.sh <COMMON_OPTIONS>
#
# <PARAGRAPH_DESCRIPTION>
```
