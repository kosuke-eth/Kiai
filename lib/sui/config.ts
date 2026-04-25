export type SuiNetwork = "testnet" | "mainnet"

const envNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK

export const suiConfig = {
  network: (envNetwork === "mainnet" ? "mainnet" : "testnet") as SuiNetwork,
  packageId: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID ?? "",
  arenaObjectId: process.env.NEXT_PUBLIC_SUI_ARENA_OBJECT_ID ?? "",
  sponsoredTxEndpoint: process.env.NEXT_PUBLIC_SPONSORED_TX_ENDPOINT ?? "",
} as const

export const suiNetworkUrls: Record<SuiNetwork, string> = {
  mainnet: "https://fullnode.mainnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
}

export function getActiveSuiRpcUrl() {
  return suiNetworkUrls[suiConfig.network]
}

export function isSuiWriteConfigured() {
  return Boolean(suiConfig.packageId && suiConfig.arenaObjectId)
}
