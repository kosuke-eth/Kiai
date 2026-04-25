import { NextRequest, NextResponse } from "next/server"

import { getKiaiStore } from "@/lib/kiai/store"

export function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") ?? undefined
  const store = getKiaiStore()

  return NextResponse.json({
    items: store.getMarketplaceItems(),
    purchaseHistory: store.getPurchaseHistory(address),
  })
}
