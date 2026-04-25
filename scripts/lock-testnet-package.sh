#!/usr/bin/env bash
set -euo pipefail

PUBLISHED_FILE="move/Published.toml"
EXECUTE=0

for arg in "$@"; do
  case "$arg" in
    --execute)
      EXECUTE=1
      ;;
    *)
      PUBLISHED_FILE="$arg"
      ;;
  esac
done

if [[ ! -f "$PUBLISHED_FILE" ]]; then
  echo "Published metadata file not found: $PUBLISHED_FILE" >&2
  exit 1
fi

PACKAGE_ID=$(awk -F'"' '/published-at = / { print $2; exit }' "$PUBLISHED_FILE")
UPGRADE_CAP=$(awk -F'"' '/upgrade-capability = / { print $2; exit }' "$PUBLISHED_FILE")

if [[ -z "$PACKAGE_ID" || -z "$UPGRADE_CAP" ]]; then
  echo "Unable to read package ID or upgrade capability from $PUBLISHED_FILE" >&2
  exit 1
fi

echo "KIAI testnet package:"
echo "  package:     $PACKAGE_ID"
echo "  upgrade cap: $UPGRADE_CAP"
echo
echo "This will call:"
echo "  sui client call --package 0x2 --module package --function make_immutable --args $UPGRADE_CAP"
echo
echo "This is irreversible."

if [[ "$EXECUTE" -ne 1 ]]; then
  echo
  echo "Preview only. Re-run with --execute to submit the transaction."
  exit 0
fi

sui client call \
  --package 0x2 \
  --module package \
  --function make_immutable \
  --args "$UPGRADE_CAP"
