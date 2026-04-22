"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Calendar, ChevronRight, Filter, Flame, MapPin, Target, Users } from "lucide-react"

import { kiaiApi } from "@/lib/kiai/api"
import type { EventStatus } from "@/lib/kiai/types"

export function EventsPage() {
  const [filter, setFilter] = useState<"all" | EventStatus>("all")

  const eventsQuery = useQuery({
    queryKey: ["kiai-events"],
    queryFn: () => kiaiApi.getEvents(),
    staleTime: 10_000,
  })

  const events = eventsQuery.data?.events ?? []
  const filteredEvents = useMemo(() => {
    const sourceEvents = eventsQuery.data?.events ?? []
    return sourceEvents.filter((event) => filter === "all" || event.status === filter)
  }, [eventsQuery.data?.events, filter])
  const liveEvent = events.find((event) => event.status === "live")

  return (
    <div className="min-h-screen bg-background">
      {liveEvent && (
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
                <h1 className="text-4xl md:text-5xl font-black text-black mb-2">{liveEvent.name}</h1>
                <p className="text-black/70 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {liveEvent.venue}, {liveEvent.location}
                </p>
                <div className="flex items-center gap-6 mt-4 text-black/80">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">Live scenario sync enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{liveEvent.participantCount.toLocaleString()} participants</span>
                  </div>
                </div>
              </div>
              <Link
                href="/predictions"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-lg rounded hover:bg-black/90 transition-colors"
              >
                Join Live Sync
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">EVENTS</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {(["all", "live", "upcoming", "past"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${
                    filter === value
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {eventsQuery.isLoading && <div className="rounded-xl border border-border bg-card p-6">Loading events...</div>}

        <div className="grid gap-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={event.status === "live" ? "/predictions" : "/admin"}
                className={`block bg-card border rounded-xl overflow-hidden transition-all hover:border-primary/50 ${
                  event.featured ? "border-primary/30" : "border-border"
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div
                    className={`w-full md:w-64 h-32 md:h-auto flex items-center justify-center ${
                      event.status === "live"
                        ? "bg-gradient-to-br from-primary/30 to-destructive/30"
                        : "bg-gradient-to-br from-muted to-muted/50"
                    }`}
                  >
                    <span className="text-2xl font-black text-primary/40">KIAI</span>
                  </div>

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
                            {event.dateLabel} • {event.timeLabel}
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
                          <div className="text-2xl font-bold">{event.participantCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
