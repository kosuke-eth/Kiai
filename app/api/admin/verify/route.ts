import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminSessionResponse, isAdminAuthConfigured, verifyAdminChallenge } from "@/lib/admin-auth"

const verifySchema = z.object({
  address: z.string().min(1),
  message: z.string().min(1),
  signature: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    if (!isAdminAuthConfigured()) {
      return new NextResponse("Admin auth is not configured", { status: 503 })
    }

    const input = verifySchema.parse(await request.json())
    const { address } = await verifyAdminChallenge(input)
    return createAdminSessionResponse(address)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify admin challenge"
    return new NextResponse(message, { status: 403 })
  }
}
