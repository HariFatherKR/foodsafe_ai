#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./loop.sh              # build mode, unlimited iterations
#   ./loop.sh 5            # build mode, max 5 iterations
#   ./loop.sh plan         # plan mode, unlimited iterations
#   ./loop.sh plan 2       # plan mode, max 2 iterations
#
# Environment overrides:
#   RALPH_CLI=claude
#   RALPH_CLI_MODEL=opus
#   RALPH_EXTRA_FLAGS="--dangerously-skip-permissions --output-format=stream-json --verbose"
#   RALPH_PUSH=1

if [[ "${1:-}" == "plan" ]]; then
  MODE="plan"
  PROMPT_FILE="PROMPT_plan.md"
  MAX_ITERATIONS="${2:-0}"
elif [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  MODE="build"
  PROMPT_FILE="PROMPT_build.md"
  MAX_ITERATIONS="$1"
else
  MODE="build"
  PROMPT_FILE="PROMPT_build.md"
  MAX_ITERATIONS=0
fi

RALPH_CLI="${RALPH_CLI:-claude}"
RALPH_CLI_MODEL="${RALPH_CLI_MODEL:-opus}"
RALPH_EXTRA_FLAGS="${RALPH_EXTRA_FLAGS:---dangerously-skip-permissions --output-format=stream-json --verbose}"
# Keep push opt-in for safer verification loops.
RALPH_PUSH="${RALPH_PUSH:-0}"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Missing prompt file: $PROMPT_FILE" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run loop.sh from inside a git repository." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
ITERATION=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   $MODE"
echo "Prompt: $PROMPT_FILE"
echo "CLI:    $RALPH_CLI"
echo "Model:  $RALPH_CLI_MODEL"
echo "Branch: $CURRENT_BRANCH"
echo "Push:   $RALPH_PUSH"
if [[ "$MAX_ITERATIONS" -gt 0 ]]; then
  echo "Max:    $MAX_ITERATIONS iterations"
else
  echo "Max:    unlimited"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -r -a EXTRA_FLAGS_ARR <<< "$RALPH_EXTRA_FLAGS"

while true; do
  if [[ "$MAX_ITERATIONS" -gt 0 && "$ITERATION" -ge "$MAX_ITERATIONS" ]]; then
    echo "Reached max iterations: $MAX_ITERATIONS"
    break
  fi

  cat "$PROMPT_FILE" | "$RALPH_CLI" -p --model "$RALPH_CLI_MODEL" "${EXTRA_FLAGS_ARR[@]}"

  if [[ "$RALPH_PUSH" == "1" ]]; then
    git push origin "$CURRENT_BRANCH" || git push -u origin "$CURRENT_BRANCH"
  else
    echo "Push skipped (RALPH_PUSH=$RALPH_PUSH)"
  fi

  ITERATION=$((ITERATION + 1))
  echo
  echo "======================== LOOP $ITERATION ========================"
  echo
done
