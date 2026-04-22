import { NextResponse } from "next/server"
import { z } from "zod"

import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { getKiaiStore } from "@/lib/kiai/store"
import { isSuiWriteConfigured } from "@/lib/sui/config"
import { verifyConfirmedTransaction } from "@/lib/sui/verification"

const allocationSchema = z.object({
  address: z.string().optional(),
  side: z.enum(["yes", "no"]),
  energyAmount: z.number().int().positive().max(1000),
  txDigest: z.string().optional(),
})

export async function POST(request: Request, ctx: RouteContext<"/api/scenarios/[id]/allocate">) {
  try {
    const { id } = await ctx.params
    const input = allocationSchema.parse(await request.json())
    const { txDigest, address, side, energyAmount } = input
    let resolvedAddress = DEFAULT_USER_ADDRESS
    const scenario = getKiaiStore().getScenario(id)

    if (txDigest && isSuiWriteConfigured()) {
      if (!scenario.chainScenarioId) {
        throw new Error("This scenario is not backed by an onchain ID")
      }

      const verified = await verifyConfirmedTransaction({
        digest: txDigest,
        sender: address,
        kind: "allocate_insight",
        chainScenarioId: scenario.chainScenarioId,
        side,
        energyAmount,
      })
      resolvedAddress = verified.sender
    }

    const result = getKiaiStore().allocateInsight({
      scenarioId: id,
      address: resolvedAddress,
      side,
      energyAmount,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to allocate insight"
    return new NextResponse(message, { status: 400 })
  }
}
