import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-auth"
import { getKiaiStore } from "@/lib/kiai/store"
import { executeAdminTransaction, getAdminCapId, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import { listChainScenarios } from "@/lib/sui/read-model"
import { createAdminScenarioTransaction } from "@/lib/sui/transactions"
import type { ScenarioState } from "@/lib/kiai/types"

const createScenarioSchema = z
  .object({
    eventId: z.string().min(1),
    title: z.string().min(3),
    prompt: z.string().min(8),
    fighterAName: z.string().min(2),
    fighterACountry: z.string().min(2),
    fighterBName: z.string().min(2),
    fighterBCountry: z.string().min(2),
    round: z.number().int().min(1).max(5),
    opensInSeconds: z.number().int().min(0).max(3600).optional(),
    lockInSeconds: z.number().int().min(15).max(3600),
  })
  .refine((input) => (input.opensInSeconds ?? 0) < input.lockInSeconds, {
    message: "Scenario must open before it locks",
    path: ["lockInSeconds"],
  })

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined
  const state = (request.nextUrl.searchParams.get("state") ?? undefined) as ScenarioState | "active" | undefined
  const chainScenarios = await listChainScenarios()
  const scenarios =
    chainScenarios.length > 0
      ? chainScenarios.filter((scenario) => {
          if (eventId && scenario.eventId !== eventId) return false
          if (state === "active") return scenario.state === "open" || scenario.state === "locked"
          if (state) return scenario.state === state
          return true
        })
      : getKiaiStore().listScenarios({
          eventId,
          state,
        })

  return NextResponse.json({
    scenarios,
  })
}

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminSession()
    if (!adminSession.ok) {
      return adminSession.response
    }

    const input = createScenarioSchema.parse(await request.json())
    const scenarioId = crypto.randomUUID()
    const chainScenarioId = Date.now().toString()
    const now = Date.now()
    const openAt = new Date(now + (input.opensInSeconds ?? 0) * 1000)
    const lockAt = new Date(openAt.getTime() + input.lockInSeconds * 1000)
    const settleBy = new Date(lockAt.getTime() + 90 * 1000)
    const state = openAt.getTime() > now ? "draft" : "open"

    if (isSuiAdminWriteConfigured()) {
      const transaction = createAdminScenarioTransaction({
        adminCapId: getAdminCapId(),
        chainScenarioId,
        eventId: input.eventId,
        title: input.title,
        prompt: input.prompt,
        fighterAName: input.fighterAName,
        fighterACountry: input.fighterACountry,
        fighterBName: input.fighterBName,
        fighterBCountry: input.fighterBCountry,
        round: input.round,
        openAtMs: openAt.getTime(),
        lockAtMs: lockAt.getTime(),
        settleByMs: settleBy.getTime(),
      })

      await executeAdminTransaction(transaction)
    }

    const scenario = getKiaiStore().createScenario({
      ...input,
      id: scenarioId,
      chainScenarioId,
      openAt: openAt.toISOString(),
      lockAt: lockAt.toISOString(),
      settleBy: settleBy.toISOString(),
      state,
    })
    return NextResponse.json({ scenario }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create scenario"
    return new NextResponse(message, { status: 400 })
  }
}
