# KIAI Implementation Status

This document summarizes what has been implemented in this repo relative to `origin/main`, what is live on Sui Testnet, and what has been validated end to end.

## Baseline

- Repository: `origin/main` tracks `https://github.com/kosuke-eth/Kiai.git`
- Current branch: `main`
- Comparison basis for this document: local working tree vs `origin/main`
- Current tracked delta vs `origin/main`:
  - `23` modified tracked files
  - `5` deleted tracked files
  - substantial new untracked implementation files under `app/api`, `lib/kiai`, `lib/sui`, `move`, `hooks`, `docs`, and `scripts`

## Executive Summary

The codebase has been moved from a mostly local/mock Next.js prototype to a hybrid KIAI MVP with:

- a deployed Sui Move package on Testnet
- a shared onchain `Arena` object
- real admin onchain writes for scenario creation, lifecycle changes, and settlement
- real user onchain writes for badge claim, energy claim, and insight allocation
- sponsored transaction support through a typed server-side allowlist
- onchain-backed read models for profile, scenarios, and leaderboard
- signed-wallet admin auth for the operator console
- a zkLogin implementation path that covers nonce generation, OAuth callback completion, salt/prover integration, session persistence, signature assembly, and transaction submission code

## What Was Added

### 1. Sui Move contract package

New Move package added under [`move/`](../move):

- [`move/Move.toml`](../move/Move.toml)
- [`move/sources/arena.move`](../move/sources/arena.move)
- publish helper: [`scripts/publish-testnet.sh`](../scripts/publish-testnet.sh)

The `arena.move` module implements the KIAI onchain state model:

- `AdminCap`
- shared `Arena`
- `Profile`
- `Scenario`
- `Allocation`
- events for creation, claims, allocations, lifecycle changes, and settlement

Implemented public functions:

- `claim_badge`
- `claim_energy`
- `create_scenario`
- `publish_scenario`
- `lock_scenario`
- `archive_scenario`
- `allocate_insight`
- `settle_scenario`

### 2. Backend-for-frontend API surface

New API routes added under [`app/api/`](../app/api):

- auth:
  - [`app/api/auth/zklogin/route.ts`](../app/api/auth/zklogin/route.ts)
- claims:
  - [`app/api/claims/badge/route.ts`](../app/api/claims/badge/route.ts)
  - [`app/api/claims/energy/route.ts`](../app/api/claims/energy/route.ts)
- scenarios:
  - [`app/api/scenarios/route.ts`](../app/api/scenarios/route.ts)
  - [`app/api/scenarios/[id]/allocate/route.ts`](../app/api/scenarios/%5Bid%5D/allocate/route.ts)
  - [`app/api/scenarios/[id]/settle/route.ts`](../app/api/scenarios/%5Bid%5D/settle/route.ts)
  - [`app/api/scenarios/[id]/state/route.ts`](../app/api/scenarios/%5Bid%5D/state/route.ts)
- reads:
  - [`app/api/profile/[address]/route.ts`](../app/api/profile/%5Baddress%5D/route.ts)
  - [`app/api/leaderboard/route.ts`](../app/api/leaderboard/route.ts)
  - [`app/api/events/route.ts`](../app/api/events/route.ts)
  - [`app/api/marketplace/route.ts`](../app/api/marketplace/route.ts)
  - [`app/api/marketplace/redeem/route.ts`](../app/api/marketplace/redeem/route.ts)
- sponsorship:
  - [`app/api/sponsor/route.ts`](../app/api/sponsor/route.ts)
- admin auth:
  - [`app/api/admin/challenge/route.ts`](../app/api/admin/challenge/route.ts)
  - [`app/api/admin/verify/route.ts`](../app/api/admin/verify/route.ts)
  - [`app/api/admin/session/route.ts`](../app/api/admin/session/route.ts)
  - [`app/api/admin/logout/route.ts`](../app/api/admin/logout/route.ts)

### 3. KIAI domain layer

New KIAI domain modules added under [`lib/kiai/`](../lib/kiai):

- [`lib/kiai/types.ts`](../lib/kiai/types.ts)
- [`lib/kiai/constants.ts`](../lib/kiai/constants.ts)
- [`lib/kiai/api.ts`](../lib/kiai/api.ts)
- [`lib/kiai/store.ts`](../lib/kiai/store.ts)

This provides:

- typed API contracts
- fallback/local store behavior
- mock persistence for development and demo continuity
- profile, scenario, leaderboard, and marketplace shaping

### 4. Sui integration layer

New Sui integration modules added under [`lib/sui/`](../lib/sui):

- [`lib/sui/config.ts`](../lib/sui/config.ts)
- [`lib/sui/server.ts`](../lib/sui/server.ts)
- [`lib/sui/transactions.ts`](../lib/sui/transactions.ts)
- [`lib/sui/read-model.ts`](../lib/sui/read-model.ts)
- [`lib/sui/verification.ts`](../lib/sui/verification.ts)
- [`lib/sui/zklogin.ts`](../lib/sui/zklogin.ts)

This layer now covers:

- network and env configuration
- admin keypair loading
- admin transaction execution
- user and admin transaction builders
- onchain shared-object parsing
- tx digest verification before local sync
- transaction-specific verification for package, function, arena object, and expected args before local sync
- normalization of zkLogin prover output into real signature inputs

### 5. Client hooks and wallet flows

New hooks added:

- [`hooks/use-kiai-address.ts`](../hooks/use-kiai-address.ts)
- [`hooks/use-kiai-chain-actions.ts`](../hooks/use-kiai-chain-actions.ts)
- [`hooks/use-kiai-profile.ts`](../hooks/use-kiai-profile.ts)
- [`hooks/use-zklogin.ts`](../hooks/use-zklogin.ts)

These changes give the app:

- active address resolution from injected wallet or zkLogin session
- sponsored transaction execution path
- signed-wallet operator login for `/admin`
- direct onchain badge/energy/allocation flows
- zkLogin nonce generation and session persistence
- zkLogin signature assembly for transaction submission

## What Was Changed In The Frontend

The main app shell and feature pages were updated to consume the new backend and chain-aware state:

- [`app/layout.tsx`](../app/layout.tsx)
- [`app/page.tsx`](../app/page.tsx)
- [`app/events/page.tsx`](../app/events/page.tsx)
- [`app/predictions/page.tsx`](../app/predictions/page.tsx)
- [`app/athletes/page.tsx`](../app/athletes/page.tsx)
- [`app/leaderboard/page.tsx`](../app/leaderboard/page.tsx)
- [`app/marketplace/page.tsx`](../app/marketplace/page.tsx)
- new admin screen:
  - [`app/admin/page.tsx`](../app/admin/page.tsx)
  - [`components/nbg/admin-console-page.tsx`](../components/nbg/admin-console-page.tsx)

Key UI and UX changes:

- wallet UI now supports both injected wallets and zkLogin session display
- predictions flow is backed by API + chain infrastructure instead of pure local-only simulation
- leaderboard and profile screens now reflect chain state where available
- marketplace and operator tooling are wired into the new API layer

## Codebase Cleanup

Old unused SPA-era components were removed:

- deleted [`components/nbg/arena-dashboard.tsx`](../components/nbg/arena-dashboard.tsx)
- deleted [`components/nbg/bottom-nav.tsx`](../components/nbg/bottom-nav.tsx)
- deleted [`components/nbg/landing-hero.tsx`](../components/nbg/landing-hero.tsx)
- deleted [`components/nbg/match-selection.tsx`](../components/nbg/match-selection.tsx)
- deleted [`components/nbg/rewards-profile.tsx`](../components/nbg/rewards-profile.tsx)

Tooling and repo hygiene additions:

- [`eslint.config.mjs`](../eslint.config.mjs)
- [`.gitignore`](../.gitignore)
- [`.env.example`](../.env.example)
- [`AGENTS.md`](../AGENTS.md)
- docs:
  - [`docs/audit.md`](./audit.md)
  - [`docs/AGENT_TASKS.md`](./AGENT_TASKS.md)
  - this file

## Testnet Deployment

The Move package is published on Sui Testnet.

### Deployed IDs

- Package ID:
  - `0x6ee68a1d8f06564d0625f0c4460f6801207529de93a77a91d4c4efb9b809f976`
- Shared Arena object:
  - `0x9936a83051ac1610335a6ed6277a791e07fb27150027da4f65c6c06eca3e9713`
- AdminCap object:
  - `0x21906cf3511e7e81c6a762ec07a046e64e9f2545ed8497829c50d7a0cdf74f15`

### Publish transaction

- Publish digest:
  - `28jbxMgqYFswLeyZLMydafg2wwvoKA1axhtLVuq2vWRh`

## End-To-End Validation Completed

The following flows were executed and verified against Testnet:

### 1. Admin scenario creation

Verified through `POST /api/scenarios` after restarting the dev server with `.env.local`.

Outcome:

- scenario writes landed in the shared `Arena`
- app `GET /api/scenarios` returned the onchain scenarios

### 2. Badge claim

Verified onchain with:

- claim tx digest: `AsAHjLVh4toQkMVe2JwVCcr6PYyS1KXsU9ghFgMac3Ye`

Observed result:

- profile in shared `Arena` now has:
  - `badge_claimed: true`
  - `badge_xp: 25`
  - `nft_count: 1`

### 3. Energy claim

Verified onchain with:

- claim tx digest: `EBGuJ2QC1ZurwpggmUs8jC5kBLQJTAPzrog5jy2Esb3L`

Observed result:

- profile energy increased to `600`

### 4. Insight allocation

Verified onchain with:

- allocate tx digest: `7rhEUq22PvwHwB59b1BtxNiqBLFBRKUzYgPbFZHDwjhh`

Observed result:

- scenario `1776859735195` contains the allocation
- profile energy reduced from `600` to `500`
- scenario total energy became `100`

### 5. Settlement

Verified through the app admin route and direct onchain readback.

Observed final onchain result:

- scenario `1776859735195` moved to settled state
- winning side set to `true` / `yes`
- profile updated to:
  - `points: 1450`
  - `badge_xp: 75`
  - `correct_calls: 1`
  - `total_calls: 1`
  - `streak: 1`

### 6. API read-model verification

Confirmed after settlement:

- [`/api/profile/[address]`](../app/api/profile/%5Baddress%5D/route.ts) returned the updated chain-backed profile
- [`/api/scenarios`](../app/api/scenarios/route.ts) returned the settled onchain scenario
- [`/api/leaderboard`](../app/api/leaderboard/route.ts) reflected the updated points and streak

## zkLogin Status

zkLogin is implemented in code but not fully browser-verified because real Google OAuth credentials are still not configured.

### Implemented

- nonce generation
- ephemeral key generation and persistence
- Google redirect initiation
- callback completion
- salt fetch
- prover request
- zkLogin signature input normalization
- zkLogin session persistence
- zkLogin signature assembly with `getZkLoginSignature`
- sponsored transaction submission path for zkLogin sessions

### Still external

To run the browser flow end to end, the repo still needs:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

This is now a credentials/configuration gap, not an implementation gap.

## Validation Commands That Pass

The following checks pass in the current repo:

- `npm run lint`
- `npm run build`
- `sui move build --path move`
- `sui move test --path move`

## Important Current State

- The current implementation is not just a local mock anymore.
- The app is now capable of reading and mutating real state on Sui Testnet.
- The local store still exists as a fallback and mirror, but the key user and admin flows have been proven against the deployed shared object.
- The main unfinished browser-facing piece is live Google credential wiring for zkLogin OAuth.

## Recommended Next Documents To Read

- [`docs/audit.md`](./audit.md)
- [`docs/AGENT_TASKS.md`](./AGENT_TASKS.md)
- [`AGENTS.md`](../AGENTS.md)
