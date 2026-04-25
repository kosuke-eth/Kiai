import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-auth"
import { getKiaiStore } from "@/lib/kiai/store"
import { executeAdminTransaction, getAdminCapId, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import { createAdminSettleTransaction } from "@/lib/sui/transactions"

const settleSchema = z.object({
  winningSide: z.enum(["yes", "no"]),
})

export async function POST(request: Request, ctx: RouteContext<"/api/scenarios/[id]/settle">) {
  try {
    const adminSession = await requireAdminSession()
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { id } = await ctx.params
    const input = settleSchema.parse(await request.json())
    const existingScenario = getKiaiStore().getScenario(id)
    const chainScenarioId = existingScenario.chainScenarioId
    const usedOnchainSettle = Boolean(isSuiAdminWriteConfigured() && chainScenarioId)

    if (usedOnchainSettle) {
      const transaction = createAdminSettleTransaction({
        adminCapId: getAdminCapId(),
        chainScenarioId: chainScenarioId!,
        winningSide: input.winningSide,
      })

      await executeAdminTransaction(transaction)
    }

    const scenario = getKiaiStore().settleScenario({
      scenarioId: id,
      winningSide: input.winningSide,
      skipPointDistribution: usedOnchainSettle,
    })

    return NextResponse.json({ scenario })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to settle scenario"
    return new NextResponse(message, { status: 400 })
  }
}
