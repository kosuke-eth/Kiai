"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Award, Check, Coins, Gift, Headphones, Shirt, ShoppingBag, Sparkles, Star, Ticket, X } from "lucide-react"
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

function getBadgeColor(badge: string) {
  switch (badge) {
    case "HOT": return "bg-red-500"
    case "EXCLUSIVE": return "bg-purple-500"
    case "LIMITED": return "bg-blue-500"
    case "RARE": return "bg-orange-500"
    case "LEGENDARY": return "bg-gradient-to-r from-yellow-500 to-orange-500"
    case "GOLD": return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    case "VIP": return "bg-primary"
    case "ULTRA RARE": return "bg-gradient-to-r from-purple-500 to-pink-500"
    case "EXCHANGE": return "bg-gradient-to-r from-green-500 to-emerald-500"
    default: return "bg-muted"
  }
}

export function MarketplacePage() {
  const queryClient = useQueryClient()
  const address = useKiaiAddress()
  const { data: profileData } = useKiaiProfile(address)
  const profile = profileData?.profile
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>("all")
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)

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
    <div className="page-shell">
      <div className="page-hero-soft">
        <div className="page-container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="section-kicker mb-3">Redeem rewards</div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">KIAI MARKETPLACE</h1>
              <p className="text-muted-foreground">Redeem KP and badge inventory for event-linked rewards.</p>
            </div>
            <div className="flex items-center gap-6">
              <BalanceCard icon={Coins} label="KIAI Points" value={profile?.points.toLocaleString() ?? "0"} />
              <BalanceCard icon={Award} label="Combat IQ NFTs" value={profile?.nftCount.toString() ?? "0"} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/30">
        <div className="page-container">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="page-container py-8">
        {marketplaceQuery.isLoading && <div className="page-panel p-6">Loading marketplace...</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const ownedCount = purchaseHistory.filter((entry) => entry === item.id).length
            const limitReached = ownedCount >= item.maxPerUser
            const Icon = getCategoryIcon(item.category)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 transition-colors ${limitReached ? "opacity-60" : ""}`}
                onClick={() => !limitReached && setSelectedItem(item)}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  {item.badge && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white ${getBadgeColor(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}
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
                    disabled={limitReached || item.stock <= 0}
                    onClick={(e) => { e.stopPropagation(); if (!limitReached) setSelectedItem(item) }}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {limitReached ? "Redemption limit reached" : "View details"}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Purchase Confirm Modal */}
      <AnimatePresence>
        {selectedItem && (() => {
          const modalOwnedCount = (marketplaceQuery.data?.purchaseHistory ?? []).filter((e) => e === selectedItem.id).length
          const modalLimitReached = modalOwnedCount >= selectedItem.maxPerUser
          const modalCanAffordPoints = (profile?.points ?? 0) >= selectedItem.pointsCost
          const modalCanAffordNfts = (profile?.nftCount ?? 0) >= (selectedItem.nftCount ?? 0)
          const modalCanAfford =
            selectedItem.paymentType === "points"
              ? modalCanAffordPoints
              : selectedItem.paymentType === "nft"
                ? modalCanAffordNfts
                : modalCanAffordPoints && modalCanAffordNfts

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-lg border border-border shadow-xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedItem.badge && (
                    <span className={`absolute top-3 left-3 px-3 py-1 text-sm font-bold text-white ${getBadgeColor(selectedItem.badge)}`}>
                      {selectedItem.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-black mb-2">{selectedItem.name}</h2>
                  <p className="text-muted-foreground mb-6">{selectedItem.description}</p>

                  {/* Price Breakdown */}
                  <div className="bg-muted/50 p-4 rounded-xl mb-6">
                    <h3 className="font-semibold mb-3">Cost breakdown</h3>
                    <div className="space-y-2">
                      {(selectedItem.paymentType === "points" || selectedItem.paymentType === "both") && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-primary" />
                            <span>KIAI Points</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${modalCanAffordPoints ? "text-foreground" : "text-destructive"}`}>
                              {selectedItem.pointsCost.toLocaleString()} KP
                            </span>
                            {modalCanAffordPoints
                              ? <Check className="w-4 h-4 text-green-500" />
                              : <X className="w-4 h-4 text-destructive" />
                            }
                          </div>
                        </div>
                      )}
                      {(selectedItem.paymentType === "nft" || selectedItem.paymentType === "both") && selectedItem.nftCount && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            <span>Combat IQ NFTs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${modalCanAffordNfts ? "text-foreground" : "text-destructive"}`}>
                              {selectedItem.nftCount} NFT{selectedItem.nftCount > 1 ? "s" : ""}
                            </span>
                            {modalCanAffordNfts
                              ? <Check className="w-4 h-4 text-green-500" />
                              : <X className="w-4 h-4 text-destructive" />
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <span>Stock remaining: <strong className="text-foreground">{selectedItem.stock}</strong></span>
                    <span>Redeemed: <strong className="text-foreground">{modalOwnedCount}/{selectedItem.maxPerUser}</strong></span>
                  </div>

                  {/* Redeem Button */}
                  <button
                    type="button"
                    onClick={() => {
                      redeemMutation.mutate(selectedItem.id)
                      setSelectedItem(null)
                    }}
                    disabled={!modalCanAfford || modalLimitReached || redeemMutation.isPending || selectedItem.stock <= 0}
                    className={`w-full py-3 font-bold text-lg transition-colors rounded-xl ${
                      modalCanAfford && !modalLimitReached
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {modalCanAfford && !modalLimitReached ? (
                      <span className="flex items-center justify-center gap-2">
                        <Gift className="w-5 h-5" />
                        Redeem Now
                      </span>
                    ) : modalLimitReached ? "Limit reached" : "Insufficient funds"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
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
    <div className="rounded-2xl border border-border bg-card px-6 py-4 text-center shadow-sm">
      <div className="flex items-center gap-2 justify-center mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-2xl font-black text-foreground">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
