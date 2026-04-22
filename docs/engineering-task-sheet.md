# **🛠 KIAI (The Spirit Engine) \- Engineering Task Sheet**

**Assignee:** Kapure (Tech Lead)

**Deadline:** April 25, 2026, 12:00 PM JST

**Project Goal:** Implement a completely gasless, zero-friction fan engagement experience on the Sui Testnet.

---

## **🟥 MUST: Critical Path (Legal & Technical Requirements)**

### **1\. Sui Testnet Deployment & Environment Setup**

* **Objective:** Deploy the Move smart contracts developed on Local/Devnet to the Sui Testnet.  
* **Details:**  
  * Final code review of the contracts compatible with the latest Sui framework.  
  * Obtain the Package ID on Testnet and establish the frontend connection.  
  * Verify deployment and core functionalities via the Sui Explorer.

### **2\. Gasless NFT Minting Implementation (Sponsored Transactions)**

* **Objective:** Allow users to mint their dynamic NFT (KIAI Badge) without paying a single drop of SUI for gas.  
* **Details:**  
  * Construct the signature flow using Sui's **Sponsored Transactions**.  
  * Implement the backend logic (or integrate a Gas Station like Shinami) to cover gas fees.  
  * **CRUCIAL:** To bypass strict Japanese gambling laws, we must technically prove that the user has absolutely zero financial output (zero gas fees). This makes it a 100% legal, free-to-play sweepstakes.

### **3\. Multi-Wallet & Zero-Friction Login Integration**

* **Objective:** Seamless onboarding for both Web2 general fans and Web3 natives.  
* **Details:**  
  * **zkLogin:** Implement 1-click login using Google accounts. (This is the killer feature for our pitch).  
  * **Sui dApp Kit:** Integrate standard wallet connections (Sui Wallet, Suiet, Ethos, etc.).  
  * Ensure smooth address retrieval and UI state updates upon successful connection.

---

## **🟦 WANT: Advanced Features (Maximizing Product Value)**

### **4\. Gasless Token Reception (KIAI Energy Distribution)**

* **Objective:** A gasless flow where users instantly receive "KIAI Energy" (voting tokens) upon logging in.  
* **Details:**  
  * On-chain implementation of automatic token distribution (Faucet mechanism) at initial registration.  
  * Provide a UX where the protocol supplies all necessary energy, completely abstracting SUI tokens away from the user.

### **5\. Sentiment Allocation ("Bet" Functionality)**

* **Objective:** On-chain logic allowing users to allocate their KIAI Energy to AI-generated scenarios (Micro-Books).  
* **Details:**  
  * Token allocation (Lock/Stake) function linked to specific Scenario IDs.  
  * Prototype the automated reward distribution logic (SBT/Points) triggered by the outcome signals from the AI Agent.  
  * **Note:** To completely remove any "gambling" connotations, please use variable names like `allocate_insight`, `sync_kiai`, or `stake_energy` in the codebase instead of `bet` or `gamble`.

---

## **📝 Tech Stack & Reference**

* **Smart Contract:** Move (Sui)  
* **Frontend SDK:** Sui dApp Kit, Mysten Labs zkLogin SDK  
* **Backend:** Gas sponsorship logic (e.g., Shinami API or self-hosted gas station)

