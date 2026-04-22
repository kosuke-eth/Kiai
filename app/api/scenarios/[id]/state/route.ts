import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-auth"
import { getKiaiStore } from "@/lib/kiai/store"
import { executeAdminTransaction, getAdminCapId, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import { createAdminLifecycleTransaction } from "@/lib/sui/transactions"

const lifecycleSchema = z.object({
  action: z.enum(["publish", "lock", "archive"]),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminSession = await requireAdminSession()
    if (!adminSession.ok) {
      return adminSession.response
    }

    const { id } = await context.params
    const { action } = lifecycleSchema.parse(await request.json())
    const existingScenario = getKiaiStore().getScenario(id)

    if (isSuiAdminWriteConfigured() && existingScenario.chainScenarioId) {
      const transaction = createAdminLifecycleTransaction({
        adminCapId: getAdminCapId(),
        chainScenarioId: existingScenario.chainScenarioId,
        action,
      })

      await executeAdminTransaction(transaction)
    }

    const scenario = getKiaiStore().updateScenarioLifecycle({
      scenarioId: id,
      action,
    })

    return NextResponse.json({ scenario })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update scenario state"
    return new NextResponse(message, { status: 400 })
  }
}
