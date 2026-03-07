#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build order: general first, then verticals.
TARGETS=(
  "general"
  "active"
  "passport"
  "gov"
  "learning"
  "tourism"
  "performance"
  "creator-events"
)

SUCCESS=()
FAILED=()

echo "== Foremoz Paper Build All =="
echo "Root: $ROOT_DIR"
echo

for target in "${TARGETS[@]}"; do
  script="$ROOT_DIR/$target/build.sh"
  if [[ ! -f "$script" ]]; then
    echo "[SKIP] $target (build.sh not found)"
    continue
  fi

  echo "[RUN ] $target"
  if bash "$script"; then
    echo "[ OK ] $target"
    SUCCESS+=("$target")
  else
    echo "[FAIL] $target"
    FAILED+=("$target")
  fi
  echo
done

echo "== Summary =="
echo "Success: ${#SUCCESS[@]}"
for item in "${SUCCESS[@]}"; do
  echo "  - $item"
done

echo "Failed: ${#FAILED[@]}"
for item in "${FAILED[@]}"; do
  echo "  - $item"
done

if [[ "${#FAILED[@]}" -gt 0 ]]; then
  exit 1
fi
