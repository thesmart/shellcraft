# Capturing stderr while checking status

Sometimes you need the error message from a failing command:

```sh
if ! err=$(some_command 2>&1); then
    die "some_command failed: $err"
fi
```

This captures both stdout and stderr into `$err` and lets you include the actual error output in
your die message. If you only want stderr, redirect stdout separately:

```sh
if ! err=$(some_command 2>&1 >/dev/null); then
    die "some_command failed: $err"
fi
```
