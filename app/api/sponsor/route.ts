import { NextResponse } from "next/server"
import { Transaction } from "@mysten/sui/transactions"
import { normalizeSuiAddress, toBase64 } from "@mysten/sui/utils"
import { z } from "zod"

import { assertSponsorRateLimit, verifySponsorChallenge } from "@/lib/sponsor-auth"
import { getAdminKeypair, getSuiClient, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import {
  createAllocateInsightTransaction,
  createClaimBadgeTransaction,
  createClaimEnergyTransaction,
} from "@/lib/sui/transactions"

const sponsorAuthSchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
  token: z.string().min(1),
})

const sponsorSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("claim_badge"),
    sender: z.string().min(1),
    auth: sponsorAuthSchema,
  }),
  z.object({
    action: z.literal("claim_energy"),
    sender: z.string().min(1),
    auth: sponsorAuthSchema,
  }),
  z.object({
    action: z.literal("allocate_insight"),
    sender: z.string().min(1),
    auth: sponsorAuthSchema,
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
    const requestIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

    await verifySponsorChallenge({
      address: normalizedSender,
      message: input.auth.message,
      signature: input.auth.signature,
      token: input.auth.token,
    })
    assertSponsorRateLimit(normalizedSender, requestIp)

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

    const gasPayment = coins.data.slice(0, 8).map((coin) => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      }))

    // Build the programmable transaction first, then attach sponsor gas metadata.
    // Mysten's sponsored-transaction flow requires reconstructing from TransactionKind
    // so sender/gas owner are preserved correctly in the final bytes.
    const transactionKindBytes = await transaction.build({ client, onlyTransactionKind: true })
    const sponsoredTransaction = Transaction.fromKind(transactionKindBytes)

    sponsoredTransaction.setSender(normalizedSender)
    sponsoredTransaction.setGasOwner(sponsorAddress)
    sponsoredTransaction.setGasPayment(gasPayment)

    const transactionBytes = await sponsoredTransaction.build({ client })
    const sponsorSignature = (await sponsor.signTransaction(transactionBytes)).signature
    const sponsoredTransactionJson = await sponsoredTransaction.toJSON({ client })

    return NextResponse.json({
      sponsoredTransaction: sponsoredTransactionJson,
      sponsoredTransactionBytes: toBase64(transactionBytes),
      sponsorSignature,
      sponsorAddress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sponsor transaction"
    const status = message.startsWith("Too many sponsor requests")
      ? 429
      : /challenge|signature|signed sender|requested sender|expired/i.test(message)
        ? 403
        : 400
    return new NextResponse(message, { status })
  }
}
