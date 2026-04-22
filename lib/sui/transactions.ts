import { Transaction } from "@mysten/sui/transactions"

import { ENERGY_CLAIM_AMOUNT } from "@/lib/kiai/constants"
import { suiConfig } from "@/lib/sui/config"
import type { ScenarioLifecycleAction, ScenarioSide } from "@/lib/kiai/types"

function requireSuiConfig() {
  if (!suiConfig.packageId || !suiConfig.arenaObjectId) {
    throw new Error("Sui package and arena object IDs must be configured before building transactions")
  }

  return {
    packageId: suiConfig.packageId,
    arenaObjectId: suiConfig.arenaObjectId,
  }
}

function createArenaTransaction() {
  const { packageId, arenaObjectId } = requireSuiConfig()
  const tx = new Transaction()

  return {
    tx,
    target(functionName: string) {
      return `${packageId}::arena::${functionName}`
    },
    arena() {
      return tx.object(arenaObjectId)
    },
  }
}

function sideToBool(side: ScenarioSide) {
  return side === "yes"
}

export function createClaimBadgeTransaction() {
  const { tx, target, arena } = createArenaTransaction()
  tx.moveCall({
    target: target("claim_badge"),
    arguments: [arena()],
  })
  return tx
}

export function createClaimEnergyTransaction(amount = ENERGY_CLAIM_AMOUNT) {
  const { tx, target, arena } = createArenaTransaction()
  tx.moveCall({
    target: target("claim_energy"),
    arguments: [arena(), tx.pure.u64(amount), tx.object.clock()],
  })
  return tx
}

export function createAllocateInsightTransaction(input: {
  chainScenarioId: string
  side: ScenarioSide
  energyAmount: number
}) {
  const { tx, target, arena } = createArenaTransaction()
  tx.moveCall({
    target: target("allocate_insight"),
    arguments: [
      arena(),
      tx.pure.u64(BigInt(input.chainScenarioId)),
      tx.pure.bool(sideToBool(input.side)),
      tx.pure.u64(input.energyAmount),
      tx.object.clock(),
    ],
  })
  return tx
}

export function createAdminScenarioTransaction(input: {
  adminCapId: string
  chainScenarioId: string
  eventId: string
  title: string
  prompt: string
  fighterAName: string
  fighterACountry: string
  fighterBName: string
  fighterBCountry: string
  round: number
  openAtMs: number
  lockAtMs: number
  settleByMs: number
}) {
  const { tx, target, arena } = createArenaTransaction()
  tx.moveCall({
    target: target("create_scenario"),
    arguments: [
      arena(),
      tx.object(input.adminCapId),
      tx.pure.u64(BigInt(input.chainScenarioId)),
      tx.pure.string(input.eventId),
      tx.pure.string(input.title),
      tx.pure.string(input.prompt),
      tx.pure.string(input.fighterAName),
      tx.pure.string(input.fighterACountry),
      tx.pure.string(input.fighterBName),
      tx.pure.string(input.fighterBCountry),
      tx.pure.u64(input.round),
      tx.pure.u64(input.openAtMs),
      tx.pure.u64(input.lockAtMs),
      tx.pure.u64(input.settleByMs),
      tx.object.clock(),
    ],
  })
  return tx
}

export function createAdminLifecycleTransaction(input: {
  adminCapId: string
  chainScenarioId: string
  action: ScenarioLifecycleAction
}) {
  const { tx, target, arena } = createArenaTransaction()
  const functionName =
    input.action === "publish" ? "publish_scenario" : input.action === "lock" ? "lock_scenario" : "archive_scenario"

  tx.moveCall({
    target: target(functionName),
    arguments: [
      arena(),
      tx.object(input.adminCapId),
      tx.pure.u64(BigInt(input.chainScenarioId)),
      tx.object.clock(),
    ],
  })
  return tx
}

export function createAdminSettleTransaction(input: {
  adminCapId: string
  chainScenarioId: string
  winningSide: ScenarioSide
}) {
  const { tx, target, arena } = createArenaTransaction()
  tx.moveCall({
    target: target("settle_scenario"),
    arguments: [
      arena(),
      tx.object(input.adminCapId),
      tx.pure.u64(BigInt(input.chainScenarioId)),
      tx.pure.bool(sideToBool(input.winningSide)),
      tx.object.clock(),
    ],
  })
  return tx
}
