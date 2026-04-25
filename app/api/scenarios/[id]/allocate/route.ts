import { NextResponse } from "next/server"
import { z } from "zod"

import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { getKiaiStore } from "@/lib/kiai/store"
import { isSuiWriteConfigured } from "@/lib/sui/config"
import { getChainProfile, listChainScenarios } from "@/lib/sui/read-model"
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
    const scenarioRecord = getKiaiStore().getScenario(id)

    if (isSuiWriteConfigured() && address && address !== DEFAULT_USER_ADDRESS && !txDigest) {
      return new NextResponse("Transaction digest required for on-chain insight allocation", { status: 400 })
    }

    if (txDigest && isSuiWriteConfigured()) {
      if (getKiaiStore().hasProcessedDigest(txDigest)) {
        return new NextResponse("Transaction already processed", { status: 409 })
      }

      if (!scenarioRecord.chainScenarioId) {
        throw new Error("This scenario is not backed by an onchain ID")
      }

      const verified = await verifyConfirmedTransaction({
        digest: txDigest,
        sender: address,
        kind: "allocate_insight",
        chainScenarioId: scenarioRecord.chainScenarioId,
        side,
        energyAmount,
      })
      resolvedAddress = verified.sender
      const [chainScenarios, chainProfile] = await Promise.all([
        listChainScenarios(),
        getChainProfile(resolvedAddress),
      ])

      if (chainScenarios.length > 0) {
        getKiaiStore().syncChainScenarios(chainScenarios)
      }

      const profile = chainProfile ? getKiaiStore().syncChainProfile(chainProfile) : getKiaiStore().getProfile(resolvedAddress)
      const scenario = getKiaiStore().getScenario(id)
      getKiaiStore().markDigestProcessed(txDigest)
      return NextResponse.json({ scenario, profile })
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
