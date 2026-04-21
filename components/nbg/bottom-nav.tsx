"use client";

import { motion } from "framer-motion";
import { Home, Swords, Trophy, User } from "lucide-react";

type View = "landing" | "matches" | "arena" | "profile";

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems = [
  { id: "landing" as const, label: "Home", icon: Home },
  { id: "matches" as const, label: "Matches", icon: Swords },
  { id: "profile" as const, label: "Profile", icon: User },
];

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  // Don't show nav on landing
  if (currentView === "landing") return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50"
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === "matches" && currentView === "arena");
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs relative z-10 transition-colors ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </motion.nav>
  );
}
