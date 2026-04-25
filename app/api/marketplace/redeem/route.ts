import { NextResponse } from "next/server"
import { z } from "zod"

import { getKiaiStore } from "@/lib/kiai/store"

const redeemSchema = z.object({
  itemId: z.string().min(1),
  address: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const input = redeemSchema.parse(await request.json())
    const result = getKiaiStore().redeemMarketplaceItem(input)
    return NextResponse.json({
      profile: result.profile,
      purchaseHistory: result.history,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to redeem marketplace item"
    return new NextResponse(message, { status: 400 })
  }
}
