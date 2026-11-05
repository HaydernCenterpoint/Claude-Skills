#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$HOME/.claude/skills" "$HOME/.agents/skills" "$HOME/.claude/agents"

echo "Installing primary Claude skills to ~/.claude/skills ..."
cp -R "$REPO_ROOT/skills/"* "$HOME/.claude/skills/"

if [ -d "$REPO_ROOT/agents-skills" ]; then
  echo "Installing extra agent skills to ~/.agents/skills ..."
  cp -R "$REPO_ROOT/agents-skills/"* "$HOME/.agents/skills/"
fi

if [ -d "$REPO_ROOT/agents" ]; then
  echo "Installing custom agent definitions to ~/.claude/agents ..."
  cp -R "$REPO_ROOT/agents/"* "$HOME/.claude/agents/"
fi

echo "Done! All skills installed."
