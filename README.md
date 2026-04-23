# 🥋 KIAI: The Spirit Engine

### Real-Time Sentiment Market for ONE Championship on Sui

-----

## 📖 Overview

**KIAI** is the world's first "100% legal" and "zero-friction" combat sports real-time sentiment market, merging the power of the Sui blockchain with real-time live broadcasting..

Due to strict gambling laws in Japan, traditional prediction markets are difficult to implement for domestic events like ONE Championship. KIAI elegantly leaps over this legal wall by utilizing Sui's **Sponsored Transactions** and **zkLogin**. By building a model where users face "zero financial burden" (including gas fees), KIAI synchronizes fan passion on-chain while maintaining full legal compliance.

### Core Values

  * **NO Betting, YES Sync:** We don't bet money; we synchronize passion.
  * **Zero Friction:** No wallets, no gas fees. Join in 1 second with just a Google login.
  * **Combat IQ:** Prove your "fighting insight" and earn honor through Soulbound Tokens (SBT).

-----
### 💡 Practical Impact

* For ONE Championship: Unlocks a legally compliant, highly engaging interactive experience in Japan. By keeping fans glued to 60-second micro-scenarios, it drastically increases screen retention.

* For Athletes: Creates a verifiable on-chain bridge to true fans. Athletes can identify who backed them during critical moments and reward high-tier "Black Belt" SBT holders with exclusive perks (meet & greets, merchandise).

## ✨ Key Features

### 1\. ⚡️ Zero-Friction Onboarding (zkLogin)

Integrated with Sui's **zkLogin**, KIAI requires no seed phrases or existing wallets. General fight fans can enter the "Dojo" instantly using only their everyday Google accounts.

### 2\. ⛽️ Fully Sponsored Transactions

To comply with Japanese regulations, the protocol covers 100% of the gas fees for all transactions. By eliminating "financial output" from the user, the system completely clears the legal constraints of gambling and sweepstakes laws.

### 3\. 🥋 Earn Points & Claim Gasless NFTs

Upon successful predictions, users are rewarded with "Combat IQ" points. Based on accumulated points, users can claim and upgrade their "KIAI Badge" (Dynamic SBT) completely **gas-free** via Sponsored Transactions. The badge visually evolves on-chain (e.g., from White Belt to Black Belt), serving as verifiable proof of their fighting insight to unlock future exclusive ONE Championship perks.

-----

## 🏗 Architecture

1.  **Match Data Ingest:** Captures metadata from the live fight.
2.  Real-Time Scenario Minting: Currently, admin operators monitor the live match and instantly mint Scenario objects on Sui, with full AI automation planned for the next phase.3.  **User Interaction:** Users sign via `zkLogin` and allocate `KIAI Energy` (voting tokens).
4.  **Parallel Settlement:** Sui’s parallel execution processes tens of thousands of simultaneous inputs with ultra-low latency.
5.  **Reward Distribution:** Updates `Dynamic NFT` status and points after scenario settlement.

-----

## 🛠 Tech Stack

  * **Blockchain:** Sui Network (Move)
  * **Smart Contracts:** Sui Move
  * **Frontend:** React, TypeScript, Tailwind CSS, Vite
  * **Identity:** Sui zkLogin (Google Auth)
  * **Infrastructure:** Sponsored Transactions (Gas Station integration)

-----

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18 or higher)
  * Sui CLI (latest version for Testnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/GustoDevelopment/KIAI.git
cd KIAI

# Install dependencies
npm install
```

### Deploy Smart Contracts (Sui Move)

```bash
cd move/kiai
sui client publish --gas-budget 100000000
```

### Start Frontend

```bash
npm run dev
```

-----

## ⚖️ Legal Compliance

KIAI is designed with a "Compliance First" approach for the Japanese market.

  * **Avoidance of Gambling:** Participation is entirely free. Furthermore, Sponsored Transactions eliminate the need for users to pay technical fees (gas), establishing an "Open Sweepstakes" model with zero financial risk.
  * **Legal Nature of Digital Assets:** Rewards are non-transferable SBTs (Soulbound Tokens) and points, maintaining their status as "honorary memberships" rather than assets with transferable property value.

-----

## 📢 Vision

**"Go BOLD. Synchronize the Arena."**

We use technology to gracefully overcome the barriers that bind the Japanese entertainment and Web3 industries. We are creating a future where the "KIAI" (spirit) of fans is connected on-chain, both at the Ariake Arena and in front of screens worldwide.

-----

## 🗺 Roadmap (Post-Hackathon)

While our current MVP focuses on perfectly executing the core Sui infrastructure (zkLogin, Sponsored Tx) and establishing the legal framework, our next steps include:
* **AI-Driven Micro-Books:** Integrating LLM agents (e.g., OpenAI) to automatically analyze live match data and generate prediction scenarios with zero human intervention.
* **Official ONE Super App Integration:** Seamlessly embedding the KIAI engine into the existing ONE Championship mobile ecosystem.

© 2026 KIAI Project. All rights reserved.
