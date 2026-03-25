# Bashisms to Avoid

These constructs are **not POSIX** and will break on `dash`, `ash`, BusyBox, or any strict
`/bin/sh`.

| Bashism                 | POSIX Alternative                                    | Notes                               |
| ----------------------- | ---------------------------------------------------- | ----------------------------------- |
| `[[ expr ]]`            | `[ expr ]`                                           | Use `[ ]` with proper quoting       |
| `[[ $x =~ regex ]]`     | `echo "$x" \| grep -qE 'regex'`                      | Or use `case` for simple patterns   |
| `${var//pat/rep}`       | `echo "$var" \| sed 's/pat/rep/g'`                   | No global substitution in POSIX     |
| `${var^}` / `${var,,}`  | `echo "$var" \| tr '[:lower:]' '[:upper:]'`          | No case conversion in POSIX         |
| `${var:offset:len}`     | `echo "$var" \| cut -c$((offset+1))-$((offset+len))` | Or use `expr substr`                |
| `<<<word` (here-string) | `echo "word" \| cmd`                                 | Pipe instead                        |
| `array=(a b c)`         | Use positional params or newline-delimited strings   | No arrays in POSIX sh               |
| `${!var}` (indirect)    | `eval "echo \"\${$var}\""`                           | Use `eval` carefully                |
| `(( n++ ))`             | `n=$((n + 1))`                                       | Use `$(( ))` for arithmetic         |
| `set -o pipefail`       | Check each stage explicitly                          | Not in POSIX spec                   |
| `local var=val`         | `local var; var=val`                                 | Separate declaration and assignment |
| `function fname { }`    | `fname() { }`                                        | `function` keyword is not POSIX     |
| `source file`           | `. file`                                             | Use dot for sourcing                |
| `echo -e` / `echo -n`   | `printf '%s\n'` / `printf '%s'`                      | `echo` flags are non-portable       |
| `read -r -a arr`        | `read -r line`                                       | No `-a` in POSIX; split manually    |
| `select x in ...`       | Build menu with `while`/`read`                       | `select` is not POSIX               |
| `&>file`                | `>file 2>&1`                                         | Redirect stderr explicitly          |
| `<(cmd)` / `>(cmd)`     | Use temp files or pipes                              | No process substitution in POSIX    |
| `$RANDOM`               | `awk 'BEGIN{srand();print int(rand()*32768)}'`       | Not available in POSIX sh           |
| `$LINENO`               | Not reliably available                               | Don't depend on it                  |
| `trap cmd ERR`          | Check `$?` after commands                            | ERR trap is not POSIX               |
| `[ "$a" == "$b" ]`     | `[ "$a" = "$b" ]`                                    | `==` inside `[` is a bashism        |
| `test -a` / `test -o`  | `[ expr ] && [ expr ]` / `[ expr ] \|\| [ expr ]`   | `-a`/`-o` are obsolescent in POSIX  |
| `which cmd`             | `command -v cmd`                                     | `which` is not POSIX; unreliable    |
