# Claude-Skills

Complete backup and portable export of personal Claude Code, Claude Desktop, and Agent skills (`639` skills across `19,068` clean files, plus `2` custom agent definitions).

## Repository Layout

| Directory | Count | Source |
|---|---:|---|
| `skills/` | 562 | Primary skills from `~/.claude/skills` (all symlinks dereferenced, `node_modules`/`__pycache__` stripped) |
| `agents-skills/` | 28 | Additional skills from `~/.agents/skills` and `~/.codex/skills` |
| `plugin-skills/` | 49 | Installed plugin skill packs (`adobe-for-creativity`, `canva`, `discord`, `remotion`, `desktop-builtin`) |
| `agents/` | 2 | Custom agent definitions from `~/.claude/agents` |
| `SKILL_INDEX.md` | — | Searchable catalog of all 639 skills |
| `skills-manifest.json` | — | Machine-readable manifest with file counts and byte sizes |

## Quick Restore / Install

### Windows (PowerShell)

```powershell
.\install-skills.ps1
```

### macOS / Linux (Bash)

```bash
chmod +x install-skills.sh
./install-skills.sh
```

> Note: Skills that bundle Node.js helper tools (`claude-animation-base`, `directing-stickman-videos`, `mg-styles-15`) exclude `node_modules/` — run `npm install` inside those skill folders if needed.
