"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Filter,
  Target,
  Users,
  Flame
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  status: "live" | "upcoming" | "past";
  fightCount: number;
  predictions: number;
  participants: number;
  featured?: boolean;
}

const EVENTS: Event[] = [
  {
    id: "1",
    name: "ONE SAMURAI 1",
    date: "APR 29, 2026",
    time: "2:00PM JST",
    location: "Tokyo, Japan",
    venue: "Ariake Arena",
    status: "live",
    fightCount: 12,
    predictions: 48,
    participants: 3420,
    featured: true,
  },
  {
    id: "2",
    name: "ONE Friday Fights 62",
    date: "MAY 3, 2026",
    time: "7:30PM ICT",
    location: "Bangkok, Thailand",
    venue: "Lumpinee Stadium",
    status: "upcoming",
    fightCount: 10,
    predictions: 32,
    participants: 0,
  },
  {
    id: "3",
    name: "ONE 170",
    date: "MAY 10, 2026",
    time: "6:00PM ICT",
    location: "Bangkok, Thailand",
    venue: "Impact Arena",
    status: "upcoming",
    fightCount: 14,
    predictions: 56,
    participants: 0,
    featured: true,
  },
  {
    id: "4",
    name: "ONE Fight Night 22",
    date: "MAY 17, 2026",
    time: "8:00PM SGT",
    location: "Singapore",
    venue: "Singapore Indoor Stadium",
    status: "upcoming",
    fightCount: 11,
    predictions: 44,
    participants: 0,
  },
  {
    id: "5",
    name: "ONE 169",
    date: "APR 22, 2026",
    time: "6:00PM ICT",
    location: "Bangkok, Thailand",
    venue: "Impact Arena",
    status: "past",
    fightCount: 13,
    predictions: 52,
    participants: 4120,
  },
  {
    id: "6",
    name: "ONE Friday Fights 61",
    date: "APR 18, 2026",
    time: "7:30PM ICT",
    location: "Bangkok, Thailand",
    venue: "Lumpinee Stadium",
    status: "past",
    fightCount: 9,
    predictions: 28,
    participants: 2340,
  },
];

export function EventsPage() {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "past">("all");

  const filteredEvents = EVENTS.filter(
    e => filter === "all" || e.status === filter
  );

  const liveEvents = EVENTS.filter(e => e.status === "live");
  const upcomingEvents = EVENTS.filter(e => e.status === "upcoming");

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Live Event */}
      {liveEvents.length > 0 && (
        <section className="gold-bg">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                  <span className="text-sm font-bold text-black">LIVE NOW</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                  {liveEvents[0].name}
                </h1>
                <p className="text-black/70 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {liveEvents[0].venue}, {liveEvents[0].location}
                </p>
                <div className="flex items-center gap-6 mt-4 text-black/80">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">{liveEvents[0].predictions} predictions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{liveEvents[0].participants.toLocaleString()} participants</span>
                  </div>
                </div>
              </div>
              <Link
                href="/predictions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-lg rounded hover:bg-black/90 transition-colors"
              >
                Join Live Predictions
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">EVENTS</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {(["all", "live", "upcoming", "past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${
                    filter === f
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={event.status === "live" ? "/predictions" : "#"}
                className={`block bg-card border rounded-xl overflow-hidden transition-all hover:border-primary/50 ${
                  event.featured ? "border-primary/30" : "border-border"
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left - Image placeholder */}
                  <div className={`w-full md:w-64 h-32 md:h-auto flex items-center justify-center ${
                    event.status === "live" 
                      ? "bg-gradient-to-br from-primary/30 to-destructive/30" 
                      : "bg-gradient-to-br from-muted to-muted/50"
                  }`}>
                    <span className="text-2xl font-black text-primary/40">KIAI</span>
                  </div>

                  {/* Right - Content */}
                  <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {event.status === "live" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-bold rounded">
                              <Flame className="w-3 h-3" />
                              LIVE
                            </span>
                          ) : event.status === "upcoming" ? (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">
                              UPCOMING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold rounded">
                              COMPLETED
                            </span>
                          )}
                          {event.featured && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                              FEATURED
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date} • {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.venue}, {event.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{event.fightCount}</div>
                          <div className="text-xs text-muted-foreground">Fights</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{event.predictions}</div>
                          <div className="text-xs text-muted-foreground">Predictions</div>
                        </div>
                        {event.participants > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold">{(event.participants / 1000).toFixed(1)}K</div>
                            <div className="text-xs text-muted-foreground">Participants</div>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No events found for this filter.
          </div>
        )}
      </main>
    </div>
  );
}
