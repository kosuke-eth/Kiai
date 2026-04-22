# KIAI

KIAI is a testnet-first fan engagement product for live ONE Championship events, built on Sui. It lets fans claim a badge, receive event energy, allocate insight to live scenarios, and earn standing as moments unfold.

This repository is a hackathon-ready MVP: a Next.js 16 app with a local backend-for-frontend layer, a deployed Move package on Sui Testnet, real onchain write flows, and a temporary local read-model mirror so the full experience can run without an indexer.

The product direction is compliance-safe fan participation, not gambling. In product and code language, prefer terms such as `allocate_insight`, `stake_energy`, and `settle_scenario`.

## Why This Project Exists

KIAI is designed around a simple idea: turn live fight moments into real-time fan participation without exposing users to financial risk or crypto complexity.

The current MVP focuses on three constraints:
- zero-friction onboarding for mainstream fans
- zero-gas interaction paths through sponsored transactions
- testnet-first, inspectable chain behavior for hackathon validation

## Quickstart

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run dev
```

Open:
- `/` for the landing page
- `/predictions` for the live scenario flow
- `/leaderboard` for rankings
- `/marketplace` for redemptions
- `/admin` for operator controls

## Current State

This repository is no longer just a UI prototype.

Implemented in the current codebase:
- Next.js 16 App Router frontend with routes for `/`, `/events`, `/predictions`, `/athletes`, `/leaderboard`, `/marketplace`, and `/admin`
- Route handlers under `app/api/*` for profile, scenarios, claims, leaderboard, marketplace, sponsorship, and zkLogin bootstrap
- Typed KIAI domain layer under `lib/kiai/*`
- Sui transaction builders and read-model parsing under `lib/sui/*`
- A real Move package under `move/`
- Wallet-signed onchain flows for badge claim, energy claim, and insight allocation
- Server-executed admin flows for scenario creation, lifecycle changes, and settlement
- Wallet-signed operator auth for `/admin` using an allowlisted Sui wallet challenge
- Sponsored transaction support through a typed, allowlisted `POST /api/sponsor` contract
- Transaction-specific onchain verification before local mirror updates for claim and allocation sync
- Google zkLogin bootstrap flow, session persistence, signature assembly, and transaction execution path in code
- Onchain-backed reads for scenarios, profile, and leaderboard when Sui env is configured

Still intentionally incomplete:
- No production database or indexer
- `.data/kiai-store.json` is still the temporary UI read-model mirror and fallback store
- Marketplace state is still local-first and demo-scoped to the default profile
- zkLogin should still be treated as prototype-grade until you validate it against your own deployed env
- Admin auth is hackathon-grade session auth, not a full production operator IAM model

For the implementation audit and validation record, see [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Validated On Testnet

Per [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md), the following flows have already been executed against Sui Testnet:
- Move package published
- Admin scenario creation
- Badge claim
- Energy claim
- Insight allocation
- Scenario settlement
- API read-model verification after settlement

That means the repo currently represents a hybrid MVP:
- onchain writes are real
- some reads are chain-backed
- the UI still uses a local mirror as the temporary read model

## Deployed Testnet Resources

Current deployed IDs from [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md):

- Package ID: `0x6ee68a1d8f06564d0625f0c4460f6801207529de93a77a91d4c4efb9b809f976`
- Shared Arena object: `0x9936a83051ac1610335a6ed6277a791e07fb27150027da4f65c6c06eca3e9713`
- AdminCap object: `0x21906cf3511e7e81c6a762ec07a046e64e9f2545ed8497829c50d7a0cdf74f15`
- Publish digest: `28jbxMgqYFswLeyZLMydafg2wwvoKA1axhtLVuq2vWRh`

If you want local development to use the deployed testnet package, wire these into `.env.local`.

## Architecture Snapshot

Primary app routes:
- `/`
- `/events`
- `/predictions`
- `/athletes`
- `/leaderboard`
- `/marketplace`
- `/admin`
- `/auth/callback`

Important directories:
- `app/`: App Router pages and route handlers
- `components/nbg/`: route-level product UI
- `hooks/`: wallet, address, profile, and zkLogin hooks
- `lib/kiai/`: typed domain contracts and local store
- `lib/sui/`: Sui config, transaction builders, verifier, zkLogin helpers, and read-model parser
- `move/`: Move package source
- `.data/kiai-store.json`: temporary local mirror

Key architectural behavior:
- frontend routes stay thin and defer screen logic to `components/nbg/*`
- `app/api/*` acts as the backend-for-frontend layer
- onchain writes and local mirror sync are deliberately separated
- onchain state is the intended source of truth, but the local mirror still supports demo continuity until an indexer exists

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- TanStack React Query
- `@mysten/sui`
- legacy `@mysten/dapp-kit`
- Zod

Note: the repo still uses legacy `@mysten/dapp-kit`. For net-new wallet integration work, check whether migrating to the current `@mysten/dapp-kit-react` stack is the right move before extending the legacy path.

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Publish the Move package to Testnet

```bash
npm run sui:publish:testnet
```

## Environment Configuration

Copy `.env.example` to `.env.local`.

Current env surface:

```bash
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=
NEXT_PUBLIC_SUI_ARENA_OBJECT_ID=
NEXT_PUBLIC_SPONSORED_TX_ENDPOINT=/api/sponsor

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

SUI_ADMIN_CAP_ID=
SUI_ADMIN_PRIVATE_KEY=
KIAI_ADMIN_ALLOWLIST=
KIAI_ADMIN_SESSION_SECRET=

ZKLOGIN_SALT_SERVICE=https://salt.api.mystenlabs.com/get_salt
SUI_ZKLOGIN_PROVER_URL=
SUI_ZKLOGIN_SALT_SEED=
```

What these env vars enable:

- `NEXT_PUBLIC_SUI_NETWORK`: active Sui network, defaulting to `testnet`
- `NEXT_PUBLIC_SUI_PACKAGE_ID`: deployed Move package used for user/admin write flows
- `NEXT_PUBLIC_SUI_ARENA_OBJECT_ID`: shared `Arena` object used by reads and writes
- `NEXT_PUBLIC_SPONSORED_TX_ENDPOINT`: enables the sponsored transaction path, usually `/api/sponsor`
- `SUI_ADMIN_CAP_ID`: admin capability object for server-side scenario operations
- `SUI_ADMIN_PRIVATE_KEY`: server signer for admin writes and sponsorship
- `KIAI_ADMIN_ALLOWLIST`: comma-separated Sui wallet addresses allowed to unlock `/admin`
- `KIAI_ADMIN_SESSION_SECRET`: HMAC secret used to sign the admin session cookie after wallet verification
- Google and zkLogin vars: enable the OAuth and proof-generation path used by `/api/auth/zklogin` and `/auth/callback`

When package and object IDs are configured:
- claim and allocation actions can execute onchain
- scenario reads can prefer the shared onchain `Arena` object
- admin scenario operations can execute through the server signer
- local mirror updates can verify submitted tx digests before mutation

## Demo Highlights

What the app does today:
- fans can claim a badge, load energy, and allocate insight to live scenarios
- operators can create, publish, lock, settle, and archive scenarios from `/admin`
- operators must first sign a Sui wallet challenge before using `/admin`
- leaderboard and profile state can reflect onchain outcomes when configured
- the app supports injected wallets and has a zkLogin flow in code
- sponsorship is supported for zero-gas user actions when the server signer is configured

What the app does not yet do:
- use a real indexer or production database
- source marketplace state from chain
- provide production-ready operator authentication, authorization, and audit controls
- ship a fully productionized zkLogin deployment story

## Product Language

Prefer:
- `allocate_insight`
- `sync_kiai`
- `stake_energy`
- `claim_kiai`
- `settle_scenario`

Avoid:
- `bet`
- `wager`
- `gamble`
- `odds`
- `payout`

## Repository Docs

- [docs/project-summary.md](docs/project-summary.md): product concept and positioning
- [docs/engineering-task-sheet.md](docs/engineering-task-sheet.md): intended implementation direction
- [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md): what was implemented and validated
- [docs/audit.md](docs/audit.md): architectural audit and gaps
- [AGENTS.md](AGENTS.md): repo-specific guidance for coding agents

If docs and code disagree, trust the code for current behavior and treat the docs as target-state intent unless the task explicitly says otherwise.

## Sui References

Use official Mysten and Sui docs before changing chain behavior:

- Sui docs: https://docs.sui.io/
- zkLogin docs: https://docs.sui.io/sui-stack/zklogin-integration/zklogin
- TypeScript SDK docs: https://sdk.mystenlabs.com/sui
- dApp Kit docs: https://sdk.mystenlabs.com/dapp-kit
- dApp Kit React and migration guidance: https://sdk.mystenlabs.com/sui/migrations/sui-2.0/dapp-kit
- Next.js dApp Kit guide: https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js
