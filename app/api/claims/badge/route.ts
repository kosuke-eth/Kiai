import { NextResponse } from "next/server"
import { z } from "zod"

import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { getKiaiStore } from "@/lib/kiai/store"
import { isSuiWriteConfigured } from "@/lib/sui/config"
import { getChainProfile } from "@/lib/sui/read-model"
import { verifyConfirmedTransaction } from "@/lib/sui/verification"

const claimSchema = z.object({
  address: z.string().optional(),
  txDigest: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const { address, txDigest } = claimSchema.parse(await request.json())
    let resolvedAddress = DEFAULT_USER_ADDRESS

    if (isSuiWriteConfigured() && address && address !== DEFAULT_USER_ADDRESS && !txDigest) {
      return new NextResponse("Transaction digest required for on-chain badge claim", { status: 400 })
    }

    if (txDigest && isSuiWriteConfigured()) {
      if (getKiaiStore().hasProcessedDigest(txDigest)) {
        return new NextResponse("Transaction already processed", { status: 409 })
      }

      const verified = await verifyConfirmedTransaction({
        digest: txDigest,
        sender: address,
        kind: "claim_badge",
      })
      resolvedAddress = verified.sender
      const chainProfile = await getChainProfile(resolvedAddress)
      const profile = chainProfile ? getKiaiStore().syncChainProfile(chainProfile) : getKiaiStore().claimBadge(resolvedAddress)
      getKiaiStore().markDigestProcessed(txDigest)
      return NextResponse.json({ profile })
    }

    return NextResponse.json({
      profile: getKiaiStore().claimBadge(resolvedAddress),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to claim badge"
    return new NextResponse(message, { status: 400 })
  }
}
