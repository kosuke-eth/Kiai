"use client";


import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  ChevronRight,
  Clock,
  Shield,
  Trophy
} from "lucide-react";



const FEATURES = [
  {
    icon: Zap,
    title: "Real-Time Predictions",
    description: "Make split-second calls on specific fight actions. Will they throw a right hook? Land a takedown? Your instincts, rewarded.",
  },
  {
    icon: Clock,
    title: "Short Windows",
    description: "30-90 second prediction windows keep you engaged. Miss one? Another appears instantly.",
  },
  {
    icon: Trophy,
    title: "Earn Points & NFTs",
    description: "Correct predictions earn KP (KIAI Points). Accumulate points to unlock exclusive Combat IQ NFTs.",
  },
  {
    icon: Shield,
    title: "On-Chain Verified",
    description: "All predictions are recorded on Sui blockchain. Transparent, immutable, and fair.",
  },
];

const LIVE_EVENTS = [
  {
    name: "ONE SAMURAI 1",
    location: "Ariake Arena, Tokyo",
    date: "APR 29, 2026",
    status: "live",
    predictions: 24,
  },
  {
    name: "ONE Friday Fights 62",
    location: "Lumpinee Stadium, Bangkok",
    date: "MAY 3, 2026",
    status: "upcoming",
    predictions: 18,
  },
  {
    name: "ONE 170",
    location: "Impact Arena, Bangkok",
    date: "MAY 10, 2026",
    status: "upcoming",
    predictions: 32,
  },
];

export function LandingPage() {
  return (
    <div className="page-shell">
      {/* Hero Section */}
      <section className="page-hero relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
        
        <div className="page-container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="section-kicker mb-4">Live fan signal on Sui</div>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                  LIVE NOW
                </span>

                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 text-balance">
                  PREDICT THE
                  <span className="text-primary"> ACTION</span>
                  <br />
                  EARN THE
                  <span className="text-destructive"> GLORY</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Real-time fight predictions on ONE Championship events. 
                  Call the punches, predict the knockdowns, and earn points and NFTs for your combat IQ.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/predictions" className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg">
                    Start Predicting
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link href="/events" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg">
                    View Events
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right - Live Event Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-primary/75 p-8 shadow-sm md:p-10"
            >
              <div className="mb-6">
                <p className="text-sm text-black/70">APR 29 (WED) 2:00PM JST</p>
                <p className="text-lg font-semibold text-black">Ariake Arena, Tokyo</p>
                <h2 className="text-3xl md:text-4xl font-black text-black mt-2">ONE SAMURAI 1</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/predictions" 
                  className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-black/90"
                >
                  PREDICT NOW
                </Link>
                <Link 
                  href="/events" 
                  className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-black/90"
                >
                  VIEW EVENT
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="text-center mb-12">
            <div className="section-kicker mb-3">Product flow</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">HOW IT WORKS</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Predict specific fight actions in real-time and earn rewards for your combat intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="page-panel p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="border-y border-border bg-muted/30 py-16 md:py-24">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black">UPCOMING EVENTS</h2>
            <Link href="/events" className="text-primary font-semibold text-sm flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {LIVE_EVENTS.map((event, index) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="page-panel group overflow-hidden transition-colors hover:border-primary/50"
              >
                <div className="flex h-32 items-end justify-between bg-gradient-to-br from-primary/20 to-destructive/10 px-5 py-4">
                  <span className="section-kicker text-primary/70">Event card</span>
                  <span className="text-2xl font-black text-primary/35">KIAI</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {event.status === "live" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        UPCOMING
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{event.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {event.predictions} predictions
                    </span>
                    <Link 
                      href="/predictions"
                      className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:underline"
                    >
                      Predict <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-balance">
            READY TO TEST YOUR
            <span className="text-primary"> COMBAT IQ</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of fight fans making real-time predictions on ONE Championship events. 
            Your instincts could earn you points and exclusive NFTs.
          </p>
          <Link href="/predictions" className="btn-primary inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg">
            Enter The Arena
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
