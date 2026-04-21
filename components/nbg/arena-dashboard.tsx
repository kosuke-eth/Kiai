"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Users,
  Activity,
  CheckCircle2,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ArenaDashboardProps {
  matchId: string;
  onBack: () => void;
  onMintSBT: () => void;
}

export function ArenaDashboard({ onBack, onMintSBT }: ArenaDashboardProps) {
  const [selectedFighter, setSelectedFighter] = useState<"A" | "B" | null>(null);
  const [sentimentA, setSentimentA] = useState(52);
  const [sentimentB, setSentimentB] = useState(48);
  const [arenaEnergy, setArenaEnergy] = useState(78);
  const [roundTime, setRoundTime] = useState(180);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setSentimentA((prev) => Math.max(30, Math.min(70, prev + delta)));
      setSentimentB((prev) => Math.max(30, Math.min(70, prev - delta)));
      setArenaEnergy((prev) => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 2000);

    const timer = setInterval(() => {
      setRoundTime((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSync = () => {
    if (selectedFighter) {
      setHasSubmitted(true);
    }
  };

  return (
    <section className="min-h-screen bg-background px-4 py-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge className="bg-accent text-accent-foreground animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white mr-2" />
            LIVE
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            ONE 169: Tokyo - Round 2
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold">
            <Clock className="w-5 h-5 text-primary" />
            <span className="gold-text">{formatTime(roundTime)}</span>
          </div>
        </motion.div>
      </div>

      {/* Fighter Cards */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Fighter A */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => !hasSubmitted && setSelectedFighter("A")}
          >
            <Card
              className={`p-4 bg-card cursor-pointer transition-all ${
                selectedFighter === "A"
                  ? "border-primary glow-gold"
                  : "border-border hover:border-primary/50"
              } ${hasSubmitted && selectedFighter !== "A" ? "opacity-50" : ""}`}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 border-2 border-primary/30">
                  <span className="text-xl font-bold">SG</span>
                </div>
                <h3 className="font-bold text-sm mb-1">Marcus Chen</h3>
                <p className="text-xs text-muted-foreground mb-3">{"\"The Titan\""}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Sentiment</span>
                    <span className="font-bold gold-text flex items-center gap-1">
                      {sentimentA > 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {sentimentA.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={sentimentA} className="h-2 bg-secondary [&>div]:gold-gradient" />
                </div>

                {selectedFighter === "A" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3"
                  >
                    <Badge className="gold-gradient text-primary-foreground">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Fighter B */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => !hasSubmitted && setSelectedFighter("B")}
          >
            <Card
              className={`p-4 bg-card cursor-pointer transition-all ${
                selectedFighter === "B"
                  ? "border-accent glow-red"
                  : "border-border hover:border-accent/50"
              } ${hasSubmitted && selectedFighter !== "B" ? "opacity-50" : ""}`}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 border-2 border-accent/30">
                  <span className="text-xl font-bold">JP</span>
                </div>
                <h3 className="font-bold text-sm mb-1">Hiroshi Tanaka</h3>
                <p className="text-xs text-muted-foreground mb-3">{"\"The Storm\""}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Sentiment</span>
                    <span className="font-bold text-accent flex items-center gap-1">
                      {sentimentB > 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {sentimentB.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={sentimentB} className="h-2 bg-secondary [&>div]:bg-accent" />
                </div>

                {selectedFighter === "B" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3"
                  >
                    <Badge className="bg-accent text-accent-foreground">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Arena Energy */}
      <div className="max-w-2xl mx-auto mb-6">
        <Card className="p-4 bg-card border-border samurai-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-semibold">Arena Energy</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${arenaEnergy > 85 ? "text-accent animate-pulse" : "text-primary"}`} />
              <span className={`font-bold ${arenaEnergy > 85 ? "text-accent" : "gold-text"}`}>
                {arenaEnergy.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${arenaEnergy > 85 ? "bg-accent" : "gold-gradient"}`}
              initial={{ width: 0 }}
              animate={{ width: `${arenaEnergy}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>342 synced</span>
            </div>
            <span>+12 this round</span>
          </div>
        </Card>
      </div>

      {/* Live Feed */}
      <div className="max-w-2xl mx-auto mb-6">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Live Insights
          </h3>
          <div className="space-y-2 text-sm">
            <AnimatePresence mode="popLayout">
              {[
                { text: "Chen lands a heavy overhand right!", time: "12s ago", hot: true },
                { text: "Tanaka clinches against the cage", time: "28s ago", hot: false },
                { text: "Crowd energy surging!", time: "45s ago", hot: true },
                { text: "Chen controlling the center", time: "1m ago", hot: false },
              ].map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className={insight.hot ? "text-foreground" : "text-muted-foreground"}>
                    {insight.hot && <Flame className="w-3 h-3 text-accent inline mr-1" />}
                    {insight.text}
                  </span>
                  <span className="text-xs text-muted-foreground">{insight.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <div className="max-w-2xl mx-auto">
        {!hasSubmitted ? (
          <Button
            onClick={handleSync}
            disabled={!selectedFighter}
            className="w-full gold-gradient text-primary-foreground font-bold text-lg py-6 glow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5 mr-2" />
            {selectedFighter ? "Sync Your Instinct" : "Select a Fighter"}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 bg-card border-primary glow-gold text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Instinct Synced!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your prediction for {selectedFighter === "A" ? "Marcus Chen" : "Hiroshi Tanaka"} has been recorded.
              </p>
              <Button onClick={onMintSBT} className="gold-gradient text-primary-foreground font-semibold">
                Mint Combat SBT
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
