import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-auth"
import { getKiaiStore } from "@/lib/kiai/store"
import { executeAdminTransaction, getAdminCapId, isSuiAdminWriteConfigured } from "@/lib/sui/server"
import { createAdminLifecycleTransaction } from "@/lib/sui/transactions"

const lifecycleSchema = z.object({
  action: z.enum(["publish", "lock", "archive"]),
})

function isChainArchiveStateMismatch(error: unknown) {
  return (
    error instanceof Error &&
    /abort code:\s*5\b|EScenarioCannotArchive|archive_scenario/i.test(error.message)
  )
}

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
      const adminCapId = getAdminCapId()

      try {
        const transaction = createAdminLifecycleTransaction({
          adminCapId,
          chainScenarioId: existingScenario.chainScenarioId,
          action,
        })

        await executeAdminTransaction(transaction)
      } catch (error) {
        // The UI/read model can derive "locked" from elapsed time before the on-chain
        // scenario has been explicitly transitioned out of the open state. In that case,
        // archive must first perform an on-chain lock.
        if (
          action === "archive" &&
          existingScenario.state === "locked" &&
          isChainArchiveStateMismatch(error)
        ) {
          await executeAdminTransaction(
            createAdminLifecycleTransaction({
              adminCapId,
              chainScenarioId: existingScenario.chainScenarioId,
              action: "lock",
            }),
          )

          await executeAdminTransaction(
            createAdminLifecycleTransaction({
              adminCapId,
              chainScenarioId: existingScenario.chainScenarioId,
              action: "archive",
            }),
          )
        } else {
          throw error
        }
      }
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
