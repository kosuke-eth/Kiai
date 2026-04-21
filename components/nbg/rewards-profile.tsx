"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Flame,
  Shield,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RewardsProfileProps {
  onBack: () => void;
}

const achievements = [
  { name: "First Blood", description: "Make your first prediction", icon: Target, unlocked: true },
  { name: "Hot Streak", description: "5 correct predictions in a row", icon: Flame, unlocked: true },
  { name: "Arena Master", description: "Sync with 50 live matches", icon: Trophy, unlocked: false, progress: 32 },
  { name: "Combat Sage", description: "Reach Diamond rank", icon: Award, unlocked: false, progress: 0 },
];

const recentActivity = [
  { match: "Chen vs Tanaka", result: "WIN", points: "+150", time: "2h ago" },
  { match: "Lee vs Lin", result: "LOSS", points: "-50", time: "5h ago" },
  { match: "Volkov vs Santos", result: "WIN", points: "+120", time: "1d ago" },
  { match: "Rodtang vs Haggerty", result: "WIN", points: "+200", time: "2d ago" },
];

const leaderboard = [
  { rank: 1, name: "SamuraiKing", iq: 2847, change: 0 },
  { rank: 2, name: "ArenaWolf", iq: 2651, change: 2 },
  { rank: 3, name: "CombatOracle", iq: 2598, change: -1 },
  { rank: 4, name: "You", iq: 2456, change: 3, isUser: true },
  { rank: 5, name: "FightSage", iq: 2401, change: -2 },
];

export function RewardsProfile({ onBack }: RewardsProfileProps) {
  return (
    <section className="min-h-screen bg-background px-4 py-6 pb-24">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-card border-border samurai-border">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center glow-gold">
                  <Shield className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <span className="text-xs font-bold text-primary-foreground">47</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">CryptoSamurai</h2>
                  <Badge className="gold-gradient text-primary-foreground text-xs">
                    Platinum
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">0x7f3a...8b2c</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-black gold-text">2,456</p>
                    <p className="text-xs text-muted-foreground">Combat IQ</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">73%</p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-accent">127</p>
                    <p className="text-xs text-muted-foreground">Matches</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level 47</span>
                <span className="text-xs text-muted-foreground">2,340 / 3,000 XP</span>
              </div>
              <Progress value={78} className="h-2 bg-secondary [&>div]:gold-gradient" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Combat SBT */}
      <div className="max-w-2xl mx-auto mb-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Combat SBT
        </h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-primary/30 glow-gold">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg gold-gradient flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-primary-foreground mx-auto" />
                  <span className="text-xs font-bold text-primary-foreground">#4,721</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Platinum Warrior SBT</h4>
                <p className="text-sm text-muted-foreground mb-2">Season 3 - ONE Championship</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-primary">93 Predictions</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-accent">68 Wins</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="max-w-2xl mx-auto mb-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card
                className={`p-4 ${
                  achievement.unlocked
                    ? "bg-card border-primary/30"
                    : "bg-card/50 border-border opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? "gold-gradient" : "bg-secondary"
                    }`}
                  >
                    <achievement.icon
                      className={`w-5 h-5 ${
                        achievement.unlocked ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                    {!achievement.unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
                      <Progress value={(achievement.progress / 50) * 100} className="h-1 mt-2 bg-secondary [&>div]:bg-primary/50" />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto mb-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Combat IQ Leaderboard
        </h3>
        <Card className="bg-card border-border overflow-hidden">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`flex items-center gap-4 p-4 border-b border-border last:border-0 ${
                entry.isUser ? "bg-primary/5" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1
                    ? "gold-gradient text-primary-foreground"
                    : entry.rank === 2
                    ? "bg-gray-400 text-white"
                    : entry.rank === 3
                    ? "bg-amber-700 text-white"
                    : "bg-secondary text-foreground"
                }`}
              >
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${entry.isUser ? "gold-text" : ""}`}>
                  {entry.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{entry.iq.toLocaleString()}</p>
                <p
                  className={`text-xs flex items-center justify-end gap-1 ${
                    entry.change > 0
                      ? "text-green-500"
                      : entry.change < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : entry.change < 0 ? (
                    <TrendingUp className="w-3 h-3 rotate-180" />
                  ) : null}
                  {entry.change !== 0 ? Math.abs(entry.change) : "-"}
                </p>
              </div>
            </motion.div>
          ))}
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <Card className="bg-card border-border">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.result === "WIN" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">{activity.match}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-sm ${
                    activity.result === "WIN" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {activity.points}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    activity.result === "WIN"
                      ? "border-green-500/30 text-green-500"
                      : "border-red-500/30 text-red-500"
                  }`}
                >
                  {activity.result}
                </Badge>
              </div>
            </motion.div>
          ))}
          <div className="p-4">
            <Button variant="ghost" className="w-full text-primary">
              View All History
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
