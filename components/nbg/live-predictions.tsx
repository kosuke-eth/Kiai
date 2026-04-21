"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Zap, Check, X, ChevronRight, Trophy, Flame } from "lucide-react";
import { toast } from "sonner";

interface Prediction {
  id: string;
  fighter1: { name: string; country: string; record: string };
  fighter2: { name: string; country: string; record: string };
  category: string;
  question: string;
  deadline: number;
  participants: number;
  pool: number;
  status: "active" | "closing" | "closed" | "resolved";
  result?: "fighter1" | "fighter2" | null;
}

const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: "1",
    fighter1: { name: "Takeru Segawa", country: "JPN", record: "44-2-0" },
    fighter2: { name: "Superlek", country: "THA", record: "128-34-2" },
    category: "Kickboxing",
    question: "Who will win by knockout?",
    deadline: 45,
    participants: 234,
    pool: 12500,
    status: "active",
  },
  {
    id: "2",
    fighter1: { name: "Mikey Musumeci", country: "USA", record: "6-0-0" },
    fighter2: { name: "Gabriel Sousa", country: "BRA", record: "7-2-0" },
    category: "Submission Grappling",
    question: "Will the match end by submission?",
    deadline: 30,
    participants: 178,
    pool: 8200,
    status: "closing",
  },
  {
    id: "3",
    fighter1: { name: "Rodtang", country: "THA", record: "270-42-10" },
    fighter2: { name: "Haggerty", country: "GBR", record: "19-4-0" },
    category: "Muay Thai",
    question: "Over or Under 3 rounds?",
    deadline: 60,
    participants: 456,
    pool: 24300,
    status: "active",
  },
];

const UPCOMING_PREDICTIONS: Prediction[] = [
  {
    id: "4",
    fighter1: { name: "Angela Lee", country: "SGP", record: "11-2-0" },
    fighter2: { name: "Stamp Fairtex", country: "THA", record: "7-1-0" },
    category: "MMA",
    question: "Will the fight go to decision?",
    deadline: 90,
    participants: 0,
    pool: 0,
    status: "active",
  },
  {
    id: "5",
    fighter1: { name: "Marcus Almeida", country: "BRA", record: "6-0-0" },
    fighter2: { name: "Reug Reug", country: "SEN", record: "9-2-0" },
    category: "MMA Heavyweight",
    question: "First round finish?",
    deadline: 120,
    participants: 0,
    pool: 0,
    status: "active",
  },
  {
    id: "6",
    fighter1: { name: "Tawanchai", country: "THA", record: "132-31-2" },
    fighter2: { name: "Jo Nattawut", country: "THA", record: "75-16-1" },
    category: "Muay Thai",
    question: "Who lands more strikes?",
    deadline: 75,
    participants: 0,
    pool: 0,
    status: "active",
  },
];

export function LivePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>(INITIAL_PREDICTIONS);
  const [upcomingQueue, setUpcomingQueue] = useState<Prediction[]>(UPCOMING_PREDICTIONS);
  const [selectedPredictions, setSelectedPredictions] = useState<Record<string, "fighter1" | "fighter2" | null>>({});
  const [confirmedPredictions, setConfirmedPredictions] = useState<Set<string>>(new Set());
  const [totalEarnings, setTotalEarnings] = useState(0);

  const addNewPrediction = useCallback(() => {
    if (upcomingQueue.length > 0) {
      const [next, ...rest] = upcomingQueue;
      const newPrediction = {
        ...next,
        deadline: Math.floor(Math.random() * 60) + 30,
        participants: Math.floor(Math.random() * 100) + 50,
        pool: Math.floor(Math.random() * 10000) + 5000,
      };
      setPredictions(prev => [...prev, newPrediction]);
      setUpcomingQueue(rest);
      toast.info("New Prediction Available!", {
        description: `${newPrediction.fighter1.name} vs ${newPrediction.fighter2.name}`,
        duration: 3000,
      });
    }
  }, [upcomingQueue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions(prev => {
        const updated = prev.map(p => {
          if (p.status === "closed" || p.status === "resolved") return p;
          
          const newDeadline = p.deadline - 1;
          
          if (newDeadline <= 0) {
            if (confirmedPredictions.has(p.id)) {
              const won = Math.random() > 0.4;
              if (won) {
                const earnings = Math.floor(p.pool / p.participants * 1.5);
                setTotalEarnings(prev => prev + earnings);
                toast.success(`You won ${earnings.toLocaleString()} SUI!`, {
                  description: `${p.fighter1.name} vs ${p.fighter2.name}`,
                  duration: 4000,
                });
              } else {
                toast.error("Prediction missed", {
                  description: `Better luck next time!`,
                  duration: 3000,
                });
              }
            }
            return { ...p, deadline: 0, status: "resolved" as const };
          }
          
          if (newDeadline <= 10) {
            return { ...p, deadline: newDeadline, status: "closing" as const };
          }
          
          return { 
            ...p, 
            deadline: newDeadline,
            participants: p.participants + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0),
            pool: p.pool + (Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0),
          };
        });
        
        return updated.filter(p => p.status !== "resolved" || Date.now() % 5000 < 1000);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmedPredictions]);

  useEffect(() => {
    const addInterval = setInterval(() => {
      if (predictions.filter(p => p.status === "active" || p.status === "closing").length < 4) {
        addNewPrediction();
      }
    }, 8000);

    return () => clearInterval(addInterval);
  }, [predictions, addNewPrediction]);

  useEffect(() => {
    setPredictions(prev => prev.filter(p => p.status !== "resolved"));
  }, []);

  const handleSelect = (predictionId: string, choice: "fighter1" | "fighter2") => {
    if (confirmedPredictions.has(predictionId)) return;
    setSelectedPredictions(prev => ({
      ...prev,
      [predictionId]: prev[predictionId] === choice ? null : choice,
    }));
  };

  const handleConfirm = (predictionId: string) => {
    if (!selectedPredictions[predictionId]) return;
    setConfirmedPredictions(prev => new Set([...prev, predictionId]));
    toast.success("Prediction Locked!", {
      description: "Your choice has been recorded on-chain.",
      duration: 2000,
    });
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 10) return "text-destructive";
    if (seconds <= 30) return "text-[#f59e0b]";
    return "text-foreground";
  };

  const getProgressColor = (seconds: number) => {
    if (seconds <= 10) return "bg-destructive";
    if (seconds <= 30) return "bg-[#f59e0b]";
    return "bg-[#22c55e]";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black tracking-tight">ONE</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-primary font-semibold">PREDICTIONS</span>
              <span className="text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">EVENTS</span>
              <span className="text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">ATHLETES</span>
              <span className="text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">LEADERBOARD</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {totalEarnings > 0 && (
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded text-primary text-sm font-semibold">
                <Trophy className="w-4 h-4" />
                {totalEarnings.toLocaleString()} SUI
              </div>
            )}
            <button className="btn-primary text-sm py-2">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="gold-bg">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-black/70 mb-1">LIVE NOW</p>
              <h2 className="text-3xl md:text-4xl font-black text-black">ONE SAMURAI 1</h2>
              <p className="text-black/80 mt-1">Ariake Arena, Tokyo</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="countdown-number text-black">00</div>
                <div className="countdown-label text-black/60">DAYS</div>
              </div>
              <div className="text-3xl font-bold text-black/40">:</div>
              <div className="text-center">
                <div className="countdown-number text-black">02</div>
                <div className="countdown-label text-black/60">HRS</div>
              </div>
              <div className="text-3xl font-bold text-black/40">:</div>
              <div className="text-center">
                <div className="countdown-number text-black">34</div>
                <div className="countdown-label text-black/60">MIN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Predictions */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <h3 className="text-xl font-bold">LIVE PREDICTIONS</h3>
            </div>
            <span className="text-muted-foreground text-sm">
              {predictions.filter(p => p.status !== "resolved").length} active
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>New predictions every 30s</span>
          </div>
        </div>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {predictions.filter(p => p.status !== "resolved").map((prediction) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 100 }}
                transition={{ duration: 0.3 }}
                layout
                className={`bg-card border rounded-lg overflow-hidden ${
                  prediction.status === "closing" ? "border-destructive" : "border-border"
                }`}
              >
                {/* Progress bar */}
                <div className="h-1 bg-muted">
                  <motion.div
                    className={getProgressColor(prediction.deadline)}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(prediction.deadline / 90) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: "100%" }}
                  />
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">
                        {prediction.category}
                      </span>
                      <span className="text-sm text-muted-foreground">{prediction.question}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {prediction.participants}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <span className="text-primary">{prediction.pool.toLocaleString()} SUI</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-mono font-bold ${getTimeColor(prediction.deadline)}`}>
                        <Clock className="w-4 h-4" />
                        {prediction.deadline}s
                        {prediction.status === "closing" && (
                          <Flame className="w-4 h-4 text-destructive animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-center">
                    {/* Fighter 1 */}
                    <button
                      onClick={() => handleSelect(prediction.id, "fighter1")}
                      disabled={confirmedPredictions.has(prediction.id) || prediction.status === "closed"}
                      className={`flex items-center justify-between p-4 border rounded transition-all ${
                        selectedPredictions[prediction.id] === "fighter1"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      } ${confirmedPredictions.has(prediction.id) ? "opacity-60" : ""}`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-lg">{prediction.fighter1.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.fighter1.country} • {prediction.fighter1.record}
                        </div>
                      </div>
                      {selectedPredictions[prediction.id] === "fighter1" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>

                    <div className="hidden md:flex items-center justify-center text-2xl font-black text-muted-foreground">
                      VS
                    </div>

                    {/* Fighter 2 */}
                    <button
                      onClick={() => handleSelect(prediction.id, "fighter2")}
                      disabled={confirmedPredictions.has(prediction.id) || prediction.status === "closed"}
                      className={`flex items-center justify-between p-4 border rounded transition-all ${
                        selectedPredictions[prediction.id] === "fighter2"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      } ${confirmedPredictions.has(prediction.id) ? "opacity-60" : ""}`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-lg">{prediction.fighter2.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.fighter2.country} • {prediction.fighter2.record}
                        </div>
                      </div>
                      {selectedPredictions[prediction.id] === "fighter2" && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>

                    {/* Confirm Button */}
                    <div className="flex justify-center md:justify-end">
                      {confirmedPredictions.has(prediction.id) ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                          <Check className="w-5 h-5" />
                          Locked
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConfirm(prediction.id)}
                          disabled={!selectedPredictions[prediction.id] || prediction.status === "closed"}
                          className={`btn-primary flex items-center gap-2 ${
                            !selectedPredictions[prediction.id] ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Confirm
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Upcoming Queue */}
        {upcomingQueue.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              COMING UP NEXT
            </h4>
            <div className="grid gap-3">
              {upcomingQueue.slice(0, 3).map((prediction, index) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 bg-muted/50 border border-dashed border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-semibold">
                        {prediction.fighter1.name} vs {prediction.fighter2.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {prediction.category} • {prediction.question}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Starting soon...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
