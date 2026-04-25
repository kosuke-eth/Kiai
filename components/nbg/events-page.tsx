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
    <div className="page-shell">
      {liveEvent && (
        <section className="page-hero-soft">
          <div className="page-container py-10 md:py-14">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <div className="section-kicker mb-3">Live event</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                  <span className="text-sm font-bold text-foreground">LIVE NOW</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">{liveEvent.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {liveEvent.venue}, {liveEvent.location}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-6 text-foreground/80">
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
                className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-black/90"
              >
                Join Live Predictions
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <main className="page-container py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">EVENTS</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="segmented-control">
              {(["all", "live", "upcoming", "past"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`segmented-pill ${
                    filter === value
                      ? "segmented-pill-active"
                      : "segmented-pill-idle"
                  }`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {eventsQuery.isLoading && <div className="page-panel p-6">Loading events...</div>}

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
                className={`page-panel block overflow-hidden transition-all hover:border-primary/50 ${
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
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                              <Flame className="w-3 h-3" />
                              LIVE
                            </span>
                          ) : event.status === "upcoming" ? (
                            <span className="status-chip bg-primary/10 text-primary">
                              UPCOMING
                            </span>
                          ) : (
                            <span className="status-chip bg-muted text-muted-foreground">
                              COMPLETED
                            </span>
                          )}
                          {event.featured && (
                            <span className="status-chip bg-primary text-primary-foreground">
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

        {!eventsQuery.isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No events found for this filter.
          </div>
        )}
      </main>
    </div>
  )
}
