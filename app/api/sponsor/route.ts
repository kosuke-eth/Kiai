import { NextResponse } from "next/server"
import { Transaction } from "@mysten/sui/transactions"
import { normalizeSuiAddress, toBase64 } from "@mysten/sui/utils"
import { z } from "zod"

import { getAdminKeypair, getSuiClient, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import {
  createAllocateInsightTransaction,
  createClaimBadgeTransaction,
  createClaimEnergyTransaction,
} from "@/lib/sui/transactions"

const sponsorSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("claim_badge"),
    sender: z.string().min(1),
  }),
  z.object({
    action: z.literal("claim_energy"),
    sender: z.string().min(1),
  }),
  z.object({
    action: z.literal("allocate_insight"),
    sender: z.string().min(1),
    chainScenarioId: z.string().min(1),
    side: z.enum(["yes", "no"]),
    energyAmount: z.number().int().positive().max(1000),
  }),
])

export async function POST(request: Request) {
  try {
    if (!isSuiAdminWriteConfigured()) {
      return new NextResponse("Sponsored transactions are not configured", { status: 503 })
    }

    const input = sponsorSchema.parse(await request.json())
    const client = getSuiClient()
    const sponsor = getAdminKeypair()
    const sponsorAddress = sponsor.toSuiAddress()
    const normalizedSender = normalizeSuiAddress(input.sender)
    const coins = await client.getCoins({ owner: sponsorAddress })

    if (coins.data.length === 0) {
      return new NextResponse("Sponsor wallet has no gas coins", { status: 503 })
    }

    const transaction =
      input.action === "claim_badge"
        ? createClaimBadgeTransaction()
        : input.action === "claim_energy"
          ? createClaimEnergyTransaction()
          : createAllocateInsightTransaction({
              chainScenarioId: input.chainScenarioId,
              side: input.side,
              energyAmount: input.energyAmount,
            })

    transaction.setSender(normalizedSender)
    transaction.setGasOwner(sponsorAddress)
    transaction.setGasPayment(
      coins.data.slice(0, 8).map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      })),
    )

    const transactionBytes = await transaction.build({ client })
    const sponsorSignature = (await sponsor.signTransaction(transactionBytes)).signature
    const sponsoredTransaction = await Transaction.from(transactionBytes).toJSON({ client })

    return NextResponse.json({
      sponsoredTransaction,
      sponsoredTransactionBytes: toBase64(transactionBytes),
      sponsorSignature,
      sponsorAddress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sponsor transaction"
    return new NextResponse(message, { status: 400 })
  }
}
