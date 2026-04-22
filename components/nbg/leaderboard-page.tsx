"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Award, ChevronDown, ChevronUp, Coins, Crown, Flame, Medal, Minus, Trophy, TrendingUp } from "lucide-react"

import { useKiaiAddress } from "@/hooks/use-kiai-address"
import { useKiaiProfile } from "@/hooks/use-kiai-profile"
import { kiaiApi } from "@/lib/kiai/api"
import type { BadgeTier, LeaderboardEntry } from "@/lib/kiai/types"

const TIER_STYLES: Record<BadgeTier, string> = {
  white: "text-slate-700 bg-slate-100",
  blue: "text-blue-700 bg-blue-100",
  purple: "text-violet-700 bg-violet-100",
  brown: "text-amber-700 bg-amber-100",
  black: "text-zinc-200 bg-zinc-900",
}

function formatTier(tier: BadgeTier) {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-primary" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="font-bold text-muted-foreground">#{rank}</span>
}

function getRankChange(current: number, previous: number) {
  if (current < previous) return { icon: ChevronUp, color: "text-green-500", change: previous - current }
  if (current > previous) return { icon: ChevronDown, color: "text-destructive", change: current - previous }
  return { icon: Minus, color: "text-muted-foreground", change: 0 }
}

export function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "allTime">("weekly")
  const address = useKiaiAddress()
  const { data: profileData } = useKiaiProfile(address)
  const leaderboardQuery = useQuery({
    queryKey: ["kiai-leaderboard", timeframe],
    queryFn: () => kiaiApi.getLeaderboard(),
    refetchInterval: 15_000,
  })

  const leaderboard = leaderboardQuery.data?.leaderboard ?? []
  const myEntry = useMemo<LeaderboardEntry | undefined>(() => {
    const sourceLeaderboard = leaderboardQuery.data?.leaderboard ?? []
    const existingEntry = sourceLeaderboard.find((entry) => entry.address === address)

    if (existingEntry) {
      return existingEntry
    }

    if (!profileData?.profile) {
      return undefined
    }

    return {
      rank: sourceLeaderboard.length + 1,
      previousRank: Math.max(1, sourceLeaderboard.length + 4),
      username: profileData.profile.displayName ?? "You",
      address,
      points: profileData.profile.points ?? 0,
      correctCalls: profileData.profile.correctCalls ?? 0,
      totalCalls: Math.max(profileData.profile.totalCalls ?? 0, 1),
      streak: profileData.profile.streak ?? 0,
      nfts: profileData.profile.nftCount ?? 0,
      tier: profileData.profile.badgeTier ?? "white",
    }
  }, [address, leaderboardQuery.data?.leaderboard, profileData?.profile])

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-destructive/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                LEADERBOARD
              </h1>
              <p className="text-muted-foreground">
                Live rank updates from settled scenario outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              {(["weekly", "monthly", "allTime"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setTimeframe(value)}
                  className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    timeframe === value
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value === "allTime" ? "All Time" : value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">1st Place</div>
              <div className="text-2xl font-black text-primary">50,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Black Belt NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">2nd Place</div>
              <div className="text-2xl font-black">25,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Brown Belt NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">3rd Place</div>
              <div className="text-2xl font-black">10,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Purple Belt NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Top 10</div>
              <div className="text-2xl font-black">5,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Blue Belt NFT</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  #{myEntry.rank}
                </div>
                <div>
                  <div className="font-bold text-lg">Your rank</div>
                  <div className="text-sm text-muted-foreground">
                    {myEntry.address} • {formatTier(myEntry.tier)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <RankStat label="KP" value={myEntry.points.toLocaleString()} icon={Coins} />
                <RankStat
                  label="Win rate"
                  value={`${Math.round((myEntry.correctCalls / Math.max(myEntry.totalCalls, 1)) * 100)}%`}
                  icon={Trophy}
                />
                <RankStat label="Streak" value={myEntry.streak.toString()} icon={Flame} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-sm font-semibold text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-right">KP</div>
            <div className="col-span-2 text-right">Signal accuracy</div>
            <div className="col-span-1 text-center">Streak</div>
            <div className="col-span-1 text-center">NFTs</div>
            <div className="col-span-2 text-right">Badge</div>
          </div>

          <div className="divide-y divide-border">
            {leaderboard.map((entry, index) => {
              const rankChange = getRankChange(entry.rank, entry.previousRank)
              const RankChangeIcon = rankChange.icon
              const winRate = Math.round((entry.correctCalls / Math.max(entry.totalCalls, 1)) * 100)

              return (
                <motion.div
                  key={`${entry.address}-${entry.rank}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-3 px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors ${
                    entry.rank <= 3 ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="md:col-span-1 flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8">{getRankBadge(entry.rank)}</div>
                    <div className={`flex items-center gap-0.5 text-xs ${rankChange.color}`}>
                      <RankChangeIcon className="w-3 h-3" />
                      {rankChange.change > 0 && rankChange.change}
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">{entry.address}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Coins className="w-4 h-4" />
                      {entry.points.toLocaleString()}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{winRate}%</span>
                      <span className="text-xs text-muted-foreground">
                        ({entry.correctCalls}/{entry.totalCalls})
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-center md:justify-center">
                    <div className="flex items-center gap-1">
                      <Flame className={`w-4 h-4 ${entry.streak >= 5 ? "text-orange-500" : "text-muted-foreground"}`} />
                      <span className="font-semibold">{entry.streak}</span>
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-center md:justify-center">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{entry.nfts}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLES[entry.tier]}`}>
                      {formatTier(entry.tier)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Tier System */}
        <div className="mt-8 p-6 bg-muted/50 border border-dashed border-border rounded-xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badge Tier System
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {(["white", "blue", "purple", "brown", "black"] as const).map((tier) => (
              <div key={tier} className="text-center p-3 bg-card border border-border rounded-lg">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${TIER_STYLES[tier]}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
                <div className="text-sm text-muted-foreground">
                  {tier === "white" && "0 – 5K KP"}
                  {tier === "blue" && "5K – 25K KP"}
                  {tier === "purple" && "25K – 75K KP"}
                  {tier === "brown" && "75K – 150K KP"}
                  {tier === "black" && "150K+ KP"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function RankStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins
  label: string
  value: string
}) {
  return (
    <div className="text-center">
      <div className="flex items-center gap-1 justify-center text-primary">
        <Icon className="w-4 h-4" />
        <span className="text-xl font-bold">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
