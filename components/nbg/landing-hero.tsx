"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onEnterArena: () => void;
}

export function LandingHero({ onEnterArena }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase border border-primary/30 rounded-full text-primary bg-primary/5">
            Sui x ONE Championship
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
        >
          <span className="gold-text">NEXT BOOK</span>
          <br />
          <span className="text-foreground">GENERATOR</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          AI-driven sentiment engine that syncs your fighting instincts with real-time arena energy. 
          Mint your Combat SBT and prove your Combat IQ.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Real-time Insights</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">On-chain SBT</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Combat IQ Rankings</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onEnterArena}
            size="lg"
            className="gold-gradient text-primary-foreground font-bold text-lg px-8 py-6 glow-gold hover:scale-105 transition-transform"
          >
            Enter the Arena
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary/50 text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6"
          >
            Connect Wallet
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black gold-text">12K+</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Warriors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black text-accent">847</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Live Matches</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black gold-text">$2.4M</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Total Volume</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
