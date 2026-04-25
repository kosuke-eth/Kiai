"use client"

import dynamic from "next/dynamic"

const Header = dynamic(() => import("@/components/nbg/header").then((mod) => mod.Header), {
  ssr: false,
})
const MarketplacePage = dynamic(
  () => import("@/components/nbg/marketplace-page").then((mod) => mod.MarketplacePage),
  { ssr: false },
)
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
})

export function MarketplaceClientPage() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <MarketplacePage />
    </main>
  )
}
