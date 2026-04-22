"use client"

import { useMemo, useState } from "react"
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Loader2, LogOut, ShieldAlert, ShieldCheck, TimerReset, Wallet } from "lucide-react"
import { toast } from "sonner"

import { kiaiApi } from "@/lib/kiai/api"
import type { KiaiScenario, ScenarioLifecycleAction } from "@/lib/kiai/types"

const initialForm = {
  eventId: "one-samurai-1",
  title: "Momentum swing window",
  prompt: "Will the next 45 seconds produce a decisive momentum shift?",
  fighterAName: "Takeru Segawa",
  fighterACountry: "JPN",
  fighterBName: "Superlek",
  fighterBCountry: "THA",
  round: 2,
  opensInSeconds: 0,
  lockInSeconds: 45,
}

export function AdminConsolePage() {
  const currentAccount = useCurrentAccount()
  const signPersonalMessage = useSignPersonalMessage()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const adminSessionQuery = useQuery({
    queryKey: ["kiai-admin-session"],
    queryFn: () => kiaiApi.getAdminSession(),
    retry: false,
  })
  const eventsQuery = useQuery({
    queryKey: ["kiai-events"],
    queryFn: () => kiaiApi.getEvents(),
    enabled: adminSessionQuery.data?.authenticated,
  })
  const scenariosQuery = useQuery({
    queryKey: ["kiai-scenarios", "all"],
    queryFn: () => kiaiApi.getScenarios(),
    refetchInterval: 5_000,
    enabled: adminSessionQuery.data?.authenticated,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      kiaiApi.createScenario({
        ...form,
        round: Number(form.round),
        opensInSeconds: Number(form.opensInSeconds),
        lockInSeconds: Number(form.lockInSeconds),
      }),
    onSuccess: () => {
      toast.success("Scenario drafted", { description: "The new scenario is now available in the admin feed." })
      queryClient.invalidateQueries({ queryKey: ["kiai-scenarios"] })
      queryClient.invalidateQueries({ queryKey: ["kiai-events"] })
    },
    onError: (error) => {
      toast.error("Unable to create scenario", { description: error.message })
    },
  })

  const settleMutation = useMutation({
    mutationFn: (input: { scenarioId: string; winningSide: "yes" | "no" }) => kiaiApi.settleScenario(input),
    onSuccess: () => {
      toast.success("Scenario settled", { description: "Leaderboard and profile balances have been recalculated." })
      queryClient.invalidateQueries({ queryKey: ["kiai-scenarios"] })
      queryClient.invalidateQueries({ queryKey: ["kiai-profile"] })
      queryClient.invalidateQueries({ queryKey: ["kiai-leaderboard"] })
    },
    onError: (error) => {
      toast.error("Unable to settle scenario", { description: error.message })
    },
  })

  const lifecycleMutation = useMutation({
    mutationFn: (input: { scenarioId: string; action: ScenarioLifecycleAction }) => kiaiApi.updateScenarioState(input),
    onSuccess: (_, variables) => {
      const message =
        variables.action === "publish"
          ? "Scenario is now open for live allocations."
          : variables.action === "lock"
            ? "Scenario is now locked and ready for settlement."
            : "Scenario moved into the archive."

      toast.success("Scenario lifecycle updated", { description: message })
      queryClient.invalidateQueries({ queryKey: ["kiai-scenarios"] })
      queryClient.invalidateQueries({ queryKey: ["kiai-events"] })
    },
    onError: (error) => {
      toast.error("Unable to update scenario state", { description: error.message })
    },
  })

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      if (!currentAccount?.address) {
        throw new Error("Connect an injected Sui wallet before opening the admin console")
      }

      const challenge = await kiaiApi.createAdminChallenge(currentAccount.address)
      const signed = await signPersonalMessage.mutateAsync({
        message: new TextEncoder().encode(challenge.message),
      })

      return kiaiApi.verifyAdminChallenge({
        address: currentAccount.address,
        message: challenge.message,
        signature: signed.signature,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kiai-admin-session"] })
      await queryClient.invalidateQueries({ queryKey: ["kiai-events"] })
      await queryClient.invalidateQueries({ queryKey: ["kiai-scenarios"] })
      toast.success("Admin session verified", {
        description: "This operator session is now unlocked with your signed Sui wallet challenge.",
      })
    },
    onError: (error) => {
      toast.error("Unable to verify operator wallet", { description: error.message })
    },
  })

  const adminLogoutMutation = useMutation({
    mutationFn: () => kiaiApi.logoutAdminSession(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kiai-admin-session"] })
      toast.success("Admin session cleared", {
        description: "The signed operator session has been removed from this browser.",
      })
    },
    onError: (error) => {
      toast.error("Unable to clear admin session", { description: error.message })
    },
  })

  const orderedScenarios = useMemo(() => {
    const scenarios = scenariosQuery.data?.scenarios ?? []
    return [...scenarios].sort(
      (left, right) => new Date(right.openAt).getTime() - new Date(left.openAt).getTime(),
    )
  }, [scenariosQuery.data?.scenarios])

  if (adminSessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-sidebar/10">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="flex items-center gap-3 text-3xl font-black">
              <ShieldCheck className="w-8 h-8 text-primary" />
              OPERATOR CONSOLE
            </h1>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Checking signed operator session.
          </div>
        </main>
      </div>
    )
  }

  if (!adminSessionQuery.data?.configured) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-sidebar/10">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="flex items-center gap-3 text-3xl font-black">
              <ShieldCheck className="w-8 h-8 text-primary" />
              OPERATOR CONSOLE
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Admin wallet auth is not configured in this environment.
            </p>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Missing operator env
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Configure <code>KIAI_ADMIN_ALLOWLIST</code> and <code>KIAI_ADMIN_SESSION_SECRET</code> to enable the
              signed-wallet operator gate for this hackathon build.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (!adminSessionQuery.data.authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-sidebar/10">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="flex items-center gap-3 text-3xl font-black">
              <ShieldCheck className="w-8 h-8 text-primary" />
              OPERATOR CONSOLE
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Unlock operator controls by signing a short Sui challenge with an allowlisted wallet.
            </p>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Wallet className="h-5 w-5 text-primary" />
              Sui operator sign-in
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              This keeps the hackathon demo visibly Sui-native: no password screen, just a wallet-signed operator
              challenge.
            </p>

            <div className="mt-5 rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              {currentAccount?.address ? (
                <>
                  Connected wallet:
                  <span className="ml-2 font-mono text-foreground">{currentAccount.address}</span>
                </>
              ) : (
                "Connect an injected Sui wallet from the header to continue."
              )}
            </div>

            <button
              type="button"
              onClick={() => adminLoginMutation.mutate()}
              disabled={!currentAccount?.address || adminLoginMutation.isPending}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {adminLoginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying operator wallet
                </>
              ) : (
                "Sign in with Sui wallet"
              )}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-sidebar/10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black">
                <ShieldCheck className="w-8 h-8 text-primary" />
                OPERATOR CONSOLE
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Draft scenarios, push them live, and settle outcomes for the hackathon MVP.
              </p>
            </div>

            <button
              type="button"
              onClick={() => adminLogoutMutation.mutate()}
              disabled={adminLogoutMutation.isPending}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-card/80 disabled:opacity-60"
            >
              {adminLogoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing session
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Create scenario</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Event</span>
              <select
                value={form.eventId}
                onChange={(event) => setForm((current) => ({ ...current, eventId: event.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                {(eventsQuery.data?.events ?? []).map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </label>

            {[
              ["title", "Title"],
              ["prompt", "Prompt"],
              ["fighterAName", "Fighter A"],
              ["fighterACountry", "Country A"],
              ["fighterBName", "Fighter B"],
              ["fighterBCountry", "Country B"],
            ].map(([field, label]) => (
              <label key={field} className="grid gap-1 text-sm">
                <span className="font-semibold">{label}</span>
                <input
                  value={form[field as keyof typeof form] as string}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                />
              </label>
            ))}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["round", "Round"],
                ["opensInSeconds", "Opens in"],
                ["lockInSeconds", "Locks in"],
              ].map(([field, label]) => (
                <label key={field} className="grid gap-1 text-sm">
                  <span className="font-semibold">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={form[field as keyof typeof form] as number}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: Number(event.target.value) }))}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              Draft live scenario
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {orderedScenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">{scenario.state}</div>
                  <h3 className="mt-2 text-xl font-black">{scenario.title}</h3>
                  <p className="mt-2 text-muted-foreground">{scenario.prompt}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>{scenario.fighterA.name} vs {scenario.fighterB.name}</span>
                    <span>Round {scenario.round}</span>
                    <span>{scenario.participantCount} participants</span>
                    <span>{scenario.totalEnergy} total energy</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {scenario.state === "settled" ? (
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-semibold">
                      Winner: {scenario.winningSide?.toUpperCase()}
                    </div>
                  ) : (
                    getLifecycleActions({
                      scenario,
                      onLifecycle: (action) => lifecycleMutation.mutate({ scenarioId: scenario.id, action }),
                      onSettle: (winningSide) => settleMutation.mutate({ scenarioId: scenario.id, winningSide }),
                      busy: lifecycleMutation.isPending || settleMutation.isPending,
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <TimerReset className="w-3.5 h-3.5" />
                  opens {new Date(scenario.openAt).toLocaleString()}
                </span>
                <span>locks {new Date(scenario.lockAt).toLocaleString()}</span>
                <span>settles by {new Date(scenario.settleBy).toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  )
}

function getLifecycleActions({
  scenario,
  onLifecycle,
  onSettle,
  busy,
}: {
  scenario: KiaiScenario
  onLifecycle: (action: ScenarioLifecycleAction) => void
  onSettle: (winningSide: "yes" | "no") => void
  busy: boolean
}) {
  if (scenario.state === "draft") {
    return (
      <>
        <button
          type="button"
          disabled={busy}
          onClick={() => onLifecycle("publish")}
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          Publish now
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onLifecycle("archive")}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Archive
        </button>
      </>
    )
  }

  if (scenario.state === "open") {
    return (
      <>
        <button
          type="button"
          disabled={busy}
          onClick={() => onLifecycle("lock")}
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          Lock now
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSettle("yes")}
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          Settle YES
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSettle("no")}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Settle NO
        </button>
      </>
    )
  }

  if (scenario.state === "locked") {
    return (
      <>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSettle("yes")}
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          Settle YES
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSettle("no")}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Settle NO
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onLifecycle("archive")}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Archive
        </button>
      </>
    )
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onLifecycle("archive")}
      className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
    >
      Archive
    </button>
  )
}
