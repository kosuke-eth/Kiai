import { NextResponse } from "next/server"
import { z } from "zod"

import { createSponsorChallenge } from "@/lib/sponsor-auth"
import { isSuiAdminWriteConfigured } from "@/lib/sui/server"

const challengeSchema = z.object({
  address: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    if (!isSuiAdminWriteConfigured()) {
      return new NextResponse("Sponsored transactions are not configured", { status: 503 })
    }

    const { address } = challengeSchema.parse(await request.json())
    return NextResponse.json(createSponsorChallenge(address))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create sponsor challenge"
    return new NextResponse(message, { status: 400 })
  }
}
