## Shell Utilities

These are assumed to be present on the system and may be used freely:

- `basename`: return non-directory portion of pathname
- `cat`: concatenate and print files
- `cd`: change working directory
- `chgrp`: change file group ownership
- `chmod`: change file modes
- `chown`: change file ownership
- `cksum` / `sum`: write file checksums and sizes
- `cp`: copy files
- `date`: print or set the system date and time
- `dd`: convert and copy a file
- `df`: report free disk space
- `dirname`: return directory portion of pathname
- `du`: estimate file space usage
- `env`: set and inspect environment and execute commands
- `exec`: replace the current process with a command
- `export`: set environment variables for child processes
- `find`: find files
- `kill`: terminate or signal a process
- `ln`: link files
- `ls`: list directory contents
- `mkdir`: make directories
- `mktemp`: create a temporary file or directory
- `mv`: move files
- `printf`: format and print data
- `ps`: report process status
- `pwd`: return working directory name
- `read`: read a line from standard input
- `rm`: remove directory entries
- `rmdir`: remove directories
- `sh`: shell, the standard command language interpreter
- `sleep`: suspend execution for an interval
- `sort`: sort lines of text
- `test`: evaluate expression
- `touch`: change file access and modification times
- `trap`: catch signals and errors for cleanup
- `type`: check how a name would be interpreted
- `ulimit`: set or report file size limit
- `unset`: unset variables or functions
- `wait`: wait for background processes to finish

**ALWAYS** verify non-standard utilities (not on the list) before using:

```sh
if ! command -v jq > /dev/null; then
  echo "error: jq is required but not found" >&2
  exit 1
fi
```
