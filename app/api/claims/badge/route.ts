import { NextResponse } from "next/server"
import { z } from "zod"

import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { getKiaiStore } from "@/lib/kiai/store"
import { isSuiWriteConfigured } from "@/lib/sui/config"
import { verifyConfirmedTransaction } from "@/lib/sui/verification"

const claimSchema = z.object({
  address: z.string().optional(),
  txDigest: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const { address, txDigest } = claimSchema.parse(await request.json())
    let resolvedAddress = DEFAULT_USER_ADDRESS

    if (txDigest && isSuiWriteConfigured()) {
      const verified = await verifyConfirmedTransaction({
        digest: txDigest,
        sender: address,
        kind: "claim_badge",
      })
      resolvedAddress = verified.sender
    }

    return NextResponse.json({
      profile: getKiaiStore().claimBadge(resolvedAddress),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to claim badge"
    return new NextResponse(message, { status: 400 })
  }
}
