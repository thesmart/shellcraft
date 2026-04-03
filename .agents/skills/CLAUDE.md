# External Skills

These skills are external to this project. Read [skills-lock.json](../../skills-lock.json) for a
list of skills to use for developing this project's skill.

**NEVER** waste tokens reading the contents of `.agents/skills/**`

## Required Skills

Skills in `skills-lock.json` are **required**. At the start of each session:

1. Check the mod time of each skill folder: `stat .agents/skills/{skill-name}`
2. If any skill folder is **missing or older than 7 days**, delegate install/update to a sub-agent
   (see instructions below)

## Installing and Updating Skills

Always delegate skill installs and updates to a sub-agent. The sub-agent should:

**Prefer `npx`** when available. Run from the project root:

```console
npx skills add <package> --skill <skills> -y # add or replace a skill
npx skills update --all -y                   # update all skills to latest
npx skills experimental_install              # restore from skills-lock.json
```

If `npx` is unavailable, install manually by writing and running a shell script:

1. Read `skills-lock.json` and collect each skill's key (`{skill-name}`), `source` (`owner/repo`),
   and `sourceType`
2. Create `tmp=$(mktemp -d)` and write a POSIX sh install script to `$tmp/install.sh`. The script
   should, for each skill with `sourceType: "github"`:
   1. Download `https://github.com/{source}/archive/refs/heads/main.zip` into
      `$tmp/{skill-name}.zip`
   2. Unzip into `$tmp/{skill-name}/`
   3. If `$tmp/{skill-name}/{repo}-main/SKILL.md` exists (single-skill repo), move
      `$tmp/{skill-name}/{repo}-main` into `.agents/skills/{skill-name}`
   4. Otherwise (multi-skill repo), move `$tmp/{skill-name}/{repo}-main/skills/{skill-name}` into
      `.agents/skills/{skill-name}`
   5. Clean up `$tmp`
3. **Before running the script**, launch a sub-agent to review it for safety and malicious intent —
   do not proceed until the sub-agent confirms it is safe
4. Run the confirmed-safe script
