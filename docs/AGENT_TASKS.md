# KIAI — Phase Status And Remaining Tasks

> Read first: [audit.md](audit.md) · [project-summary.md](project-summary.md) · [engineering-task-sheet.md](engineering-task-sheet.md) · [../AGENTS.md](../AGENTS.md)

Work in Phase order. Phase 1 requires no GCP, no Google account, no cloud setup — pure localhost + Sui testnet. Phase 2 adds live Google OAuth credentials for browser verification of zkLogin.

---

## Phase 1 Status

Phase 1 is complete in code and verified on Sui Testnet.

### Deployed Testnet IDs

- `packageId`: `0x6ee68a1d8f06564d0625f0c4460f6801207529de93a77a91d4c4efb9b809f976`
- `arenaObjectId`: `0x9936a83051ac1610335a6ed6277a791e07fb27150027da4f65c6c06eca3e9713`
- `adminCapId`: `0x21906cf3511e7e81c6a762ec07a046e64e9f2545ed8497829c50d7a0cdf74f15`

### Verified End-To-End

- Admin scenario creation through `POST /api/scenarios` writes to the shared on-chain `Arena`
- Badge claim works on-chain
- Energy claim works on-chain
- Insight allocation works on-chain
- Admin settlement works on-chain
- `GET /api/profile`, `GET /api/scenarios`, and `GET /api/leaderboard` reflect the on-chain shared object state
- Sponsored transaction backend is live and configured
- zkLogin proof/signature assembly path is implemented in code

### Only External Gap For Full Browser Proof

Live Google zkLogin browser verification still needs real OAuth credentials:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Without those two values, the zkLogin code path exists and compiles, but the Google redirect cannot be exercised manually.

---

## What Is Already Complete — Do Not Touch

| File | Status |
|------|--------|
| `move/sources/arena.move` | Complete — 8 entry functions, all structs, events |
| `move/Move.toml` | Complete — targets testnet framework |
| `lib/sui/transactions.ts` | Complete — all 6 transaction builders |
| `lib/sui/read-model.ts` | Complete — `getChainProfile`, `listChainScenarios`, `getChainLeaderboard` |
| `lib/sui/verification.ts` | Complete — `verifyConfirmedTransaction` with sender check |
| `app/api/sponsor/route.ts` | Complete — real sponsored tx using admin keypair |
| `app/api/auth/zklogin/route.ts` | Complete — salt + proof fetch, deterministic local salt fallback |
| `app/api/claims/badge/route.ts` | Complete — optional txDigest verified before local sync |
| `app/api/claims/energy/route.ts` | Complete — optional txDigest verified before local sync |
| `app/api/scenarios/[id]/allocate/route.ts` | Complete — optional txDigest verified |
| `app/api/scenarios/[id]/settle/route.ts` | Complete — on-chain if admin env set + local |
| `app/api/scenarios/[id]/state/route.ts` | Complete — on-chain if admin env set + local |
| `app/api/scenarios/route.ts` | Complete — GET prefers chain, POST creates on-chain + local |
| `app/api/profile/[address]/route.ts` | Complete — chain profile → local fallback |
| `app/api/leaderboard/route.ts` | Complete — chain leaderboard → local fallback |
| `app/auth/callback/page.tsx` | Complete — OAuth callback, calls `completeZkLogin`, redirects home |
| `hooks/use-zklogin.ts` | Complete — `initiateGoogleLogin`, `completeZkLogin`, session management |
| `hooks/use-kiai-address.ts` | Complete — reads zkLogin session address + standard wallet |
| `components/nbg/wallet-button.tsx` | Complete — Google login button, zkLogin session display, disconnect |
| `.env.example` | Complete — all vars documented |
| Orphaned SPA components (5 files) | Complete — all deleted |

---

# PHASE 1 — Localhost Testing, No GCP Required

Standard wallet connect + sponsored txns + all on-chain operations work without any Google/GCP setup.

---

## Phase 1 Runtime Notes

- The current codebase uses the correct Sui v2 `SuiClient` path and waits for transaction confirmation.
- `.env.local` is populated locally with the deployed package/object/admin-cap IDs and admin private key.
- If the dev server is restarted, Phase 1 should continue to work without additional setup.
- The items below are preserved as historical implementation notes. They are no longer open blockers if the code matches the current repo.

---

## P1-BUG-1 — `server.ts` Wrong Sui SDK Import (Blocks Everything)

**File:** `lib/sui/server.ts`

`SuiJsonRpcClient` does not exist in `@mysten/sui` v2. `client.core.waitForTransaction` does not exist. Both will throw at runtime the moment any admin or sponsor route is hit.

**Replace the entire file with:**

```typescript
import "server-only"

import { SuiClient } from "@mysten/sui/client"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import type { Transaction } from "@mysten/sui/transactions"

import { getActiveSuiRpcUrl, isSuiWriteConfigured } from "@/lib/sui/config"

const adminCapId = process.env.SUI_ADMIN_CAP_ID ?? ""
const adminPrivateKey = process.env.SUI_ADMIN_PRIVATE_KEY ?? ""

let clientSingleton: SuiClient | null = null
let adminKeypairSingleton: Ed25519Keypair | null = null

export function isSuiAdminWriteConfigured() {
  return isSuiWriteConfigured() && Boolean(adminCapId && adminPrivateKey)
}

export function getAdminCapId() {
  if (!adminCapId) throw new Error("SUI_ADMIN_CAP_ID is not configured")
  return adminCapId
}

export function getSuiClient() {
  clientSingleton ??= new SuiClient({ url: getActiveSuiRpcUrl() })
  return clientSingleton
}

export function getAdminKeypair() {
  if (!adminPrivateKey) throw new Error("SUI_ADMIN_PRIVATE_KEY is not configured")
  adminKeypairSingleton ??= Ed25519Keypair.fromSecretKey(adminPrivateKey)
  return adminKeypairSingleton
}

export async function executeAdminTransaction(transaction: Transaction) {
  const client = getSuiClient()
  const signer = getAdminKeypair()
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction,
    options: { showEffects: true },
  })

  const status = result.effects?.status.status
  if (status && status !== "success") {
    throw new Error(result.effects?.status.error ?? "Sui admin transaction failed")
  }

  await client.waitForTransaction({ digest: result.digest })
  return result
}
```

**Verify after:** `npm run build` — must pass 0 errors.

**Reference — correct SuiClient API:** https://sdk.mystenlabs.com/sui

---

## P1-TASK-1 — Deploy Move Package to Testnet

Manual step. Nothing else works until this is done.

**Install Sui CLI:**
```bash
# macOS
brew install sui

# Verify
sui --version
```

**Configure testnet and get gas:**
```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
sui client active-address     # note this address
sui client faucet             # get testnet SUI gas
sui client balance            # verify balance > 0
```

**Build and verify Move compiles:**
```bash
sui move build --path move/
```

**Publish:**
```bash
sui client publish move/ --network testnet --gas-budget 100000000
```

**From the publish output, capture:**
- `packageId` — listed under `Published Objects`, type `Package`
- `arenaObjectId` — listed under `Created Objects`, type `kiai::arena::Arena`  
- `adminCapId` — listed under `Created Objects`, type `kiai::arena::AdminCap`
- The publishing wallet's private key

**Export private key from Sui CLI:**
```bash
sui keytool export --key-identity <your-address>
```

**Create `.env.local`** (this file is gitignored, never commit it):
```bash
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=0x<packageId>
NEXT_PUBLIC_SUI_ARENA_OBJECT_ID=0x<arenaObjectId>
NEXT_PUBLIC_SPONSORED_TX_ENDPOINT=/api/sponsor
SUI_ADMIN_CAP_ID=0x<adminCapId>
SUI_ADMIN_PRIVATE_KEY=<bech32-or-hex-private-key>
```

Leave these blank for Phase 1 (zkLogin skipped):
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Verify on testnet explorer:** https://testnet.suivision.xyz/

**Reference:** https://docs.sui.io/references/cli/client#sui-client-publish

---

## P1-TASK-2 — Verify `chainScenarioId` Wired Through Store

**Files to check:** `lib/kiai/types.ts`, `lib/kiai/store.ts`

`app/api/scenarios/route.ts` POST calls:
```typescript
getKiaiStore().createScenario({
  ...input,
  id: scenarioId,
  chainScenarioId,
  openAt: openAt.toISOString(),
  lockAt: lockAt.toISOString(),
  settleBy: settleBy.toISOString(),
  state,
})
```

The original `store.ts` `createScenario` did not accept `id`, `chainScenarioId`, `openAt`, `lockAt`, `settleBy`, or `state`. If the store hasn't been updated, TypeScript will error on the excess properties and the route will silently ignore them — meaning `chainScenarioId` never persists, breaking all on-chain scenario wiring.

**Check `lib/kiai/types.ts`:** `KiaiScenario` must have:
```typescript
chainScenarioId?: string
```

**Check `lib/kiai/store.ts` `createScenario` input type:** Must accept:
```typescript
{
  eventId: string
  title: string
  prompt: string
  fighterAName: string
  fighterACountry: string
  fighterBName: string
  fighterBCountry: string
  round: number
  opensInSeconds?: number
  lockInSeconds?: number
  // These must be accepted:
  id?: string
  chainScenarioId?: string
  openAt?: string
  lockAt?: string
  settleBy?: string
  state?: ScenarioState
}
```

And the function body must use those values when provided instead of computing fresh ones.

If missing, add them. Run `npm run build` to confirm no TypeScript errors.

---

## P1-TASK-3 — End-to-End Localhost Test (Standard Wallet)

After P1-BUG-1 and P1-TASK-1 are done:

```bash
npm run dev
```

Open http://localhost:3000 and verify in order:

1. **Wallet connect** — click "Connect Wallet", pick an installed Sui wallet (Sui Wallet, Slush, etc.), connect → header shows address
2. **Get testnet gas for user wallet** — send testnet SUI from admin wallet to connected wallet, or use https://faucet.testnet.sui.io/
3. **Claim badge** — go to `/predictions`, claim badge → toast shows tx signed → verify digest on https://testnet.suivision.xyz/
4. **Claim energy** — claim energy → same
5. **Allocate insight** — allocate on an open scenario → verify tx on explorer
6. **Admin flow** — go to `/admin`, create scenario → verify on explorer
7. **Sponsored flow** — if `.env.local` has `NEXT_PUBLIC_SPONSORED_TX_ENDPOINT=/api/sponsor` and admin key configured, badge/energy claim should use sponsored tx (user pays NO gas) — verify in toast message and on explorer that gas owner is the admin address

---

# PHASE 2 — zkLogin (Google OAuth)

Do Phase 1 completely first. Only start Phase 2 when standard wallet flow works end-to-end.

**What you need before starting Phase 2:**
- A Google account
- Access to Google Cloud Console: https://console.cloud.google.com/apis/credentials
- 5 minutes to create an OAuth 2.0 client ID

**GCP setup is NOT optional for zkLogin.** You need a real Google Client ID to get a JWT. However, you do NOT need to deploy to production — localhost works fine.

---

## P2-SETUP — Create Google OAuth App (One-Time)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create project (or use existing)
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: **Web application**
5. Add **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
6. Add **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   ```
7. Click Create → copy the **Client ID**
8. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
   ```

No client secret needed for the frontend OAuth flow. `GOOGLE_CLIENT_SECRET` can stay empty for now.

Restart `npm run dev` after adding the env var.

**Important:** Mysten's hosted salt service (`https://salt.api.mystenlabs.com/get_salt`) only accepts **whitelisted** Google Client IDs. The codebase already has a deterministic local SHA256 salt fallback that activates automatically when the hosted service rejects the token. This means zkLogin will work on localhost without any whitelist approval — the local salt is used instead.

---

## P2-BUG-1 — Ephemeral Keypair Lost After Login

**File:** `hooks/use-zklogin.ts`

`completeZkLogin` deletes `PENDING_STORAGE_KEY` (which holds the ephemeral secret key) immediately after login. Signing transactions later is impossible without it.

**Update `ZkLoginSession` type** (add one field):
```typescript
export type ZkLoginSession = {
  address: string
  jwt: string
  salt: string
  proof: unknown
  maxEpoch: number
  ephemeralSecretKey: string   // ADD THIS
}
```

**Update `completeZkLogin`** — add the field to `nextSession`:
```typescript
const nextSession: ZkLoginSession = {
  address: payload.address ?? jwtToAddress(jwt, payload.salt, false),
  jwt,
  salt: payload.salt,
  proof: payload.proof,
  maxEpoch: pending.maxEpoch,
  ephemeralSecretKey: pending.ephemeralSecretKey,  // ADD THIS
}
```

That is the entire fix. The `removeItem(PENDING_STORAGE_KEY)` call after this is fine — ephemeral key is now in the session.

---

## P2-BUG-2 — zkLogin Users Cannot Sign On-Chain Transactions

**File:** `hooks/use-kiai-chain-actions.ts`

`chainReady` checks `Boolean(currentAccount?.address)` — zkLogin users have no `currentAccount` (dapp-kit doesn't know about them). They always fall to the local-only path.

Add these imports at the top of the file:
```typescript
import { useZkLogin } from "@/hooks/use-zklogin"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { getZkLoginSignature } from "@mysten/sui/zklogin"
import type { ZkLoginSession } from "@/hooks/use-zklogin"
```

Inside `useKiaiChainActions`, add zkLogin session read and replace `chainReady` + `executeTransaction`:

```typescript
const { session: zkLoginSession } = useZkLogin()
const effectiveAddress = currentAccount?.address ?? zkLoginSession?.address
const chainReady = isSuiWriteConfigured() && Boolean(effectiveAddress)

async function executeZkLoginTransaction(transaction: Transaction, zkSession: ZkLoginSession) {
  const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(zkSession.ephemeralSecretKey)
  transaction.setSender(zkSession.address)

  if (sponsorEndpoint) {
    // Sponsored path — zero gas for user
    const transactionKindBytes = toBase64(
      await transaction.build({ client, onlyTransactionKind: true })
    )
    const sponsorRes = await fetch(sponsorEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: zkSession.address, transactionKindBytes }),
    })

    if (sponsorRes.ok) {
      const { sponsoredTransaction, sponsorSignature } = await sponsorRes.json() as {
        sponsoredTransaction: string
        sponsorSignature: string
      }
      const txBytes = await Transaction.from(sponsoredTransaction).build({ client })
      const { signature: ephemeralSig } = await ephemeralKeyPair.signTransaction(txBytes)
      const zkSig = getZkLoginSignature({
        inputs: zkSession.proof as Parameters<typeof getZkLoginSignature>[0]["inputs"],
        maxEpoch: zkSession.maxEpoch,
        userSignature: ephemeralSig,
      })
      return client.executeTransactionBlock({
        transactionBlock: toBase64(txBytes),
        signature: [zkSig, sponsorSignature],
        options: { showEffects: true },
      })
    }
    // 503 = sponsor unconfigured → fall through to self-pay
  }

  // Non-sponsored — zkLogin address must have testnet SUI for gas
  const txBytes = await transaction.build({ client })
  const { signature: ephemeralSig } = await ephemeralKeyPair.signTransaction(txBytes)
  const zkSig = getZkLoginSignature({
    inputs: zkSession.proof as Parameters<typeof getZkLoginSignature>[0]["inputs"],
    maxEpoch: zkSession.maxEpoch,
    userSignature: ephemeralSig,
  })
  return client.executeTransactionBlock({
    transactionBlock: toBase64(txBytes),
    signature: [zkSig],
    options: { showEffects: true },
  })
}

async function executeTransaction(transaction: Transaction) {
  if (!effectiveAddress) throw new Error("A connected wallet or zkLogin session is required")

  // zkLogin path
  if (!currentAccount?.address && zkLoginSession) {
    return executeZkLoginTransaction(transaction, zkLoginSession)
  }

  // Standard wallet — sponsored path
  if (sponsorEndpoint) {
    const transactionKindBytes = toBase64(
      await transaction.build({ client, onlyTransactionKind: true })
    )
    const response = await fetch(sponsorEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: currentAccount!.address, transactionKindBytes }),
    })

    if (!response.ok) {
      if (response.status === 503) {
        return signAndExecuteTransaction.mutateAsync({ transaction })
      }
      throw new Error((await response.text()) || "Unable to sponsor transaction")
    }

    const payload = await response.json() as {
      sponsoredTransaction: string
      sponsorSignature: string
    }
    const signed = await signTransaction.mutateAsync({ transaction: payload.sponsoredTransaction })
    return client.executeTransactionBlock({
      transactionBlock: signed.bytes,
      signature: [signed.signature, payload.sponsorSignature],
      options: { showEffects: true },
    })
  }

  // Standard wallet — direct
  return signAndExecuteTransaction.mutateAsync({ transaction })
}
```

Also update `claimBadge`, `claimEnergy`, `allocateInsight` mutation functions to use `effectiveAddress` instead of `address` where passing to API:
```typescript
// Replace: kiaiApi.claimBadge(address)
// With:    kiaiApi.claimBadge(effectiveAddress ?? address)
```

**Reference — zkLogin signature assembly:**
https://docs.sui.io/guides/developer/cryptography/zklogin-integration#assemble-the-zklogin-signature

---

## P2-TASK-1 — End-to-End zkLogin Test

After P2-SETUP, P2-BUG-1, P2-BUG-2:

1. Open http://localhost:3000
2. Click "Connect Wallet" → "Continue with Google" (only visible when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set)
3. Complete Google OAuth
4. `/auth/callback` page shows "Requesting salt and proof..."
5. Redirects to `/` — header shows zkLogin address (derived from Google sub + salt)
6. Claim badge — signs with ephemeral keypair + zkLogin signature — check toast says "sponsored" or "signed onchain"
7. Verify tx on https://testnet.suivision.xyz/ — sender should be the zkLogin address
8. Claim energy — same
9. Allocate insight — same

**Note on the prover service:** The codebase uses `https://prover.mystenlabs.com/v1` for testnet. This is the hosted Mysten prover. It is rate-limited and may reject during hackathon if the client ID is not whitelisted. If it fails, run local prover via Docker (see below).

**Optional — local prover (Docker, needs 16 cores + 16GB RAM):**
```bash
# Download zkey file (testnet)
wget -O - https://raw.githubusercontent.com/sui-foundation/zklogin-ceremony-contributions/main/download-test-zkey.sh | bash

# Run prover locally
ZKEY=./zkLogin.zkey PROVER_PORT=8080 docker compose up

# Test it works
curl http://localhost:8080/ping   # should return: pong

# Add to .env.local
SUI_ZKLOGIN_PROVER_URL=http://localhost:8080/v1
```

---

## Remaining Known Gaps (Acceptable for Hackathon)

| Gap | Impact | Fix needed? |
|-----|--------|------------|
| Marketplace state local-only | Can't buy rewards on-chain | No |
| Full arena object scan for reads | Slow at scale | No — fine for demo |
| No epoch expiry refresh for zkLogin sessions | Session dies after `maxEpoch` epochs | No — sessions last ~40min |
| Admin key in env = single point of control | Not production-safe | No |
| Mysten prover may rate-limit | zkLogin proof fails | Run local prover if hit |
| Hosted salt service whitelist | Falls back to local salt automatically | No action needed |

---

## Build Verification After All Fixes

```bash
npm run build    # must show 0 errors
npm run lint     # must show 0 errors
sui move build --path move/   # must compile clean
```

---

## Key Official Resources

### Sui TypeScript SDK
- Main SDK docs: https://sdk.mystenlabs.com/sui
- `@mysten/sui/client` — `SuiClient`, all RPC methods: https://sdk.mystenlabs.com/sui
- Transaction building: https://sdk.mystenlabs.com/sui/transaction-building/basics
- Network endpoints (local / testnet / mainnet RPC URLs): https://sdk.mystenlabs.com/sui

### Correct Import Paths (SDK v2)
```typescript
import { SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { generateNonce, generateRandomness, getZkLoginSignature, jwtToAddress, getExtendedEphemeralPublicKey } from "@mysten/sui/zklogin"
import { toBase64, fromBase64, normalizeSuiAddress } from "@mysten/sui/utils"
```

### dApp Kit
- dApp Kit docs: https://sdk.mystenlabs.com/dapp-kit
- Next.js setup guide: https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js
- Next.js example repo: https://github.com/MystenLabs/ts-sdks/tree/main/packages/dapp-kit-next/examples/next-js/simple
- `useSignAndExecuteTransaction`: https://sdk.mystenlabs.com/dapp-kit/wallet-hooks/useSignAndExecuteTransaction
- `useSignTransaction`: https://sdk.mystenlabs.com/dapp-kit/wallet-hooks/useSignTransaction

### zkLogin
- Full integration guide: https://docs.sui.io/guides/developer/cryptography/zklogin-integration
- Assemble zkLogin signature: https://docs.sui.io/guides/developer/cryptography/zklogin-integration#assemble-the-zklogin-signature
- Run prover locally: https://docs.sui.io/guides/developer/cryptography/zklogin-integration#run-the-zklogin-prover-locally
- Mysten hosted salt service (testnet, whitelisted only): https://salt.api.mystenlabs.com/get_salt
- Mysten hosted prover (testnet): https://prover.mystenlabs.com/v1
- Mysten dev prover (open, devnet only): https://prover-dev.mystenlabs.com/v1
- zkLogin ceremony contributions (zkey files): https://github.com/sui-foundation/zklogin-ceremony-contributions

### Sponsored Transactions
- Sponsored tx concept: https://docs.sui.io/concepts/transactions/sponsored-transactions
- Shinami gas station (production alternative to admin-keypair sponsor): https://shinami.com/gas-station
- Shinami docs: https://docs.shinami.com/gas-station/overview

### Deployment & Testnet
- `sui client publish` reference: https://docs.sui.io/references/cli/client#sui-client-publish
- Testnet faucet (web): https://faucet.testnet.sui.io/
- Testnet faucet (API): `POST https://faucet.testnet.sui.io/v2/gas`
- Testnet explorer (Suivision): https://testnet.suivision.xyz/
- Sui CLI cheat sheet: https://docs.sui.io/doc/sui-cli-cheatsheet.pdf

### Move
- Move book (Sui edition): https://move-book.com/
- Sui Move by example: https://examples.sui.io/
- Sui framework source (clock, coin, table, etc.): https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/packages/sui-framework/sources
- `sui move build` reference: https://docs.sui.io/references/cli/move#sui-move-build
- `sui move test` reference: https://docs.sui.io/references/cli/move#sui-move-test

### Google OAuth (Phase 2 only)
- Google Cloud Console (create OAuth client): https://console.cloud.google.com/apis/credentials
- Authorized redirect URI for localhost: `http://localhost:3000/auth/callback`
- Authorized JS origin for localhost: `http://localhost:3000`
