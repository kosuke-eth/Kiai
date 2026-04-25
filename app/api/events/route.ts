import { NextResponse } from "next/server"

import { getKiaiStore } from "@/lib/kiai/store"

export function GET() {
  return NextResponse.json({
    events: getKiaiStore().getEvents(),
  })
}
