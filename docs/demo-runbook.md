# KIAI Demo Runbook

This runbook matches the **actual routed frontend** and uses the **real header labels and button text** in the app.

Use this if you want to show:

- the fan flow
- the live predictions flow
- the leaderboard and rewards flow
- and optionally the operator/admin console

This runbook is for the app as it exists today:

- user actions are chain-backed on Sui Testnet when env is configured
- some reads are chain-backed through the shared Arena object
- UI updates are polling-based, not push-based
- the demo feels live, but it is not a websocket-style realtime architecture yet

## Routed Screens You Can Click In The Header

From the top nav in the web app, the visible routes are:

- `EVENTS`
- `PREDICTIONS`
- `ATHLETES`
- `LEADERBOARD`
- `MARKETPLACE`
- `ADMIN`

The wallet/login entry is the `Connect Wallet` button in the header.

## Best Demo Structure

The cleanest live demo is:

1. `/`
2. `Connect Wallet`
3. `PREDICTIONS`
4. `LEADERBOARD`
5. `MARKETPLACE`
6. optional: `ADMIN`

That gives you the fan story first, then the operator story second.

## Before The Demo

Do this before you present:

1. Start the app:

   ```bash
   npm run dev
   ```

2. Make sure the sponsor/admin wallet has enough testnet SUI.

3. Make sure there is at least one `open` scenario you can show in `/predictions`.
   - Best values for a stable demo:
     - `Opens in = 0`
     - `Locks in = 300` or `600`
   - Do not use a 45-second lock window unless you are intentionally doing a speed demo.

4. Test Google login once before going on stage.

5. Keep an injected Sui wallet ready as backup.

6. If you want to show `ADMIN`, make sure you have an allowlisted injected Sui wallet available in the same browser.

Important:

- Google zkLogin is the **fan** login flow.
- `/admin` uses **Sui wallet signed operator auth**, not Google login.
- `PREDICTIONS` updates by polling every few seconds, so describe it as **live-updating** or **near-real-time**, not instant push realtime.

## What Is Actually Live

For the hackathon, the strongest honest framing is:

- scenario creation, allocation, and settlement writes are real Sui Testnet actions
- the frontend refreshes every few seconds and reflects those results
- this is a working live interaction loop, not a production push-transport stack

Safe phrases:

- `live-updating fan interaction loop`
- `chain-backed live windows`
- `gasless interaction path on Sui testnet`
- `operator-controlled live scenario lifecycle`

Avoid saying:

- `instant realtime push updates`
- `fully production realtime infrastructure`
- `everything in the app is live chain data`

## Fan Flow: Exact Click Path

### Step 1 — Home

Open:

- `http://localhost:3000/`

What to say:

> KIAI is a Sui-based live fan engagement experience for ONE Championship. Fans join quickly, read the fight live, and earn progression through participation.

### Step 2 — Login

In the header, click:

1. `Connect Wallet`
2. `Continue with Google`

If Google is slow, use the injected wallet option instead.

After login succeeds:

- the header should stop showing `Connect Wallet`
- the app should show the connected wallet state

### Step 3 — Predictions Screen

In the header, click:

1. `PREDICTIONS`

On the left panel, click:

1. `Claim KIAI Badge`
2. `Claim 600 Energy`

On the active scenario card:

1. click either `YES` or `NO`
2. change `Energy allocation` to `50`
3. click `Allocate insight`

What to say:

> This is the core interaction. The fan activates their event profile, claims energy, and allocates their read of the fight into a live scenario window.

What to point at on the screen:

- the active window label
- the remaining time
- participant count
- total energy

Important:

- the scenario state is live-updating through polling
- the countdown is not a true per-second synchronized timer yet
- the write itself is the strongest proof point, not the timer animation

### Step 4 — Leaderboard Screen

In the header, click:

1. `LEADERBOARD`

Point at:

- rank
- KP
- streak
- badge tier

What to say:

> As scenarios settle, user performance rolls into visible progression here.

### Step 5 — Marketplace Screen

In the header, click:

1. `MARKETPLACE`

Show:

- points balance
- NFT count
- reward cards
- `Redeem Now` on a reward if the profile can afford one

What to say:

> KIAI turns live participation into rewards, not just a one-off interaction.

## Admin Flow: Exact Click Path

Show this only after the fan flow.

### Step 1 — Open Admin

In the header, click:

1. `ADMIN`

If you are not authenticated yet, the admin page will show:

- `OPERATOR CONSOLE`
- `Sui operator sign-in`
- `Sign in with Sui wallet`

### Step 2 — Operator Login

Before clicking the admin sign-in button:

- make sure an injected Sui wallet is connected in the header

Then click:

1. `Sign in with Sui wallet`

This signs a short Sui challenge and unlocks the operator console.

Important:

- this is not Google login
- this is wallet-signed operator auth

### Step 3 — Create A Scenario

Once authenticated, the admin page shows `Create scenario`.

Fill the fields if needed, then click:

1. `Draft live scenario`

Recommended admin values:

- `Opens in`: `0`
- `Locks in`: `300`

That gives you enough time to complete the fan flow before the window disappears.

### Step 4 — Lifecycle Actions

For a drafted scenario, use:

- `Publish now`
- `Archive`

For an open scenario, use:

- `Lock now`
- `Settle YES`
- `Settle NO`

For a locked scenario, use:

- `Settle YES`
- `Settle NO`
- `Archive`

Recommended on-stage admin flow:

1. show an existing scenario card
2. click `Lock now` if it is still open
3. click `Settle YES` or `Settle NO`
4. go back to `LEADERBOARD`

Avoid using `Archive` on stage unless you already tested it in the same session and you specifically need it.

What to say:

> This is the operator side. They control live scenario state transitions and settle outcomes, while the fan-facing experience stays lightweight.

## Best 2-Minute Demo

Use this exact sequence:

1. `/`
   - frame the product
2. `Connect Wallet`
   - `Continue with Google`
3. `PREDICTIONS`
   - `Claim KIAI Badge`
   - `Claim 600 Energy`
   - `YES` or `NO`
   - set `Energy allocation` to `50`
   - `Allocate insight`
4. `LEADERBOARD`
   - show progression
5. `MARKETPLACE`
   - show reward loop
6. `ADMIN`
   - `Sign in with Sui wallet`
   - `Lock now` or `Settle YES` / `Settle NO`
7. `LEADERBOARD`
   - show the operator-controlled outcome story

## Short Presenter Script

### Home

> KIAI is a live fan participation layer on Sui for combat sports.

### Login

> A fan joins through a mainstream login path instead of dealing with gas first.

### Predictions

> This is the core loop: claim event identity, receive energy, and allocate insight into a live scenario before the window closes.
> The write happens on Sui testnet, then the UI syncs the result back into the live screen.

### Leaderboard

> Correct calls convert into visible progression and ranking.

### Marketplace

> That progression connects directly to redeemable fan rewards.

### Admin

> Operators manage the live windows and settle outcomes through a Sui-native signed admin flow.

## Important Demo Caveats

- The fan flow and the admin flow use different auth models.
- Fan login can use Google zkLogin.
- Admin requires an allowlisted injected Sui wallet.
- The app is polling-based, not push-based realtime.
- Events and marketplace inventory are still mostly static/demo data.
- The strongest proof points are the chain-backed writes and the visible state sync after them.
- If you want the demo to look smooth, rehearse both flows once before presenting.

## Compliance-Safe Language

Prefer:

- `allocate insight`
- `claim energy`
- `live scenario`
- `settled result`
- `fan participation`

Avoid:

- bet
- wager
- odds
- payout
- gamble
