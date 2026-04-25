import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminChallenge, isAdminAuthConfigured } from "@/lib/admin-auth"

const challengeSchema = z.object({
  address: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    if (!isAdminAuthConfigured()) {
      return new NextResponse("Admin auth is not configured", { status: 503 })
    }

    const { address } = challengeSchema.parse(await request.json())
    return NextResponse.json(createAdminChallenge(address))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create admin challenge"
    return new NextResponse(message, { status: 400 })
  }
}
