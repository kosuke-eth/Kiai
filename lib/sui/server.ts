import "server-only"

import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import type { Transaction } from "@mysten/sui/transactions"

import { getActiveSuiRpcUrl, isSuiWriteConfigured, suiConfig } from "@/lib/sui/config"

const adminCapId = process.env.SUI_ADMIN_CAP_ID ?? ""
const adminPrivateKey = process.env.SUI_ADMIN_PRIVATE_KEY ?? ""

let clientSingleton: SuiJsonRpcClient | null = null
let adminKeypairSingleton: Ed25519Keypair | null = null

export function isSuiAdminWriteConfigured() {
  return isSuiWriteConfigured() && Boolean(adminCapId && adminPrivateKey)
}

export function getAdminCapId() {
  if (!adminCapId) {
    throw new Error("SUI_ADMIN_CAP_ID is not configured")
  }

  return adminCapId
}

export function getSuiClient() {
  clientSingleton ??= new SuiJsonRpcClient({
    network: suiConfig.network,
    url: getActiveSuiRpcUrl(),
  })

  return clientSingleton
}

export function getAdminKeypair() {
  if (!adminPrivateKey) {
    throw new Error("SUI_ADMIN_PRIVATE_KEY is not configured")
  }

  adminKeypairSingleton ??= Ed25519Keypair.fromSecretKey(adminPrivateKey)
  return adminKeypairSingleton
}

export async function executeAdminTransaction(transaction: Transaction) {
  const client = getSuiClient()
  const signer = getAdminKeypair()
  const result = await client.signAndExecuteTransaction({
    signer,
    transaction,
    options: {
      showEffects: true,
    },
  })

  const status = result.effects?.status.status
  if (status && status !== "success") {
    throw new Error(result.effects?.status.error ?? "Sui admin transaction failed")
  }

  await client.core.waitForTransaction({ digest: result.digest })
  return result
}
