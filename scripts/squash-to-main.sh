#!/usr/bin/env bash
# Fold everything on the local `dev` branch into ONE new commit on `main` (same files as dev's tip), so GitHub's
# contribution graph sees one commit per day instead of dozens. dev keeps its fine-grained history locally.
# Usage: scripts/squash-to-main.sh "Short summary of the day"      (then: git push origin main)
set -euo pipefail
cd "$(dirname "$0")/.."
msg="${1:-QUBLOX: daily progress $(date +%F)}"
tree=$(git rev-parse dev^{tree})
if [ "$tree" = "$(git rev-parse main^{tree})" ]; then echo "main already matches dev, nothing to squash"; exit 0; fi
commit=$(git commit-tree "$tree" -p main -m "$msg" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")
git update-ref refs/heads/main "$commit"
echo "main → $(git log -1 --format='%h %s' main)"
echo "Push it with:  git push origin main"
