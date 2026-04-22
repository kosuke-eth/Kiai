# AGENTS.md

## Purpose
This repository is the KIAI frontend prototype for a Sui-based, gasless fan engagement product around live ONE Championship events.

Use this file as a map, not an encyclopedia. Start here, then read the linked docs and relevant code before making changes.

## Source Of Truth
Read these first when the task touches product direction or Sui behavior:

- [README.md](README.md): current MVP overview, local run instructions, and Sui integration notes.
- [docs/project-summary.md](docs/project-summary.md): product concept and positioning.
- [docs/engineering-task-sheet.md](docs/engineering-task-sheet.md): intended implementation direction.

If docs and code disagree, trust the code for current behavior and treat docs as target-state intent unless the user says otherwise.

For Sui-specific implementation details, prefer official Mysten and Sui docs over memory or guesswork.

## Current Repo State
This repo is currently a Next.js 16 App Router MVP with a local backend-for-frontend layer.

- Primary routes: `/`, `/events`, `/predictions`, `/athletes`, `/leaderboard`, `/marketplace`
- Operator route: `/admin`
- Route handlers: `app/api/*`
- Shared shell: [app/layout.tsx](app/layout.tsx), [components/nbg/header.tsx](components/nbg/header.tsx)
- Product UI: `components/nbg/*`
- Typed domain state: `lib/kiai/*`
- Local persistence fallback: `.data/kiai-store.json`
- Move package: `move/`
- Sui transaction builders: `lib/sui/*`
- Styling: [app/globals.css](app/globals.css)
- Wallet integration shell: [components/nbg/wallet-provider.tsx](components/nbg/wallet-provider.tsx), [components/nbg/wallet-button.tsx](components/nbg/wallet-button.tsx)

Important: this is still not a full production Sui app. The repo now contains a real Move package, chain transaction builders, digest-verified mirror sync routes, a sponsored transaction route, and zkLogin session scaffolding, but it still does not contain deployed package/object IDs by default, full zkLogin transaction signing, an indexer, or a production database.

## Architecture Notes
Prefer preserving the current shape unless the task justifies a refactor.

- Route files should stay thin and defer screen logic to `components/nbg/*`.
- Shared wallet and query providers belong in [app/layout.tsx](app/layout.tsx).
- Keep screen-local mock/demo state inside the relevant page component unless there is clear reuse pressure.
- Avoid introducing a global client state library unless the app actually needs cross-route domain state.

There are some older orphaned prototype components in `components/nbg/` that are not routed today. Do not wire them back in casually.

## Sui Rules
When adding Sui functionality, optimize for the intended product direction:

- Build for Sui Testnet first unless the user explicitly asks for mainnet.
- Prefer official Mysten SDKs and current dapp-kit patterns.
- Keep transaction construction deterministic and easy to inspect.
- Separate transaction building from signing/sponsorship concerns.
- Treat on-chain state as the source of truth for ownership and irreversible reward state.
- Until an indexer exists, the local `.data/kiai-store.json` file is the temporary read-model mirror for the UI.
- Keep package IDs, object IDs, network names, and chain constants centralized.
- If a wallet action syncs local state after execution, prefer verifying the submitted tx digest onchain before mutating the mirror.

Current repo note:

- The codebase currently uses legacy `@mysten/dapp-kit`.
- For net-new wallet integration work, check whether migrating to the current `@mysten/dapp-kit-react` stack is the better move before extending legacy patterns.
- Do not migrate blindly during unrelated UI work.

If you add real chain flows, document:

- network
- package IDs / object IDs
- required env vars
- how frontend code discovers on-chain resources
- whether a local read-model mirror is still in use

Official references:

- Sui docs root: https://docs.sui.io/
- zkLogin docs: https://docs.sui.io/sui-stack/zklogin-integration/zklogin
- TypeScript SDK docs: https://sdk.mystenlabs.com/sui
- dApp Kit docs: https://sdk.mystenlabs.com/dapp-kit
- dApp Kit React / migration guidance: https://sdk.mystenlabs.com/sui/migrations/sui-2.0/dapp-kit
- Next.js dApp Kit guide: https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js

## Product Language Rules
KIAI should avoid gambling-coded terminology in user-facing copy and domain naming.

Prefer terms like:

- `allocate_insight`
- `sync_kiai`
- `stake_energy`
- `claim_kiai`
- `settle_scenario`

Avoid introducing terms like:

- `bet`
- `wager`
- `gamble`
- `odds`
- `payout`

Note: some current prototype code still uses older wording. If you touch those areas, move them toward compliance-safe naming unless that would create unnecessary churn.

## UI And UX Expectations
This product is live-event oriented. Favor:

- fast scanability
- bold, intentional hierarchy
- mobile-first interaction quality
- clear status transitions for live, locked, and settled scenarios
- interfaces that feel real-time even when backed by mock data

Preserve the black, white, and gold visual language unless the task is explicitly a redesign.

## Implementation Priorities
If asked to move the prototype toward the intended product, prefer this order:

1. Clean up prototype inconsistencies and dead code.
2. Align copy and naming with compliance-safe product language.
3. Add testnet-first Sui configuration and chain constants.
4. Replace the temporary local read-model mirror with real chain reads or an indexer.
5. Add sponsored transaction and zkLogin support only with clear env/config documentation.
6. Add backend or indexer assumptions explicitly, not implicitly.

## Validation
Run the smallest relevant checks after changes:

```bash
npm run lint
npm run build
```

If a task touches only copy or docs, say so and do not pretend code validation happened.

## Change Discipline
Before making structural changes:

- inspect the relevant route and `components/nbg` screen first
- check whether the behavior is mock-only or actually integrated
- avoid adding abstractions for future backend/services that do not exist yet
- prefer small, legible edits over speculative architecture

When a task depends on missing infrastructure, say exactly what is missing instead of faking completion.

## Documentation Hygiene
When you make meaningful architectural or Sui-integration changes, update the relevant docs in `docs/` or `README.md` so the repository stays legible to future agents.


<claude-mem-context>
# Memory Context

# [Kiai] recent context, 2026-04-22 6:57pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,770t read) | 1,470,161t work | 99% savings

### Apr 22, 2026
70 1:41a 🔵 Codex MCP Server List — Exact Configuration for Both Servers
72 1:42a 🔵 VS Code mcp.json — Full MCP Server Inventory Including Context7
74 " ✅ Codex config.toml Backed Up Before MCP Changes
76 1:43a 🟣 Context7, Exa, and Playwright MCP Servers Added to Codex
79 1:47a 🔵 Kiai Project — Next.js Web App for ONE Championship Sui Blockchain Sentiment Market
80 " 🟣 Full VS Code MCP Server Suite Migrated to Codex config.toml
83 " 🟣 Codex MCP Server Migration Complete — 17 Servers Active, All Verified
86 1:50a 🔵 context7 MCP Confirmed Active in Codex — API Key Embedded
87 " 🔵 Codex MCP Auth Gaps — GitHub Docker Down, Firebase DNS Fails, Cloudflare 401
88 1:53a 🔴 GitHub MCP Migrated from Docker to streamable_http — Firebase and Cloudflare Removed
89 " 🔵 Codex MCP Auth Status Audit — 14 Servers, context7 "not_logged_in" Despite API Key
90 2:00a ✅ Kiai Docs Folder — KIAI.md Files Moved from Downloads to Codebase
91 " ✅ Kiai Docs Folder Created — Project Summary and Engineering Task Sheet Added
93 2:01a 🔵 Kiai Full Codebase Audit — File Tree, Stack, and Architecture Confirmed
94 2:02a 🔵 Kiai Frontend Architecture Deep Audit — Routing, Providers, Wallet, Theme, and Mock Data Patterns
95 " 🔵 Kiai components/nbg — Full Module Inventory and Usage Map
96 " 🔵 Kiai Header — Hardcoded Points Demo Value and Sui Wallet Dual-Read Pattern
97 " 🔵 Kiai Orphaned SPA Components — Legacy View-Switch Architecture Not Deleted
98 2:05a 🔵 Kiai Implementation Gap Analysis — Prototype vs Spec Delta Fully Mapped
99 2:06a 🔵 Kiai App Router Architecture — Full Route Map, Provider Tree, and State Patterns
100 2:08a 🔵 Kiai Package Dependencies — Full Inventory Confirmed
101 " 🔵 Kiai Sui Wallet Integration — Implemented but Configured for Mainnet, Not Testnet
102 " 🔵 Kiai Frontend — All Data Is Hardcoded Mock; Zero Blockchain or API Calls in Any Route
103 " 🔵 Kiai Theme System — Custom Gold/Dark Design Token Overrides in app/globals.css; styles/globals.css is Dead Code
104 " 🔵 Kiai Route Architecture — 6 Next.js App Router Pages, All Client Components, Header Props Mismatch
105 3:03a ✅ AGENTS.md Added to Kiai Codebase for Codex — Sui-Focused Agent Guidelines
135 6:11p 🔵 Kiai README Current State — Pre-Update Audit
136 " 🔵 Kiai Testnet Deployment Confirmed — IDs and E2E Flows Verified in IMPLEMENTATION_STATUS.md
140 6:12p ✅ Kiai README.md Fully Rewritten — Accurate, Clean, Agent-Friendly
143 6:17p ✅ Kiai README.md — Full Accurate Rewrite
144 6:19p 🔵 Kiai Git Status — Full Uncommitted Change Surface
145 " ✅ Kiai .gitignore Rewritten — Comprehensive Next.js + Sui Project Ignore Rules
147 6:21p 🔵 Kiai Git Remote — All Work Uncommitted, Remote is kosuke-eth/Kiai on GitHub
149 " 🔵 Kiai Tracked File Diff vs Origin — Key Config and Code Changes Confirmed
151 " 🔵 Kiai Build and Lint Pass Clean — TypeScript Strict Mode Active
154 6:22p 🔵 Kiai Full Backend Architecture Deep Audit — API Routes, Hooks, Lib Layer, and Chain Integration Confirmed
167 6:28p ⚖️ Kiai Hackathon Plan — Deep Codex-Backed Planning Initiated
168 6:34p ⚖️ Kiai Admin Auth — Sui-Native Approach Preferred Over Basic/Wallet Allowlist
169 " 🔵 Sui SDK — signPersonalMessage + verifyPersonalMessageSignature Available for Wallet-Based Auth
172 6:35p 🔵 Kiai Admin Route — Zero Auth Protection, Thin Page Wrapper Only
173 " 🔵 Kiai Core Types Confirmed — ScenarioState, UserProfile.linkedWalletKind, and Key Constants
174 " 🔵 verifyPersonalMessageSignature — Exact API Contract Confirmed for Server-Side Wallet Auth
175 6:37p 🔵 useSignPersonalMessage — Exact Frontend Usage Pattern Confirmed for Admin Auth
176 " 🔵 zkLogin Callback Page — Already Implemented and Live at /auth/callback
177 " 🔵 KiaiStore — In-Memory Singleton with File Persistence, Full Marketplace + Scenario Logic
181 6:38p 🟣 Sui-Native Admin Auth System — lib/admin-auth.ts + Four API Routes Implemented
182 " 🔄 Sponsor API Route — Replaced Raw transactionKindBytes with Typed Action Discriminated Union
183 " 🟣 verifyConfirmedTransaction — Full Move Call Argument Verification Against Arena Contract
187 " ✅ Admin Auth + Sponsor Refactor + Verification Upgrade — All 7 Files Written to Disk
191 6:44p 🔵 Scenarios API Route — No Admin Auth Guard, Hybrid Chain+Store Read Pattern

Access 1470k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
