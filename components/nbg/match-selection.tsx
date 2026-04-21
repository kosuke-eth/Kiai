"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  fighterA: { name: string; record: string; country: string };
  fighterB: { name: string; record: string; country: string };
  event: string;
  weightClass: string;
  time: string;
  isLive: boolean;
  heatLevel: number;
}

const matches: Match[] = [
  {
    id: "1",
    fighterA: { name: "Marcus \"The Titan\" Chen", record: "24-3-0", country: "SG" },
    fighterB: { name: "Hiroshi Tanaka", record: "19-5-1", country: "JP" },
    event: "ONE 169: Tokyo",
    weightClass: "Lightweight",
    time: "LIVE",
    isLive: true,
    heatLevel: 95,
  },
  {
    id: "2",
    fighterA: { name: "Angela \"The Assassin\" Lee", record: "12-2-0", country: "US" },
    fighterB: { name: "Mei Lin", record: "15-3-0", country: "CN" },
    event: "ONE 169: Tokyo",
    weightClass: "Atomweight",
    time: "45 min",
    isLive: false,
    heatLevel: 82,
  },
  {
    id: "3",
    fighterA: { name: "Dmitri Volkov", record: "28-6-0", country: "RU" },
    fighterB: { name: "Christian \"The Warrior\" Santos", record: "22-4-0", country: "PH" },
    event: "ONE 169: Tokyo",
    weightClass: "Heavyweight",
    time: "1h 30min",
    isLive: false,
    heatLevel: 78,
  },
  {
    id: "4",
    fighterA: { name: "Rodtang Jitmuangnon", record: "272-42-10", country: "TH" },
    fighterB: { name: "Jonathan Haggerty", record: "26-4-0", country: "GB" },
    event: "ONE 170: Bangkok",
    weightClass: "Flyweight Muay Thai",
    time: "Tomorrow",
    isLive: false,
    heatLevel: 91,
  },
];

interface MatchSelectionProps {
  onBack: () => void;
  onSelectMatch: (matchId: string) => void;
}

export function MatchSelection({ onBack, onSelectMatch }: MatchSelectionProps) {
  return (
    <section className="min-h-screen bg-background px-4 py-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            <span className="gold-text">SELECT</span> YOUR MATCH
          </h1>
          <p className="text-muted-foreground">
            Choose a fight to sync your instincts with the arena
          </p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="default" className="gold-gradient text-primary-foreground cursor-pointer whitespace-nowrap">
            All Matches
          </Badge>
          <Badge variant="outline" className="cursor-pointer border-primary/30 hover:bg-primary/10 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse mr-2" />
            Live Now
          </Badge>
          <Badge variant="outline" className="cursor-pointer border-primary/30 hover:bg-primary/10 whitespace-nowrap">
            MMA
          </Badge>
          <Badge variant="outline" className="cursor-pointer border-primary/30 hover:bg-primary/10 whitespace-nowrap">
            Muay Thai
          </Badge>
          <Badge variant="outline" className="cursor-pointer border-primary/30 hover:bg-primary/10 whitespace-nowrap">
            Kickboxing
          </Badge>
        </div>
      </div>

      {/* Match Cards */}
      <div className="max-w-2xl mx-auto space-y-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => onSelectMatch(match.id)}
              className={`p-4 bg-card border-border cursor-pointer card-hover ${
                match.isLive ? "samurai-border" : ""
              }`}
            >
              {/* Event Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {match.isLive ? (
                    <Badge className="bg-accent text-accent-foreground animate-pulse">
                      LIVE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-border">
                      <Clock className="w-3 h-3 mr-1" />
                      {match.time}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{match.weightClass}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Flame className={`w-4 h-4 ${match.heatLevel > 85 ? "text-accent" : "text-primary"}`} />
                  <span className={match.heatLevel > 85 ? "text-accent" : "text-primary"}>
                    {match.heatLevel}%
                  </span>
                </div>
              </div>

              {/* Fighters */}
              <div className="flex items-center justify-between mb-4">
                {/* Fighter A */}
                <div className="flex-1 text-left">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2 border-2 border-primary/30">
                    <span className="text-lg font-bold">{match.fighterA.country}</span>
                  </div>
                  <p className="font-bold text-sm leading-tight">{match.fighterA.name}</p>
                  <p className="text-xs text-muted-foreground">{match.fighterA.record}</p>
                </div>

                {/* VS */}
                <div className="px-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-black gold-text">VS</span>
                  </div>
                </div>

                {/* Fighter B */}
                <div className="flex-1 text-right">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2 ml-auto border-2 border-accent/30">
                    <span className="text-lg font-bold">{match.fighterB.country}</span>
                  </div>
                  <p className="font-bold text-sm leading-tight">{match.fighterB.name}</p>
                  <p className="text-xs text-muted-foreground">{match.fighterB.record}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{Math.floor(Math.random() * 500 + 100)} synced</span>
                </div>
                <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                  Enter Arena
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
