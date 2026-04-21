"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Coins, 
  Award,
  TrendingUp,
  Calendar,
  ChevronUp,
  ChevronDown,
  Minus,
  Flame,
  Crown
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  username: string;
  address: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
  streak: number;
  nfts: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, previousRank: 1, username: "SamuraiMaster", address: "0x1a2b...3c4d", points: 128450, correctPredictions: 892, totalPredictions: 1124, streak: 12, nfts: 47, tier: "Diamond" },
  { rank: 2, previousRank: 3, username: "MuayThaiKing", address: "0x5e6f...7g8h", points: 115200, correctPredictions: 756, totalPredictions: 980, streak: 8, nfts: 38, tier: "Diamond" },
  { rank: 3, previousRank: 2, username: "KnockoutPredictor", address: "0x9i0j...1k2l", points: 108750, correctPredictions: 701, totalPredictions: 945, streak: 5, nfts: 35, tier: "Platinum" },
  { rank: 4, previousRank: 5, username: "ONEFanatic", address: "0x3m4n...5o6p", points: 95400, correctPredictions: 623, totalPredictions: 867, streak: 9, nfts: 29, tier: "Platinum" },
  { rank: 5, previousRank: 4, username: "CombatIQ_Pro", address: "0x7q8r...9s0t", points: 89100, correctPredictions: 589, totalPredictions: 812, streak: 3, nfts: 26, tier: "Platinum" },
  { rank: 6, previousRank: 8, username: "StrikeMaster99", address: "0x1u2v...3w4x", points: 78650, correctPredictions: 512, totalPredictions: 723, streak: 7, nfts: 21, tier: "Gold" },
  { rank: 7, previousRank: 6, username: "GrappleGuru", address: "0x5y6z...7a8b", points: 72300, correctPredictions: 478, totalPredictions: 689, streak: 4, nfts: 19, tier: "Gold" },
  { rank: 8, previousRank: 7, username: "TokyoWarrior", address: "0x9c0d...1e2f", points: 68900, correctPredictions: 445, totalPredictions: 654, streak: 6, nfts: 17, tier: "Gold" },
  { rank: 9, previousRank: 11, username: "BangkokBrawler", address: "0x3g4h...5i6j", points: 61200, correctPredictions: 398, totalPredictions: 598, streak: 11, nfts: 14, tier: "Silver" },
  { rank: 10, previousRank: 9, username: "FightAnalyst", address: "0x7k8l...9m0n", points: 58750, correctPredictions: 382, totalPredictions: 576, streak: 2, nfts: 13, tier: "Silver" },
];

const TIER_COLORS: Record<string, string> = {
  Bronze: "text-amber-700 bg-amber-100",
  Silver: "text-gray-600 bg-gray-200",
  Gold: "text-primary bg-primary/10",
  Platinum: "text-cyan-600 bg-cyan-100",
  Diamond: "text-violet-600 bg-violet-100",
};

export function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "allTime">("weekly");
  const [showMyRank, setShowMyRank] = useState(false);

  const myRank: LeaderboardEntry = {
    rank: 156,
    previousRank: 178,
    username: "You",
    address: "0xYOUR...ADDR",
    points: 12450,
    correctPredictions: 89,
    totalPredictions: 134,
    streak: 3,
    nfts: 3,
    tier: "Silver",
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return { icon: ChevronUp, color: "text-green-500", change: previous - current };
    if (current > previous) return { icon: ChevronDown, color: "text-destructive", change: current - previous };
    return { icon: Minus, color: "text-muted-foreground", change: 0 };
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-primary" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-destructive/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                LEADERBOARD
              </h1>
              <p className="text-muted-foreground">
                Top predictors earn bonus points and exclusive NFT rewards
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              {(["weekly", "monthly", "allTime"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    timeframe === t
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "allTime" ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">1st Place</div>
              <div className="text-2xl font-black text-primary">50,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Diamond NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">2nd Place</div>
              <div className="text-2xl font-black">25,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Platinum NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">3rd Place</div>
              <div className="text-2xl font-black">10,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Gold NFT</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Top 10</div>
              <div className="text-2xl font-black">5,000 KP</div>
              <div className="text-xs text-muted-foreground">+ Silver NFT</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* My Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 md:p-6 bg-primary/5 border border-primary/20 rounded-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                #{myRank.rank}
              </div>
              <div>
                <div className="font-bold text-lg">Your Ranking</div>
                <div className="text-sm text-muted-foreground">
                  {myRank.address} • {myRank.tier}
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+22 this week</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{myRank.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">KP</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{Math.round(myRank.correctPredictions / myRank.totalPredictions * 100)}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {myRank.streak}
                </div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{myRank.nfts}</div>
                <div className="text-xs text-muted-foreground">NFTs</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-sm font-semibold text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-right">Points</div>
            <div className="col-span-2 text-right">Win Rate</div>
            <div className="col-span-1 text-center">Streak</div>
            <div className="col-span-1 text-center">NFTs</div>
            <div className="col-span-2 text-right">Tier</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {LEADERBOARD.map((entry, index) => {
              const rankChange = getRankChange(entry.rank, entry.previousRank);
              const RankChangeIcon = rankChange.icon;

              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors ${
                    entry.rank <= 3 ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="md:col-span-1 flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankBadge(entry.rank)}
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs ${rankChange.color}`}>
                      <RankChangeIcon className="w-3 h-3" />
                      {rankChange.change > 0 && rankChange.change}
                    </div>
                  </div>

                  {/* Player */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">{entry.address}</div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Coins className="w-4 h-4" />
                      {entry.points.toLocaleString()}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">
                        {Math.round(entry.correctPredictions / entry.totalPredictions * 100)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({entry.correctPredictions}/{entry.totalPredictions})
                      </span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="md:col-span-1 flex items-center md:justify-center">
                    <div className="flex items-center gap-1">
                      <Flame className={`w-4 h-4 ${entry.streak >= 5 ? "text-orange-500" : "text-muted-foreground"}`} />
                      <span className="font-semibold">{entry.streak}</span>
                    </div>
                  </div>

                  {/* NFTs */}
                  <div className="md:col-span-1 flex items-center md:justify-center">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{entry.nfts}</span>
                    </div>
                  </div>

                  {/* Tier */}
                  <div className="md:col-span-2 flex items-center md:justify-end">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${TIER_COLORS[entry.tier]}`}>
                      {entry.tier}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tier Info */}
        <div className="mt-8 p-6 bg-muted/50 border border-dashed border-border rounded-xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Tier System
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier) => (
              <div key={tier} className="text-center p-3 bg-card border border-border rounded-lg">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${TIER_COLORS[tier]}`}>
                  {tier}
                </span>
                <div className="text-sm text-muted-foreground">
                  {tier === "Bronze" && "0 - 5K KP"}
                  {tier === "Silver" && "5K - 25K KP"}
                  {tier === "Gold" && "25K - 75K KP"}
                  {tier === "Platinum" && "75K - 100K KP"}
                  {tier === "Diamond" && "100K+ KP"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
