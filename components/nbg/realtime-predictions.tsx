"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Award, Check, Clock3, Coins, Flame, ShieldCheck, Sparkles, Users } from "lucide-react"

import { useKiaiAddress } from "@/hooks/use-kiai-address"
import { useKiaiChainActions } from "@/hooks/use-kiai-chain-actions"
import { useKiaiProfile } from "@/hooks/use-kiai-profile"
import { kiaiApi } from "@/lib/kiai/api"
import type { KiaiScenario, ScenarioSide } from "@/lib/kiai/types"

function getSecondsRemaining(lockAt: string) {
  return Math.max(0, Math.floor((new Date(lockAt).getTime() - Date.now()) / 1000))
}

function getScenarioWindowLabel(scenario: KiaiScenario) {
  if (scenario.state === "settled") return "Settled"
  if (scenario.state === "locked") return "Locked"
  if (scenario.state === "draft") return "Draft"
  const seconds = getSecondsRemaining(scenario.lockAt)
  return `${seconds}s remaining`
}

export function RealtimePredictions() {
  const address = useKiaiAddress()
  const { data: profileData } = useKiaiProfile(address)
  const profile = profileData?.profile
  const { chainReady, claimBadge, claimEnergy, allocateInsight } = useKiaiChainActions(address)

  const [selectedSides, setSelectedSides] = useState<Record<string, ScenarioSide>>({})
  const [energyByScenario, setEnergyByScenario] = useState<Record<string, number>>({})

  const scenariosQuery = useQuery({
    queryKey: ["kiai-scenarios", "active"],
    queryFn: () => kiaiApi.getScenarios({ state: "active" }),
    refetchInterval: 5_000,
  })

  const liveScenarios = useMemo(() => {
    const scenarios = scenariosQuery.data?.scenarios ?? []
    return scenarios.filter((scenario) => scenario.state === "open" || scenario.state === "locked")
  }, [scenariosQuery.data?.scenarios])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-destructive/10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">LIVE SCENARIO SYNC</h1>
              <p className="text-muted-foreground max-w-2xl">
                Claim your badge, load event energy, and allocate your read of the fight before the window locks.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Coins} label="KP" value={profile?.points.toLocaleString() ?? "0"} />
              <StatCard icon={Flame} label="Energy" value={profile?.energy.toString() ?? "0"} />
              <StatCard icon={Award} label="NFTs" value={profile?.nftCount.toString() ?? "0"} />
              <StatCard icon={ShieldCheck} label="Tier" value={(profile?.badgeTier ?? "white").toUpperCase()} />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                Testnet onboarding
              </div>
              <h2 className="mt-2 text-xl font-black">Zero-gas fan flow</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This MVP keeps users on testnet, uses a badge-first flow, and treats allocations as fan signal rather than financial risk.
                {chainReady ? " Wallet-connected actions are now signed onchain before the UI mirror updates." : ""}
              </p>

              <div className="mt-4 space-y-3">
                <ActionButton
                  onClick={() => claimBadge.mutate()}
                  disabled={claimBadge.isPending || !!profile?.badgeClaimed}
                  label={profile?.badgeClaimed ? "Badge claimed" : "Claim KIAI Badge"}
                />
                <ActionButton
                  onClick={() => claimEnergy.mutate()}
                  disabled={claimEnergy.isPending || !profile?.badgeClaimed}
                  label="Claim 600 Energy"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-black">How this screen works</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. Claim your badge once for profile activation.</li>
                <li>2. Claim event energy to participate in live windows.</li>
                <li>3. Allocate energy to YES or NO before the scenario locks.</li>
                <li>4. Operators settle the outcome from the admin console.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            {scenariosQuery.isLoading && <div className="rounded-2xl border border-border bg-card p-6">Loading live scenarios...</div>}

            {!scenariosQuery.isLoading && liveScenarios.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-black">No active scenarios</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Open the admin console and publish a scenario for the live event.
                </p>
              </div>
            )}

            {liveScenarios.map((scenario, index) => {
              const selectedSide = selectedSides[scenario.id]
              const energyAmount = energyByScenario[scenario.id] ?? 100
              const selectionLocked = scenario.state !== "open"

              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        <Clock3 className="w-3.5 h-3.5" />
                        {getScenarioWindowLabel(scenario)}
                      </div>
                      <h2 className="mt-2 text-2xl font-black">{scenario.title}</h2>
                      <p className="mt-2 text-muted-foreground">{scenario.prompt}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Round {scenario.round}</span>
                        <span>{scenario.fighterA.name} vs {scenario.fighterB.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {scenario.participantCount} participants
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-4 h-4 text-primary" />
                          {scenario.totalEnergy} total energy
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                      <div className="text-muted-foreground">Window closes</div>
                      <div className="font-semibold">{new Date(scenario.lockAt).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {(["yes", "no"] as ScenarioSide[]).map((side) => {
                      const isSelected = selectedSide === side
                      return (
                        <button
                          key={side}
                          type="button"
                          disabled={selectionLocked}
                          onClick={() => setSelectedSides((current) => ({ ...current, [scenario.id]: side }))}
                          className={`rounded-2xl border p-4 text-left transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/50"
                          } ${selectionLocked ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              {side}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </div>
                          <div className="mt-2 text-lg font-black">
                            {side === "yes" ? "YES, momentum lands" : "NO, momentum misses"}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-semibold text-muted-foreground" htmlFor={`energy-${scenario.id}`}>
                        Energy allocation
                      </label>
                      <input
                        id={`energy-${scenario.id}`}
                        type="number"
                        min={25}
                        max={Math.max(profile?.energy ?? 25, 25)}
                        step={25}
                        value={energyAmount}
                        disabled={selectionLocked}
                        onChange={(event) =>
                          setEnergyByScenario((current) => ({
                            ...current,
                            [scenario.id]: Number(event.target.value),
                          }))
                        }
                        className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">
                        Available: {profile?.energy ?? 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={
                        selectionLocked ||
                        !selectedSide ||
                        allocateInsight.isPending ||
                        energyAmount <= 0 ||
                        energyAmount > (profile?.energy ?? 0)
                      }
                      onClick={() =>
                        allocateInsight.mutate({
                          scenario,
                          side: selectedSide,
                          energyAmount,
                        })
                      }
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Allocate insight
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  )
}

function ActionButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  )
}
