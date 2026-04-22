import { NextResponse } from "next/server"

import { getKiaiStore } from "@/lib/kiai/store"
import { getChainLeaderboard } from "@/lib/sui/read-model"

export async function GET() {
  const store = getKiaiStore()
  const localLeaderboard = store.getLeaderboard()
  const chainLeaderboard = await getChainLeaderboard(localLeaderboard)

  return NextResponse.json({
    leaderboard: chainLeaderboard ?? localLeaderboard,
  })
}
