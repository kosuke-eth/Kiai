import { Header } from "@/components/nbg/header"
import { MarketplacePage } from "@/components/nbg/marketplace-page"
import { Toaster } from "sonner"

export const metadata = {
  title: "Marketplace - KIAI",
  description: "Exchange your KIAI Points and NFTs for exclusive rewards, event tickets, merchandise, and experiences.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <MarketplacePage />
    </main>
  )
}
