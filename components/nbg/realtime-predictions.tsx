"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Users, 
  Zap, 
  Check, 
  ChevronRight, 
  Flame,
  Award,
  Coins
} from "lucide-react";
import { toast } from "sonner";

type PredictionType = 
  | "punch_right"
  | "punch_left"
  | "kick_high"
  | "kick_low"
  | "takedown"
  | "knockdown"
  | "submission"
  | "clinch"
  | "elbow"
  | "knee";

interface ActionPrediction {
  id: string;
  fighter1: { name: string; country: string };
  fighter2: { name: string; country: string };
  round: number;
  actionType: PredictionType;
  question: string;
  options: { id: string; label: string; odds: number }[];
  deadline: number;
  participants: number;
  pointsPool: number;
  status: "active" | "closing" | "closed" | "resolved";
}

const ACTION_QUESTIONS: { type: PredictionType; question: string; options: { id: string; label: string; odds: number }[] }[] = [
  {
    type: "punch_right",
    question: "Will a RIGHT STRAIGHT land in the next 30 seconds?",
    options: [
      { id: "yes", label: "YES - It will land", odds: 1.8 },
      { id: "no", label: "NO - It won't", odds: 2.1 },
    ],
  },
  {
    type: "punch_left",
    question: "Who lands a LEFT HOOK first?",
    options: [
      { id: "fighter1", label: "Fighter A", odds: 1.9 },
      { id: "fighter2", label: "Fighter B", odds: 2.0 },
      { id: "neither", label: "Neither", odds: 3.5 },
    ],
  },
  {
    type: "kick_high",
    question: "HIGH KICK attempt in the next 20 seconds?",
    options: [
      { id: "yes", label: "YES", odds: 2.2 },
      { id: "no", label: "NO", odds: 1.7 },
    ],
  },
  {
    type: "kick_low",
    question: "How many LEG KICKS in the next minute?",
    options: [
      { id: "0-2", label: "0-2 kicks", odds: 2.5 },
      { id: "3-5", label: "3-5 kicks", odds: 1.9 },
      { id: "6+", label: "6+ kicks", odds: 3.2 },
    ],
  },
  {
    type: "takedown",
    question: "TAKEDOWN attempt before round ends?",
    options: [
      { id: "success", label: "Yes, successful", odds: 3.0 },
      { id: "defended", label: "Yes, but defended", odds: 2.4 },
      { id: "none", label: "No attempt", odds: 2.0 },
    ],
  },
  {
    type: "knockdown",
    question: "Will there be a KNOCKDOWN this round?",
    options: [
      { id: "fighter1_down", label: "Fighter A goes down", odds: 4.5 },
      { id: "fighter2_down", label: "Fighter B goes down", odds: 4.2 },
      { id: "no", label: "No knockdown", odds: 1.5 },
    ],
  },
  {
    type: "clinch",
    question: "CLINCH initiated in the next 15 seconds?",
    options: [
      { id: "yes", label: "YES", odds: 1.6 },
      { id: "no", label: "NO", odds: 2.4 },
    ],
  },
  {
    type: "elbow",
    question: "ELBOW strike landed before round ends?",
    options: [
      { id: "yes", label: "YES", odds: 2.8 },
      { id: "no", label: "NO", odds: 1.5 },
    ],
  },
  {
    type: "knee",
    question: "Who throws a KNEE first?",
    options: [
      { id: "fighter1", label: "Fighter A", odds: 2.1 },
      { id: "fighter2", label: "Fighter B", odds: 2.0 },
      { id: "neither", label: "Neither", odds: 2.8 },
    ],
  },
  {
    type: "submission",
    question: "SUBMISSION attempt this round?",
    options: [
      { id: "yes", label: "YES", odds: 5.0 },
      { id: "no", label: "NO", odds: 1.2 },
    ],
  },
];

const FIGHTERS = [
  { name: "Takeru Segawa", country: "JPN" },
  { name: "Superlek", country: "THA" },
  { name: "Rodtang", country: "THA" },
  { name: "Haggerty", country: "GBR" },
  { name: "Tawanchai", country: "THA" },
  { name: "Jo Nattawut", country: "THA" },
  { name: "Stamp Fairtex", country: "THA" },
  { name: "Angela Lee", country: "SGP" },
];

function generatePrediction(id: string): ActionPrediction {
  const actionQ = ACTION_QUESTIONS[Math.floor(Math.random() * ACTION_QUESTIONS.length)];
  const f1Index = Math.floor(Math.random() * FIGHTERS.length);
  let f2Index = Math.floor(Math.random() * FIGHTERS.length);
  while (f2Index === f1Index) f2Index = Math.floor(Math.random() * FIGHTERS.length);

  const fighter1 = FIGHTERS[f1Index];
  const fighter2 = FIGHTERS[f2Index];

  const options = actionQ.options.map(opt => ({
    ...opt,
    label: opt.label.replace("Fighter A", fighter1.name).replace("Fighter B", fighter2.name),
  }));

  return {
    id,
    fighter1,
    fighter2,
    round: Math.floor(Math.random() * 5) + 1,
    actionType: actionQ.type,
    question: actionQ.question,
    options,
    deadline: Math.floor(Math.random() * 40) + 20,
    participants: Math.floor(Math.random() * 200) + 50,
    pointsPool: Math.floor(Math.random() * 5000) + 1000,
    status: "active",
  };
}

export function RealtimePredictions() {
  const [predictions, setPredictions] = useState<ActionPrediction[]>([
    generatePrediction("1"),
    generatePrediction("2"),
    generatePrediction("3"),
    generatePrediction("4"),
  ]);
  const [nextId, setNextId] = useState(5);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [betAmounts, setBetAmounts] = useState<Record<string, number>>({});
  const [confirmedPredictions, setConfirmedPredictions] = useState<Set<string>>(new Set());
  const [confirmedBets, setConfirmedBets] = useState<Record<string, number>>({});
  const [userPoints, setUserPoints] = useState(5000);
  const [nftCount, setNftCount] = useState(0);

  const addNewPrediction = useCallback(() => {
    const newPred = generatePrediction(String(nextId));
    setPredictions(prev => [...prev, newPred]);
    setNextId(prev => prev + 1);
    toast.info("New Prediction Available!", {
      description: newPred.question,
      duration: 3000,
    });
  }, [nextId]);

  // Countdown timer and auto-add new predictions
  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions(prev => {
        let needsNewPredictions = false;
        
        const updated = prev.map(p => {
          if (p.status === "resolved") return p;
          
          const newDeadline = p.deadline - 1;
          
          if (newDeadline <= 0) {
            needsNewPredictions = true;
            if (confirmedPredictions.has(p.id)) {
              const won = Math.random() > 0.45;
              const selectedOpt = p.options.find(o => o.id === selectedOptions[p.id]);
              const betAmount = confirmedBets[p.id] || 0;
              if (won && selectedOpt && betAmount > 0) {
                const earnedPoints = Math.floor(betAmount * selectedOpt.odds);
                setUserPoints(prevPoints => prevPoints + earnedPoints);
                
                if (Math.random() > 0.85) {
                  setNftCount(prevNft => prevNft + 1);
                  toast.success(`NFT Unlocked! +${earnedPoints} KP`, {
                    description: `You bet ${betAmount} KP and won ${earnedPoints} KP! Combat IQ NFT added!`,
                    duration: 5000,
                  });
                } else {
                  toast.success(`+${earnedPoints} KP`, {
                    description: `Correct! You bet ${betAmount} KP x ${selectedOpt.odds} = ${earnedPoints} KP`,
                    duration: 3000,
                  });
                }
              } else if (betAmount > 0) {
                toast.error(`-${betAmount} KP`, {
                  description: "Prediction missed. Better luck next time!",
                  duration: 2000,
                });
              }
            }
            return { ...p, deadline: 0, status: "resolved" as const };
          }
          
          if (newDeadline <= 8) {
            return { ...p, deadline: newDeadline, status: "closing" as const };
          }
          
          return { 
            ...p, 
            deadline: newDeadline,
            participants: p.participants + (Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0),
            pointsPool: p.pointsPool + (Math.random() > 0.6 ? Math.floor(Math.random() * 100) : 0),
          };
        });
        
        const activePredictions = updated.filter(p => p.status !== "resolved");
        
        // Always maintain at least 4 active predictions
        if (activePredictions.length < 4 || needsNewPredictions) {
          const numToAdd = Math.max(4 - activePredictions.length, needsNewPredictions ? 1 : 0);
          for (let i = 0; i < numToAdd; i++) {
            const newPred = generatePrediction(String(Date.now() + i));
            activePredictions.push(newPred);
            if (i === 0) {
              toast.info("New Prediction Available!", {
                description: newPred.question,
                duration: 3000,
              });
            }
          }
        }
        
        return activePredictions;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [confirmedPredictions, selectedOptions, confirmedBets]);

  // Add random new predictions periodically
  useEffect(() => {
    const addRandomPrediction = () => {
      const randomDelay = Math.floor(Math.random() * 4000) + 2000; // 2-6 seconds
      return setTimeout(() => {
        setPredictions(prev => {
          if (prev.length < 6) {
            const newPred = generatePrediction(String(Date.now()));
            toast.info("New Prediction!", {
              description: newPred.question,
              duration: 2000,
            });
            return [...prev, newPred];
          }
          return prev;
        });
        addRandomPrediction();
      }, randomDelay);
    };

    const timeoutId = addRandomPrediction();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSelect = (predictionId: string, optionId: string) => {
    if (confirmedPredictions.has(predictionId)) return;
    setSelectedOptions(prev => ({
      ...prev,
      [predictionId]: prev[predictionId] === optionId ? "" : optionId,
    }));
  };

  const handleBetChange = (predictionId: string, amount: number) => {
    if (confirmedPredictions.has(predictionId)) return;
    setBetAmounts(prev => ({
      ...prev,
      [predictionId]: Math.min(amount, userPoints),
    }));
  };

  const handleConfirm = (predictionId: string) => {
    if (!selectedOptions[predictionId]) return;
    const betAmount = betAmounts[predictionId] || 0;
    if (betAmount <= 0) {
      toast.error("Set your bet amount!", {
        description: "Use the slider to set how many KP to bet.",
        duration: 2000,
      });
      return;
    }
    if (betAmount > userPoints) {
      toast.error("Insufficient KP!", {
        description: `You only have ${userPoints} KP.`,
        duration: 2000,
      });
      return;
    }
    // Deduct bet amount
    setUserPoints(prev => prev - betAmount);
    setConfirmedBets(prev => ({ ...prev, [predictionId]: betAmount }));
    setConfirmedPredictions(prev => new Set([...prev, predictionId]));
    toast.success(`Bet ${betAmount} KP Locked!`, {
      description: "Your prediction has been recorded on-chain.",
      duration: 2000,
    });
  };

  const getTimeColor = (seconds: number) => {
    if (seconds <= 8) return "text-destructive";
    if (seconds <= 20) return "text-[#f59e0b]";
    return "text-foreground";
  };

  const getProgressColor = (seconds: number) => {
    if (seconds <= 8) return "bg-destructive";
    if (seconds <= 20) return "bg-[#f59e0b]";
    return "bg-[#22c55e]";
  };

  const getActionIcon = (type: PredictionType) => {
    switch (type) {
      case "punch_right":
      case "punch_left":
        return "punch";
      case "kick_high":
      case "kick_low":
        return "kick";
      case "knockdown":
        return "down";
      case "takedown":
        return "grapple";
      default:
        return "action";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Event Banner */}
      <div className="bg-[#d4a300] border-b border-[#b8860b]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div>
                <p className="text-sm font-semibold text-black/70">LIVE - ROUND 3</p>
                <h2 className="text-xl md:text-2xl font-black text-black">ONE SAMURAI 1</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 border-r border-black/30">
                <div className="text-2xl font-black text-black">Takeru</div>
                <div className="text-xs text-black/70">JPN</div>
              </div>
              <div className="text-2xl font-black text-black/60">VS</div>
              <div className="text-center px-4 border-l border-black/30">
                <div className="text-2xl font-black text-black">Superlek</div>
                <div className="text-xs text-black/70">THA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Bar */}
      <div className="bg-[#1a1a1a] border-b border-[#333]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#d4a300]" />
                <span className="font-bold text-white">{userPoints.toLocaleString()}</span>
                <span className="text-sm text-white/60">KP</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4a300]" />
                <span className="font-bold text-white">{nftCount}</span>
                <span className="text-sm text-white/60">NFTs</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Zap className="w-4 h-4 text-[#d4a300]" />
              <span>New predictions appear randomly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Fighter Battle Image */}
        <div className="relative mb-6 rounded-xl overflow-hidden">
          <img 
            src="/images/fighters-battle.jpg" 
            alt="Fighters in combat" 
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">ACTION PREDICTIONS</h3>
              <span className="px-2 py-1 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full">
                {predictions.filter(p => p.status !== "resolved").length} active
              </span>
            </div>
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
                className={`bg-card border rounded-xl overflow-hidden ${
                  prediction.status === "closing" 
                    ? "border-destructive shadow-lg shadow-destructive/10" 
                    : "border-border"
                }`}
              >
                {/* Progress bar */}
                <div className="h-1.5 bg-muted">
                  <motion.div
                    className={getProgressColor(prediction.deadline)}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(prediction.deadline / 60) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: "100%" }}
                  />
                </div>

                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                        {prediction.actionType.replace("_", " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Round {prediction.round}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {prediction.participants}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <Coins className="w-4 h-4" />
                        {prediction.pointsPool.toLocaleString()} KP
                      </div>
                      <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${getTimeColor(prediction.deadline)}`}>
                        <Clock className="w-5 h-5" />
                        {prediction.deadline}s
                        {prediction.status === "closing" && (
                          <Flame className="w-5 h-5 text-destructive animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <h4 className="text-lg md:text-xl font-bold">{prediction.question}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prediction.fighter1.name} ({prediction.fighter1.country}) vs {prediction.fighter2.name} ({prediction.fighter2.country})
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {prediction.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(prediction.id, option.id)}
                        disabled={confirmedPredictions.has(prediction.id)}
                        className={`relative p-4 border rounded-lg transition-all text-left ${
                          selectedOptions[prediction.id] === option.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-muted-foreground"
                        } ${confirmedPredictions.has(prediction.id) ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-sm font-bold text-primary">{option.odds}x</span>
                        </div>
                        {selectedOptions[prediction.id] === option.id && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Bet Amount Slider */}
                  {selectedOptions[prediction.id] && !confirmedPredictions.has(prediction.id) && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Bet Amount</span>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="font-bold text-lg">{betAmounts[prediction.id] || 0}</span>
                          <span className="text-sm text-muted-foreground">KP</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.min(userPoints, 1000)}
                        step="10"
                        value={betAmounts[prediction.id] || 0}
                        onChange={(e) => handleBetChange(prediction.id, Number(e.target.value))}
                        className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0 KP</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleBetChange(prediction.id, 50)}
                            className="px-2 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded text-foreground transition-colors"
                          >
                            50
                          </button>
                          <button 
                            onClick={() => handleBetChange(prediction.id, 100)}
                            className="px-2 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded text-foreground transition-colors"
                          >
                            100
                          </button>
                          <button 
                            onClick={() => handleBetChange(prediction.id, 250)}
                            className="px-2 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded text-foreground transition-colors"
                          >
                            250
                          </button>
                          <button 
                            onClick={() => handleBetChange(prediction.id, 500)}
                            className="px-2 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded text-foreground transition-colors"
                          >
                            500
                          </button>
                        </div>
                        <span>{Math.min(userPoints, 1000)} KP</span>
                      </div>
                      {(betAmounts[prediction.id] || 0) > 0 && (
                        <div className="mt-3 p-2 bg-primary/10 rounded text-sm">
                          <span className="text-muted-foreground">Potential win: </span>
                          <span className="font-bold text-primary">
                            {Math.floor((betAmounts[prediction.id] || 0) * (prediction.options.find(o => o.id === selectedOptions[prediction.id])?.odds || 1))} KP
                          </span>
                          <span className="text-muted-foreground"> ({prediction.options.find(o => o.id === selectedOptions[prediction.id])?.odds}x)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirm Button */}
                  <div className="flex justify-end">
                    {confirmedPredictions.has(prediction.id) ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <Check className="w-5 h-5" />
                        Bet {confirmedBets[prediction.id]} KP Locked
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConfirm(prediction.id)}
                        disabled={!selectedOptions[prediction.id] || (betAmounts[prediction.id] || 0) <= 0}
                        className={`btn-primary flex items-center gap-2 ${
                          !selectedOptions[prediction.id] || (betAmounts[prediction.id] || 0) <= 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {(betAmounts[prediction.id] || 0) > 0 
                          ? `Bet ${betAmounts[prediction.id]} KP`
                          : "Set Bet Amount"
                        }
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Reward Info */}
        <div className="mt-8 p-6 bg-muted/50 border border-dashed border-border rounded-xl">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Reward System
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Earn Points (KP)</p>
              <p>Correct predictions earn points based on odds multiplier.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Unlock NFTs</p>
              <p>15% chance to earn a Combat IQ NFT on correct predictions.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Climb Leaderboard</p>
              <p>Top predictors earn bonus rewards each event.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
