@AGENTS.md

## Claude Code Settings
Permissions and plugin config live in `.claude/settings.json` (tracked in git) so they apply on every machine. Claude Code defaults new session-granted permissions to `.claude/settings.local.json` — move non-sensitive ones into `settings.json` manually.

When suggesting a permission to add:
- **Non-sensitive** (e.g. `npm run:*`, `WebFetch(domain:...)`, MCP read tools): suggest adding to `settings.json`
- **Sensitive** (e.g. broad `Bash(**)`, destructive commands, `git push`, `rm`): suggest adding to `settings.local.json` only, and note that it won't be shared across machines
