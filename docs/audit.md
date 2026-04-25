# KIAI Hackathon Audit

Cross-reference:
- [project-summary.md](project-summary.md)
- [engineering-task-sheet.md](engineering-task-sheet.md)
- [README.md](../README.md)
- [AGENTS.md](../AGENTS.md)

## Executive Summary

This repository is now a **partial Sui hackathon backend**.

It now has:
- a frontend shell
- a local backend-for-frontend under `app/api/*`
- testnet-first wallet configuration
- a local persistence layer in `.data/kiai-store.json`
- a real `move/` package under `move/`
- wallet-built Sui transactions for user actions
- server-built Sui transactions for admin actions when env vars are configured
- sponsored transaction assembly through `app/api/sponsor`
- digest-verified mirror sync for wallet-submitted claim/allocation transactions
- Google zkLogin callback and proof-prep scaffolding in code
- onchain shared-object reads for profile, leaderboard, and scenarios when contract env is configured

It does **not** currently contain:
- deployed Sui package IDs or object IDs by default
- a real indexed on-chain read model
- a full zkLogin transaction signing path

From a product manager perspective, the repo is now **much closer to a real hackathon submission**, but it is still not fully complete until the package is deployed, env IDs are wired, and the temporary local mirror is replaced or clearly accepted as the hackathon read model.

## Official Reference Checks

These are the official references used to evaluate the implementation:

- Sui docs root: https://docs.sui.io/
- Writing Move packages: https://docs.sui.io/guides/developer/first-app/write-package
- Using objects / ownership model: https://docs.sui.io/concepts/object-ownership
- Paying for transactions / sponsored transactions entrypoint area: https://docs.sui.io/guides/developer/sui-101/sign-and-send-txn
- zkLogin overview: https://docs.sui.io/sui-stack/zklogin-integration/zklogin
- Mysten TypeScript SDK: https://sdk.mystenlabs.com/sui
- dApp Kit docs: https://sdk.mystenlabs.com/dapp-kit
- dApp Kit migration guidance: https://sdk.mystenlabs.com/sui/migrations/sui-2.0/dapp-kit
- Next.js dApp Kit guide: https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js
- Sui CLI cheat sheet: https://docs.sui.io/doc/sui-cli-cheatsheet.pdf

## Product Verdict

### What is correct today

- The repo now contains a real Move package for the core fan flow.
- The wallet shell is wired for `testnet`, which matches the hackathon requirement.
- The route-handler structure is reasonable for a backend-for-frontend layer.
- The domain model in `lib/kiai/types.ts` is clean and can map to Move structs.
- The product language is mostly compliance-safe and aligned with the docs.
- User write actions now have a chain path when package/object IDs are configured.
- Admin scenario operations now have a server-side chain path when admin env vars are configured.
- Claim and allocation routes can verify the submitted tx digest onchain before mutating the local mirror.
- A zero-gas sponsored transaction path now exists in code for wallet actions.
- A Google zkLogin bootstrap flow now exists in code for session establishment.

### What is not correct for a Sui implementation

- The UI still reads from a local mirror rather than directly from chain or an indexer.
- Profile, leaderboard, and scenario routes now prefer onchain reads, but the app still falls back to the local mirror for missing or unavailable chain data.
- Marketplace state is still local-only.
- zkLogin is only partially implemented today.
- zkLogin does not yet sign and submit transactions end to end.
- There is no external gas station integration yet; the current sponsorship path uses the admin signer when configured.

## Current Backend Audit

### Route inventory

The current backend consists of route handlers only:

- `app/api/events/route.ts`
- `app/api/scenarios/route.ts`
- `app/api/scenarios/[id]/allocate/route.ts`
- `app/api/scenarios/[id]/settle/route.ts`
- `app/api/scenarios/[id]/state/route.ts`
- `app/api/profile/[address]/route.ts`
- `app/api/leaderboard/route.ts`
- `app/api/marketplace/route.ts`
- `app/api/marketplace/redeem/route.ts`
- `app/api/claims/badge/route.ts`
- `app/api/claims/energy/route.ts`
- `app/api/sponsor/route.ts`

### What these routes actually do

They all still read the local server store in `lib/kiai/store.ts`, but claim/allocation sync routes can verify wallet-submitted digests onchain and admin scenario routes can also execute a real on-chain write first when Sui env vars are present.

Examples:

- `POST /api/claims/badge` calls `getKiaiStore().claimBadge(address)`
- `POST /api/claims/energy` calls `getKiaiStore().claimEnergy(address)`
- `POST /api/scenarios/[id]/allocate` calls `getKiaiStore().allocateInsight(...)`
- `POST /api/scenarios/[id]/settle` calls `getKiaiStore().settleScenario(...)`
- `POST /api/scenarios/[id]/state` calls `getKiaiStore().updateScenarioLifecycle(...)`

This means the current backend is a **hybrid hackathon backend**:
- on-chain writes are available for the core scenario flow
- local persistence remains the temporary read model for the UI

### Security and product reality

For a hackathon demo, this is a reasonable intermediate architecture.

For a real product flow, it still needs:
- indexer-backed or direct on-chain reads
- authenticated operator controls
- sponsorship
- zkLogin

## Wallet and Sui SDK Audit

### Current state

The app uses:
- `@mysten/sui`
- legacy `@mysten/dapp-kit`

The provider is wired correctly for a testnet demo shell:
- `SuiClientProvider`
- `WalletProvider`
- explicit `mainnet` and `testnet` RPC URLs
- default network comes from `NEXT_PUBLIC_SUI_NETWORK`

### Official-doc verdict

This is acceptable for a legacy prototype, but not the preferred path for net-new work.

Mysten’s current docs recommend `@mysten/dapp-kit-react` for new projects. The repo can stay on the legacy package for the current prototype, but the hackathon implementation should not extend this indefinitely if real chain flows are being added.

## Move / On-Chain Audit

### Current state

There is currently:
- a `move/Move.toml`
- a `move/sources/arena.move`
- a minimal shared-object arena contract model
- no published package ID checked into env by default
- no shared object IDs checked into env by default

### Why this matters on Sui

Per the official Sui docs:
- app logic is executed by calling published Move entry functions
- mutable shared state should live in shared objects with contract-level authorization
- owned user assets should be represented by address-owned objects or token balances
- every on-chain transaction requires package references, object references, and gas handling

Because deployment and env wiring are still pending, the current implementation does not yet satisfy the engineering-task-sheet MUST items end to end.

## zkLogin Audit

### Current state

zkLogin now exists as an authentication scaffold:

- Google OAuth redirect flow initiated from the client
- callback handling at `/auth/callback`
- server-side proof-prep route at `/api/auth/zklogin`
- deterministic local salt generation on the backend
- prover request and derived zkLogin address storage in browser session state

### Official-doc requirement

According to the official zkLogin docs, the product needs a backend and service flow around:
- ephemeral key + nonce creation
- OAuth redirect handling
- JWT receipt
- salt lookup or generation
- proof generation
- final transaction signing and submission
The first five items are now scaffolded in code. What is still missing is using the resulting zkLogin proof/signature to execute user transactions onchain instead of limiting real onchain writes to injected wallets.

## Sponsored Transaction Audit

### Current state

There is now a working sponsorship path in code:

- `NEXT_PUBLIC_SPONSORED_TX_ENDPOINT`
- `app/api/sponsor/route.ts`
- sponsored execution in `hooks/use-kiai-chain-actions.ts`

The implemented flow follows Mysten's sponsored transaction pattern:

1. the client builds `onlyTransactionKind` bytes
2. the client sends those bytes and sender address to `/api/sponsor`
3. the server reconstructs the transaction with `Transaction.fromKind(...)`
4. the server sets sender, gas owner, and sponsor gas payment
5. the server signs as sponsor and returns the sponsored transaction plus sponsor signature
6. the wallet signs the sponsored transaction and executes it with both signatures

### Product consequence

The zero-gas fan path is now implemented in code, but it still depends on real admin env values and sponsor gas coins on Testnet to work end to end.

## Correct Hackathon Sui Scope

To complete the hackathon implementation correctly, the repo should finish the remaining Sui slice:

### 1. Deploy the Move package

The package now exists locally. Next step is:

- publish it to Testnet
- capture package ID
- capture the shared arena object ID
- capture the admin cap ID
- wire those into `.env.local`

### 2. Real on-chain write paths

The repo now contains write builders for:

- badge claim
- energy claim
- allocate insight
- operator create/publish/lock/settle scenario

What remains is deployment plus verification against a live package.

### 3. Real on-chain read paths

At minimum:

- read badge object(s) for profile
- read scenario object(s) for live predictions
- read registry or emitted events for operator views

### 4. Sponsored transaction activation

The code path now exists. Remaining work is operational:

1. set `NEXT_PUBLIC_SPONSORED_TX_ENDPOINT=/api/sponsor`
2. set `SUI_ADMIN_PRIVATE_KEY` and `SUI_ADMIN_CAP_ID`
3. ensure the sponsor wallet has testnet SUI gas coins
4. verify the sponsor route against a deployed package on Testnet

### 5. zkLogin path

For the fully complete version:

- Google login
- zkLogin nonce setup
- redirect callback
- JWT to salt/proof flow
- derived Sui address binding
- zkLogin transaction signature generation and execution

## Recommended Move Shape

For hackathon speed, do **not** overbuild.

Current package shape:

```text
move/
├── Move.toml
└── sources/
    └── arena.move
```

Recommended module responsibilities:

### `kiai::badge`

- mint one badge per user
- store tier and XP
- allow tier upgrade during settlement

### `kiai::energy`

- maintain user energy balance
- allow claim with cooldown
- deduct energy during scenario allocation

### `kiai::scenario`

- create scenarios
- publish or lock scenarios
- record allocations
- settle outcome
- emit events for indexing

## Hackathon Priority Order

If time is tight, this is the correct build order:

1. Move package deploys successfully on testnet.
2. Badge mint works as a real sponsored transaction.
3. Energy claim works on chain.
4. Scenario create + allocate + settle works on chain.
5. Frontend reads real on-chain state for profile and live scenarios.
6. zkLogin is added last unless it is required for the pitch demo.

## What To Tell Judges Today

If demoing the current repository without further chain work, the honest statement is:

> “This is the frontend and backend-for-frontend MVP. Wallet connectivity, Move source, and sponsored transaction wiring are in place on testnet-oriented code paths, but deployed package IDs, zkLogin, and full onchain reads are still the next implementation slice.”

That is accurate.

If the goal is to present a true Sui hackathon implementation, the repo still needs the Move package and real transaction flows described above.

## Final Verdict

### Is the current backend code “correct” as a Sui backend?

No.

### Is the current backend code “correct” as a local MVP simulator?

Yes.

### Is there any Move implementation in the repo today?

No.

### What is the single biggest blocker?

The absence of a published Move package and deployed Testnet IDs.
