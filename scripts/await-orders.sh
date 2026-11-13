#!/usr/bin/env bash
# Blocks until the files an agent listens to change, then exits.
#   scripts/await-orders.sh codex    # waits on comms/inbox/codex.md
#   scripts/await-orders.sh gemini   # waits on comms/inbox/gemini.md
#   scripts/await-orders.sh claude   # waits on comms/log/codex.md + comms/log/gemini.md
# Exit 0 + "CHANGED: <file>" when something changed.
# Exit 0 + "STILL_WAITING" after the timeout (default 1200s). Just run it again.
# Optional: AWAIT_TIMEOUT=600 AWAIT_INTERVAL=15 scripts/await-orders.sh codex
set -euo pipefail
cd "$(dirname "$0")/.."

who="${1:-}"
case "$who" in
  codex)  files=(comms/inbox/codex.md) ;;
  gemini) files=(comms/inbox/gemini.md) ;;
  claude) files=(comms/log/codex.md comms/log/gemini.md) ;;
  *) echo "usage: $0 codex|gemini|claude" >&2; exit 64 ;;
esac

timeout="${AWAIT_TIMEOUT:-1200}"
interval="${AWAIT_INTERVAL:-15}"

hash_of() { if [ -f "$1" ]; then shasum "$1" | cut -d' ' -f1; else echo missing; fi; }

declare -a before=()
for f in "${files[@]}"; do before+=("$(hash_of "$f")"); done

waited=0
echo "Waiting for changes to: ${files[*]} (every ${interval}s, up to ${timeout}s)"
while [ "$waited" -lt "$timeout" ]; do
  sleep "$interval"
  waited=$((waited + interval))
  for i in "${!files[@]}"; do
    if [ "$(hash_of "${files[$i]}")" != "${before[$i]}" ]; then
      echo "CHANGED: ${files[$i]}"
      head -n 3 "${files[$i]}" 2>/dev/null | grep -m1 '^CONTROL:' || true
      exit 0
    fi
  done
done
echo "STILL_WAITING"
