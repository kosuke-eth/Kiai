"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trophy, Target, TrendingUp, ChevronDown } from "lucide-react";

interface Athlete {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  division: string;
  record: string;
  ranking?: number;
  isChampion?: boolean;
  predictionStats: {
    totalPredictions: number;
    winRate: number;
    avgOdds: number;
  };
}

const ATHLETES: Athlete[] = [
  {
    id: "1",
    name: "Takeru Segawa",
    country: "Japan",
    countryCode: "JPN",
    division: "Flyweight Kickboxing",
    record: "44-2-0",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 2340, winRate: 68, avgOdds: 1.75 },
  },
  {
    id: "2",
    name: "Superlek Kiatmoo9",
    country: "Thailand",
    countryCode: "THA",
    division: "Flyweight Muay Thai",
    record: "128-34-2",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 3120, winRate: 72, avgOdds: 1.65 },
  },
  {
    id: "3",
    name: "Rodtang Jitmuangnon",
    country: "Thailand",
    countryCode: "THA",
    division: "Flyweight Muay Thai",
    record: "270-42-10",
    ranking: 2,
    predictionStats: { totalPredictions: 4500, winRate: 65, avgOdds: 1.85 },
  },
  {
    id: "4",
    name: "Jonathan Haggerty",
    country: "United Kingdom",
    countryCode: "GBR",
    division: "Bantamweight Muay Thai",
    record: "19-4-0",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 1890, winRate: 61, avgOdds: 2.1 },
  },
  {
    id: "5",
    name: "Tawanchai PK Saenchai",
    country: "Thailand",
    countryCode: "THA",
    division: "Featherweight Muay Thai",
    record: "132-31-2",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 2780, winRate: 70, avgOdds: 1.7 },
  },
  {
    id: "6",
    name: "Stamp Fairtex",
    country: "Thailand",
    countryCode: "THA",
    division: "Atomweight MMA",
    record: "7-1-0",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 2100, winRate: 67, avgOdds: 1.9 },
  },
  {
    id: "7",
    name: "Angela Lee",
    country: "Singapore",
    countryCode: "SGP",
    division: "Atomweight MMA",
    record: "11-2-0",
    ranking: 2,
    predictionStats: { totalPredictions: 1650, winRate: 58, avgOdds: 2.2 },
  },
  {
    id: "8",
    name: "Marcus Almeida",
    country: "Brazil",
    countryCode: "BRA",
    division: "Heavyweight MMA",
    record: "6-0-0",
    ranking: 1,
    predictionStats: { totalPredictions: 980, winRate: 75, avgOdds: 1.55 },
  },
  {
    id: "9",
    name: "Mikey Musumeci",
    country: "United States",
    countryCode: "USA",
    division: "Flyweight Submission Grappling",
    record: "6-0-0",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 1420, winRate: 78, avgOdds: 1.45 },
  },
  {
    id: "10",
    name: "Kade Ruotolo",
    country: "United States",
    countryCode: "USA",
    division: "Lightweight Submission Grappling",
    record: "5-0-0",
    ranking: 1,
    isChampion: true,
    predictionStats: { totalPredictions: 1180, winRate: 73, avgOdds: 1.6 },
  },
];

const DIVISIONS = [
  "All Divisions",
  "Heavyweight MMA",
  "Light Heavyweight MMA",
  "Middleweight MMA",
  "Welterweight MMA",
  "Lightweight MMA",
  "Featherweight MMA",
  "Bantamweight MMA",
  "Flyweight MMA",
  "Strawweight MMA",
  "Atomweight MMA",
  "Muay Thai",
  "Kickboxing",
  "Submission Grappling",
];

export function AthletesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");
  const [sortBy, setSortBy] = useState<"ranking" | "predictions" | "winRate">("ranking");

  const filteredAthletes = ATHLETES.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision = selectedDivision === "All Divisions" || 
      athlete.division.includes(selectedDivision.replace(" MMA", "").replace(" ", ""));
    return matchesSearch && matchesDivision;
  }).sort((a, b) => {
    if (sortBy === "predictions") return b.predictionStats.totalPredictions - a.predictionStats.totalPredictions;
    if (sortBy === "winRate") return b.predictionStats.winRate - a.predictionStats.winRate;
    return (a.ranking || 99) - (b.ranking || 99);
  });

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-hero-soft">
        <div className="page-container py-10">
          <div className="section-kicker mb-3">Roster view</div>
          <h1 className="text-3xl font-black mb-2">ATHLETES</h1>
          <p className="text-muted-foreground">
            Browse ONE Championship athletes and their prediction statistics
          </p>
        </div>
      </div>

      <main className="page-container py-6">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Division Filter */}
          <div className="relative">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="appearance-none rounded-2xl border border-border bg-card px-4 py-3 pr-10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DIVISIONS.map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="segmented-control">
            {(["ranking", "predictions", "winRate"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`segmented-pill ${
                  sortBy === s
                    ? "segmented-pill-active"
                    : "segmented-pill-idle"
                }`}
              >
                {s === "ranking" ? "Ranking" : s === "predictions" ? "Predictions" : "Win Rate"}
              </button>
            ))}
          </div>
        </div>

        {/* Athletes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAthletes.map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="page-panel overflow-hidden transition-colors hover:border-primary/50"
            >
              {/* Avatar placeholder */}
              <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                <div className="w-20 h-20 rounded-full bg-muted-foreground/20 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {athlete.name.split(" ").map(n => n[0]).join("")}
                </div>
                {athlete.isChampion && (
                  <div className="absolute top-3 right-3 rounded-full border border-primary/30 bg-primary/90 p-1.5">
                    <Trophy className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                {athlete.ranking && (
                  <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/75 px-2.5 py-1 text-xs font-bold text-white">
                    #{athlete.ranking}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{athlete.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {athlete.countryCode} • {athlete.record}
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-sm font-semibold text-primary">{athlete.division}</p>

                {/* Prediction Stats */}
                <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      {(athlete.predictionStats.totalPredictions / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-muted-foreground">Predictions</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      {athlete.predictionStats.winRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">
                      {athlete.predictionStats.avgOdds}x
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Odds</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No athletes found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}
