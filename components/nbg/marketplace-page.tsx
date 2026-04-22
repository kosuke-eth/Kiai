"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Award, Coins, Headphones, Shirt, ShoppingBag, Sparkles, Star, Ticket } from "lucide-react"
import { toast } from "sonner"

import { useKiaiAddress } from "@/hooks/use-kiai-address"
import { useKiaiProfile } from "@/hooks/use-kiai-profile"
import { kiaiApi } from "@/lib/kiai/api"
import type { MarketplaceCategory, MarketplaceItem } from "@/lib/kiai/types"

const CATEGORIES = [
  { id: "all", label: "All Items", icon: ShoppingBag },
  { id: "tickets", label: "Event Tickets", icon: Ticket },
  { id: "merchandise", label: "Merchandise", icon: Shirt },
  { id: "nfts", label: "NFTs", icon: Sparkles },
  { id: "experiences", label: "Experiences", icon: Star },
] as const

function getCategoryIcon(category: MarketplaceItem["category"]) {
  switch (category) {
    case "tickets":
      return Ticket
    case "merchandise":
      return Shirt
    case "nfts":
      return Sparkles
    case "experiences":
      return Headphones
  }
}

export function MarketplacePage() {
  const queryClient = useQueryClient()
  const address = useKiaiAddress()
  const { data: profileData } = useKiaiProfile(address)
  const profile = profileData?.profile
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>("all")

  const marketplaceQuery = useQuery({
    queryKey: ["kiai-marketplace", address],
    queryFn: () => kiaiApi.getMarketplace(address),
    staleTime: 10_000,
  })

  const redeemMutation = useMutation({
    mutationFn: (itemId: string) => kiaiApi.redeemMarketplaceItem({ address, itemId }),
    onSuccess: () => {
      toast.success("Marketplace redemption complete", {
        description: "Your profile balances have been updated.",
      })
      queryClient.invalidateQueries({ queryKey: ["kiai-profile", address] })
      queryClient.invalidateQueries({ queryKey: ["kiai-marketplace", address] })
      queryClient.invalidateQueries({ queryKey: ["kiai-leaderboard"] })
    },
    onError: (error) => {
      toast.error("Unable to redeem reward", { description: error.message })
    },
  })

  const purchaseHistory = marketplaceQuery.data?.purchaseHistory ?? []
  const filteredItems = useMemo(() => {
    const items = marketplaceQuery.data?.items ?? []
    return selectedCategory === "all" ? items : items.filter((item) => item.category === selectedCategory)
  }, [marketplaceQuery.data?.items, selectedCategory])

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">KIAI MARKETPLACE</h1>
              <p className="text-white/70">Redeem KP and badge inventory for event-linked rewards.</p>
            </div>
            <div className="flex items-center gap-6">
              <BalanceCard icon={Coins} label="KIAI Points" value={profile?.points.toLocaleString() ?? "0"} />
              <BalanceCard icon={Award} label="Combat IQ NFTs" value={profile?.nftCount.toString() ?? "0"} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap font-semibold text-sm transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary text-foreground"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {marketplaceQuery.isLoading && <div className="rounded-xl border border-border bg-card p-6">Loading marketplace...</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const ownedCount = purchaseHistory.filter((entry) => entry === item.id).length
            const limitReached = ownedCount >= item.maxPerUser
            const canAffordPoints = (profile?.points ?? 0) >= item.pointsCost
            const canAffordNfts = (profile?.nftCount ?? 0) >= (item.nftCount ?? 0)
            const canAfford =
              item.paymentType === "points"
                ? canAffordPoints
                : item.paymentType === "nft"
                  ? canAffordNfts
                  : canAffordPoints && canAffordNfts
            const Icon = getCategoryIcon(item.category)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border border-border bg-card overflow-hidden ${limitReached ? "opacity-60" : ""}`}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <div className="absolute right-3 top-3 rounded-full bg-black/50 p-2">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black">{item.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cost</span>
                      <div className="flex items-center gap-3 font-semibold">
                        <span>{item.pointsCost.toLocaleString()} KP</span>
                        {item.nftCount ? <span>+ {item.nftCount} NFT</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-semibold">{item.stock} left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Redeemed</span>
                      <span className="font-semibold">
                        {ownedCount}/{item.maxPerUser}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford || limitReached || redeemMutation.isPending || item.stock <= 0}
                    onClick={() => redeemMutation.mutate(item.id)}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {limitReached ? "Redemption limit reached" : canAfford ? "Redeem reward" : "Not enough inventory"}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function BalanceCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins
  label: string
  value: string
}) {
  return (
    <div className="text-center px-6 py-3 bg-white/10 rounded-lg">
      <div className="flex items-center gap-2 justify-center mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-2xl font-black">{value}</span>
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  )
}
