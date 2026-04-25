#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

if ! command -v sui >/dev/null 2>&1; then
  echo "Sui CLI is not installed."
  echo "Install with: brew install sui"
  exit 1
fi

if ! sui client envs | grep -q "testnet"; then
  sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
fi

sui client switch --env testnet

echo "Active address:"
sui client active-address

echo "Publishing Move package from $ROOT_DIR/move ..."
cd "$ROOT_DIR"
sui client publish move/ --gas-budget 100000000

cat <<'EOF'

Copy the publish output values into .env.local:

NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<packageId>
NEXT_PUBLIC_SUI_ARENA_OBJECT_ID=0x<arenaObjectId>
SUI_ADMIN_CAP_ID=0x<adminCapId>
SUI_ADMIN_PRIVATE_KEY=<ed25519-private-key-bech32>

Then restart the Next.js dev server.
EOF
