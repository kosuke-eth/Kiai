"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingBag, 
  Ticket, 
  Award, 
  Star, 
  Clock, 
  Check, 
  X,
  Coins,
  Sparkles,
  Gift,
  Crown,
  Shirt,
  Headphones,
  Dumbbell
} from "lucide-react"
import { toast } from "sonner"
import { Header } from "./header"

type ItemCategory = "all" | "tickets" | "merchandise" | "nfts" | "experiences"
type PaymentType = "points" | "nft" | "both"

interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: ItemCategory
  pointsCost: number
  nftRequired?: string
  nftCount?: number
  stock: number
  maxPerUser: number
  image: string
  badge?: string
  endsAt?: Date
  paymentType: PaymentType
  isNftExchange?: boolean
}

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // Tickets
  {
    id: "ticket-1",
    name: "ONE SAMURAI 2 - VIP Ringside",
    description: "VIP ringside seat for ONE SAMURAI 2 at Ariake Arena, Tokyo. Includes meet & greet access.",
    category: "tickets",
    pointsCost: 50000,
    stock: 3,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "HOT",
    paymentType: "points",
  },
  {
    id: "ticket-2",
    name: "ONE SAMURAI 2 - Standard Ticket",
    description: "Standard admission to ONE SAMURAI 2 at Ariake Arena, Tokyo.",
    category: "tickets",
    pointsCost: 15000,
    stock: 15,
    maxPerUser: 2,
    image: "/images/fighters-battle.jpg",
    paymentType: "points",
  },
  {
    id: "ticket-3",
    name: "Fighter Training Camp Access",
    description: "Exclusive access to a ONE Championship fighter training camp. Watch pros prepare for battle.",
    category: "tickets",
    pointsCost: 25000,
    nftRequired: "Combat IQ",
    nftCount: 1,
    stock: 2,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "EXCLUSIVE",
    paymentType: "both",
  },
  // Merchandise
  {
    id: "merch-1",
    name: "KIAI x ONE Samurai Hoodie",
    description: "Limited edition collaboration hoodie featuring the KIAI x ONE Samurai design.",
    category: "merchandise",
    pointsCost: 8000,
    stock: 20,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "LIMITED",
    paymentType: "points",
  },
  {
    id: "merch-2",
    name: "Signed Fighter Gloves",
    description: "Authentic fight gloves signed by a ONE Championship fighter.",
    category: "merchandise",
    pointsCost: 35000,
    nftRequired: "Combat IQ",
    nftCount: 2,
    stock: 5,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "RARE",
    paymentType: "both",
  },
  {
    id: "merch-3",
    name: "KIAI Premium Cap",
    description: "Premium quality cap with embroidered KIAI logo.",
    category: "merchandise",
    pointsCost: 3000,
    stock: 30,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    paymentType: "points",
  },
  {
    id: "merch-4",
    name: "ONE Championship Headphones",
    description: "Wireless noise-cancelling headphones with ONE Championship branding.",
    category: "merchandise",
    pointsCost: 20000,
    stock: 8,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    paymentType: "points",
  },
  // NFTs
  {
    id: "nft-exchange",
    name: "Combat IQ NFT",
    description: "Exchange 1,000 KP for a Combat IQ NFT. Use NFTs to unlock exclusive marketplace items and boost your status.",
    category: "nfts",
    pointsCost: 1000,
    stock: 50,
    maxPerUser: 10,
    image: "/images/fighters-battle.jpg",
    badge: "EXCHANGE",
    paymentType: "points",
    isNftExchange: true,
  },
  {
    id: "nft-1",
    name: "Legendary Combat IQ NFT",
    description: "Upgrade your Combat IQ NFT to Legendary status. Unlocks exclusive predictions and 2x point multiplier.",
    category: "nfts",
    pointsCost: 100000,
    nftRequired: "Combat IQ",
    nftCount: 5,
    stock: 3,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "LEGENDARY",
    paymentType: "both",
  },
  {
    id: "nft-2",
    name: "Fighter Avatar NFT",
    description: "Exclusive animated fighter avatar NFT for your profile.",
    category: "nfts",
    pointsCost: 12000,
    stock: 25,
    maxPerUser: 2,
    image: "/images/fighters-battle.jpg",
    paymentType: "points",
  },
  {
    id: "nft-3",
    name: "Golden Warrior Badge",
    description: "Rare golden warrior badge NFT. Shows your elite predictor status.",
    category: "nfts",
    pointsCost: 45000,
    nftRequired: "Combat IQ",
    nftCount: 3,
    stock: 10,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "GOLD",
    paymentType: "both",
  },
  // Experiences
  {
    id: "exp-1",
    name: "Virtual Meet & Greet",
    description: "30-minute virtual meeting with a ONE Championship fighter of your choice.",
    category: "experiences",
    pointsCost: 75000,
    stock: 3,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "VIP",
    paymentType: "points",
  },
  {
    id: "exp-2",
    name: "Private Training Session",
    description: "1-hour private training session with a professional ONE fighter or trainer.",
    category: "experiences",
    pointsCost: 150000,
    nftRequired: "Combat IQ",
    nftCount: 5,
    stock: 1,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "ULTRA RARE",
    paymentType: "both",
  },
  {
    id: "exp-3",
    name: "Backstage Pass",
    description: "Exclusive backstage access at any ONE Championship event. See fighters prepare and warm up.",
    category: "experiences",
    pointsCost: 40000,
    stock: 5,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    paymentType: "points",
  },
]

const CATEGORIES = [
  { id: "all", label: "All Items", icon: ShoppingBag },
  { id: "tickets", label: "Event Tickets", icon: Ticket },
  { id: "merchandise", label: "Merchandise", icon: Shirt },
  { id: "nfts", label: "NFTs", icon: Sparkles },
  { id: "experiences", label: "Experiences", icon: Star },
]

export function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("all")
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
  const [userPoints, setUserPoints] = useState(85000)
  const [userNfts, setUserNfts] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState<string[]>([])

  const filteredItems = selectedCategory === "all" 
    ? MARKETPLACE_ITEMS 
    : MARKETPLACE_ITEMS.filter(item => item.category === selectedCategory)

  const canAfford = (item: MarketplaceItem) => {
    if (item.paymentType === "points") {
      return userPoints >= item.pointsCost
    }
    if (item.paymentType === "nft") {
      return userNfts >= (item.nftCount || 1)
    }
    return userPoints >= item.pointsCost && userNfts >= (item.nftCount || 0)
  }

  const handlePurchase = (item: MarketplaceItem) => {
    if (!canAfford(item)) {
      toast.error("Insufficient funds", {
        description: item.paymentType === "both" 
          ? `You need ${item.pointsCost.toLocaleString()} KP and ${item.nftCount} NFTs`
          : item.paymentType === "nft"
          ? `You need ${item.nftCount} Combat IQ NFTs`
          : `You need ${item.pointsCost.toLocaleString()} KP`,
      })
      return
    }

    // Deduct costs
    if (item.paymentType === "points" || item.paymentType === "both") {
      setUserPoints(prev => prev - item.pointsCost)
    }
    if ((item.paymentType === "nft" || item.paymentType === "both") && item.nftCount) {
      setUserNfts(prev => prev - item.nftCount!)
    }

    // If this is an NFT exchange, add NFT to user
    if (item.isNftExchange) {
      setUserNfts(prev => prev + 1)
      toast.success("NFT Minted!", {
        description: "You received 1 Combat IQ NFT. Use it to unlock exclusive items!",
        duration: 5000,
      })
    } else {
      setPurchaseHistory(prev => [...prev, item.id])
      toast.success("Purchase Successful!", {
        description: `${item.name} has been added to your collection.`,
        duration: 5000,
      })
    }

    setSelectedItem(null)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tickets": return Ticket
      case "merchandise": return Shirt
      case "nfts": return Sparkles
      case "experiences": return Star
      default: return ShoppingBag
    }
  }

  const getBadgeColor = (badge: string) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">KIAI MARKETPLACE</h1>
              <p className="text-white/70">Exchange your KP and NFTs for exclusive rewards</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center px-6 py-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-black">{userPoints.toLocaleString()}</span>
                </div>
                <span className="text-xs text-white/60">KIAI Points</span>
              </div>
              <div className="text-center px-6 py-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-black">{userNfts}</span>
                </div>
                <span className="text-xs text-white/60">Combat IQ NFTs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as ItemCategory)}
                className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap font-semibold text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary text-foreground"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const Icon = getCategoryIcon(item.category)
            const owned = purchaseHistory.includes(item.id)
            const affordable = canAfford(item)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer ${
                  owned ? "opacity-60" : ""
                }`}
                onClick={() => !owned && setSelectedItem(item)}
              >
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-muted">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.badge && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-white ${getBadgeColor(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}
                  {owned && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Check className="w-5 h-5" />
                        OWNED
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      {(item.paymentType === "points" || item.paymentType === "both") && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className={`font-bold ${affordable ? "text-foreground" : "text-destructive"}`}>
                            {item.pointsCost.toLocaleString()} KP
                          </span>
                        </div>
                      )}
                      {(item.paymentType === "nft" || item.paymentType === "both") && item.nftCount && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-primary" />
                          <span className={`font-bold text-sm ${userNfts >= item.nftCount ? "text-foreground" : "text-destructive"}`}>
                            +{item.nftCount} NFT{item.nftCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.stock} left
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedItem && (
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
              className="bg-card w-full max-w-lg border border-border shadow-xl rounded-lg overflow-hidden"
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
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-black text-foreground mb-2">{selectedItem.name}</h2>
                <p className="text-muted-foreground mb-6">{selectedItem.description}</p>

                {/* Price Breakdown */}
                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3">Price</h3>
                  <div className="space-y-2">
                    {(selectedItem.paymentType === "points" || selectedItem.paymentType === "both") && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-primary" />
                          <span>KIAI Points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${userPoints >= selectedItem.pointsCost ? "text-foreground" : "text-destructive"}`}>
                            {selectedItem.pointsCost.toLocaleString()} KP
                          </span>
                          {userPoints >= selectedItem.pointsCost ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-destructive" />
                          )}
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
                          <span className={`font-bold ${userNfts >= selectedItem.nftCount ? "text-foreground" : "text-destructive"}`}>
                            {selectedItem.nftCount} NFT{selectedItem.nftCount > 1 ? "s" : ""}
                          </span>
                          {userNfts >= selectedItem.nftCount ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                  <span>Stock remaining: <strong className="text-foreground">{selectedItem.stock}</strong></span>
                  <span>Max per user: <strong className="text-foreground">{selectedItem.maxPerUser}</strong></span>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(selectedItem)}
                  disabled={!canAfford(selectedItem)}
                  className={`w-full py-3 font-bold text-lg transition-colors ${
                    canAfford(selectedItem)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {canAfford(selectedItem) ? (
                    <span className="flex items-center justify-center gap-2">
                      <Gift className="w-5 h-5" />
                      Redeem Now
                    </span>
                  ) : (
                    "Insufficient Funds"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
