import "server-only"

import { normalizeSuiAddress } from "@mysten/sui/utils"

import { ENERGY_CLAIM_AMOUNT } from "@/lib/kiai/constants"
import { suiConfig } from "@/lib/sui/config"
import { getSuiClient } from "@/lib/sui/server"
import type { ScenarioSide } from "@/lib/kiai/types"

type VerifiedTransactionInput =
  | { digest: string; sender?: string; kind: "claim_badge" }
  | { digest: string; sender?: string; kind: "claim_energy" }
  | { digest: string; sender?: string; kind: "allocate_insight"; chainScenarioId: string; side: ScenarioSide; energyAmount: number }

function sideToBool(side: ScenarioSide) {
  return side === "yes"
}

function isObjectArg(value: unknown): value is { type: "object"; objectId: string; objectType: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      "objectId" in value &&
      "objectType" in value,
  )
}

function isPureArg(value: unknown): value is { type: "pure"; value: unknown } {
  return Boolean(value && typeof value === "object" && "type" in value && "value" in value)
}

function normalizeComparableValue(value: unknown) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : value
  }

  if (typeof value === "string") {
    return value
  }

  return value
}

function expectInputValue(inputs: unknown[], indexLike: unknown) {
  if (!indexLike || typeof indexLike !== "object" || !("Input" in indexLike)) {
    throw new Error("Transaction input does not reference a direct input value")
  }

  const inputIndex = indexLike.Input
  if (typeof inputIndex !== "number") {
    throw new Error("Transaction input index is invalid")
  }

  return inputs[inputIndex]
}

function assertArenaObject(value: unknown) {
  if (!isObjectArg(value) || value.objectType !== "sharedObject") {
    throw new Error("Transaction does not reference the shared Arena object")
  }

  if (normalizeSuiAddress(value.objectId) !== normalizeSuiAddress(suiConfig.arenaObjectId)) {
    throw new Error("Transaction does not reference the configured Arena object")
  }
}

function assertPureValue(value: unknown, expected: unknown, message: string) {
  if (!isPureArg(value) || normalizeComparableValue(value.value) !== normalizeComparableValue(expected)) {
    throw new Error(message)
  }
}

export async function verifyConfirmedTransaction(input: VerifiedTransactionInput) {
  const transaction = await getSuiClient().getTransactionBlock({
    digest: input.digest,
    options: {
      showEffects: true,
      showInput: true,
    },
  })

  if (transaction.effects?.status.status !== "success") {
    throw new Error(transaction.effects?.status.error ?? "Transaction failed onchain")
  }

  if (input.sender && transaction.transaction?.data.sender) {
    const expected = normalizeSuiAddress(input.sender)
    const actual = normalizeSuiAddress(transaction.transaction.data.sender)

    if (expected !== actual) {
      throw new Error("Transaction sender does not match the requested address")
    }
  }

  const sender = transaction.transaction?.data.sender
  if (!sender) {
    throw new Error("Transaction sender is unavailable")
  }

  const transactionData = transaction.transaction?.data.transaction
  if (!transactionData || transactionData.kind !== "ProgrammableTransaction") {
    throw new Error("Transaction is not a programmable transaction")
  }

  if (transactionData.transactions.length !== 1 || !("MoveCall" in transactionData.transactions[0])) {
    throw new Error("Transaction must contain exactly one Move call")
  }

  const moveCall = transactionData.transactions[0].MoveCall
  if (normalizeSuiAddress(moveCall.package) !== normalizeSuiAddress(suiConfig.packageId)) {
    throw new Error("Transaction package does not match the configured KIAI package")
  }

  if (moveCall.module !== "arena") {
    throw new Error("Transaction does not call the arena module")
  }

  const expectedFunction =
    input.kind === "claim_badge"
      ? "claim_badge"
      : input.kind === "claim_energy"
        ? "claim_energy"
        : "allocate_insight"

  if (moveCall.function !== expectedFunction) {
    throw new Error("Transaction function does not match the requested action")
  }

  const [arenaArg, scenarioArg, sideArg, energyArg] = moveCall.arguments ?? []
  const programmableInputs = transactionData.inputs ?? []

  assertArenaObject(expectInputValue(programmableInputs, arenaArg))

  if (input.kind === "claim_energy") {
    assertPureValue(
      expectInputValue(programmableInputs, scenarioArg),
      ENERGY_CLAIM_AMOUNT,
      "Transaction energy amount does not match the configured claim amount",
    )
  }

  if (input.kind === "allocate_insight") {
    assertPureValue(
      expectInputValue(programmableInputs, scenarioArg),
      input.chainScenarioId,
      "Transaction scenario ID does not match the requested scenario",
    )
    assertPureValue(
      expectInputValue(programmableInputs, sideArg),
      sideToBool(input.side),
      "Transaction side does not match the requested allocation",
    )
    assertPureValue(
      expectInputValue(programmableInputs, energyArg),
      input.energyAmount,
      "Transaction energy amount does not match the requested allocation",
    )
  }

  return {
    sender: normalizeSuiAddress(sender),
    transaction,
  }
}
