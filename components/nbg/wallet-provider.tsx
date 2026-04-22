"use client"

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

import { suiConfig, suiNetworkUrls } from "@/lib/sui/config"

const { networkConfig } = createNetworkConfig({
  mainnet: { url: suiNetworkUrls.mainnet, network: "mainnet" },
  testnet: { url: suiNetworkUrls.testnet, network: "testnet" },
})

export function SuiWalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={suiConfig.network}>
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
