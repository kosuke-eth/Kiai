import { NextResponse } from "next/server"

import { getKiaiStore } from "@/lib/kiai/store"
import { getChainProfile } from "@/lib/sui/read-model"

export async function GET(_: Request, ctx: RouteContext<"/api/profile/[address]">) {
  const { address } = await ctx.params
  const store = getKiaiStore()
  const chainProfile = await getChainProfile(address)

  return NextResponse.json({
    profile: chainProfile ?? store.getProfile(address),
    purchaseHistory: store.getPurchaseHistory(address),
  })
}
