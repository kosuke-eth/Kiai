import "server-only"

import type { LeaderboardEntry, KiaiScenario, ScenarioAllocation, ScenarioSide, ScenarioState, UserProfile } from "@/lib/kiai/types"
import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { suiConfig } from "@/lib/sui/config"
import { getSuiClient } from "@/lib/sui/server"
import { isSuiWriteConfigured } from "@/lib/sui/config"

type JsonLike = null | boolean | number | string | JsonLike[] | { [key: string]: JsonLike }

function unwrapFields(value: JsonLike | undefined): JsonLike | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value
  }

  if ("fields" in value) {
    return unwrapFields(value.fields as JsonLike)
  }

  return value
}

function asRecord(value: JsonLike | undefined): Record<string, JsonLike> {
  const unwrapped = unwrapFields(value)
  return unwrapped && typeof unwrapped === "object" && !Array.isArray(unwrapped)
    ? (unwrapped as Record<string, JsonLike>)
    : {}
}

function asArray(value: JsonLike | undefined): JsonLike[] {
  if (Array.isArray(value)) {
    return value
  }

  const record = asRecord(value)
  for (const key of ["contents", "items", "vec", "values", "data"]) {
    if (Array.isArray(record[key])) {
      return record[key] as JsonLike[]
    }
  }

  return []
}

function asString(value: JsonLike | undefined) {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  const record = asRecord(value)
  if ("bytes" in record && typeof record.bytes === "string") {
    return record.bytes
  }

  if ("name" in record && typeof record.name === "string") {
    return record.name
  }

  return ""
}

function asNumber(value: JsonLike | undefined) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0
  }

  return 0
}

function asBoolean(value: JsonLike | undefined) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    return value === "true" || value === "1"
  }

  if (typeof value === "number") {
    return value !== 0
  }

  return false
}

function parseOptionBool(value: JsonLike | undefined): boolean | undefined {
  const entries = asArray(value)
  if (entries.length > 0) {
    return asBoolean(entries[0])
  }

  const record = asRecord(value)
  if ("value" in record) {
    return asBoolean(record.value)
  }

  return undefined
}

function parseOptionNumber(value: JsonLike | undefined): number | undefined {
  const entries = asArray(value)
  if (entries.length > 0) {
    return asNumber(entries[0])
  }

  const record = asRecord(value)
  if ("value" in record) {
    return asNumber(record.value)
  }

  return undefined
}

function scenarioStateFromCode(code: number): ScenarioState {
  switch (code) {
    case 1:
      return "open"
    case 2:
      return "locked"
    case 3:
      return "settled"
    case 4:
      return "archived"
    default:
      return "draft"
  }
}

function deriveScenarioState(code: number, openAtMs: number, lockAtMs: number): ScenarioState {
  const storedState = scenarioStateFromCode(code)
  if (storedState === "settled" || storedState === "archived") {
    return storedState
  }

  const now = Date.now()
  if (now < openAtMs) {
    return "draft"
  }

  return now < lockAtMs ? "open" : "locked"
}

function badgeTierFromCode(code: number): UserProfile["badgeTier"] {
  switch (code) {
    case 1:
      return "blue"
    case 2:
      return "purple"
    case 3:
      return "brown"
    case 4:
      return "black"
    default:
      return "white"
  }
}

function sideFromBool(value: boolean | undefined): ScenarioSide | undefined {
  if (value === undefined) {
    return undefined
  }

  return value ? "yes" : "no"
}

function msToIso(value: number) {
  return new Date(value).toISOString()
}

function formatDisplayName(address: string) {
  return address === DEFAULT_USER_ADDRESS ? "Demo Fighter" : `${address.slice(0, 6)}...${address.slice(-4)}`
}

function parseAllocation(entry: JsonLike): ScenarioAllocation {
  const fields = asRecord(entry)
  return {
    address: asString(fields.owner),
    side: asBoolean(fields.side) ? "yes" : "no",
    energyAmount: asNumber(fields.energy_amount),
    createdAt: msToIso(asNumber(fields.created_at_ms)),
  }
}

function parseProfile(entry: JsonLike): UserProfile {
  const fields = asRecord(entry)
  const address = asString(fields.owner)
  return {
    address,
    displayName: formatDisplayName(address),
    points: asNumber(fields.points),
    energy: asNumber(fields.energy),
    badgeTier: badgeTierFromCode(asNumber(fields.badge_tier)),
    badgeXp: asNumber(fields.badge_xp),
    badgeClaimed: asBoolean(fields.badge_claimed),
    nftCount: asNumber(fields.nft_count),
    correctCalls: asNumber(fields.correct_calls),
    totalCalls: asNumber(fields.total_calls),
    streak: asNumber(fields.streak),
    linkedWalletKind: "injected",
    lastEnergyClaimAt: parseOptionNumber(fields.last_energy_claim_ms)
      ? msToIso(parseOptionNumber(fields.last_energy_claim_ms)!)
      : undefined,
  }
}

function parseScenario(entry: JsonLike): KiaiScenario {
  const fields = asRecord(entry)
  const allocations = asArray(fields.allocations).map(parseAllocation)
  const openAtMs = asNumber(fields.open_at_ms)
  const lockAtMs = asNumber(fields.lock_at_ms)
  const settleByMs = asNumber(fields.settle_by_ms)
  return {
    id: String(asNumber(fields.scenario_id)),
    chainScenarioId: String(asNumber(fields.scenario_id)),
    eventId: asString(fields.event_id),
    title: asString(fields.title),
    prompt: asString(fields.prompt),
    fighterA: {
      name: asString(fields.fighter_a_name),
      country: asString(fields.fighter_a_country),
    },
    fighterB: {
      name: asString(fields.fighter_b_name),
      country: asString(fields.fighter_b_country),
    },
    round: asNumber(fields.round),
    openAt: msToIso(openAtMs),
    lockAt: msToIso(lockAtMs),
    settleBy: msToIso(settleByMs),
    state: deriveScenarioState(asNumber(fields.state), openAtMs, lockAtMs),
    resolutionSource: "operator",
    winningSide: sideFromBool(parseOptionBool(fields.winning_side)),
    totalEnergy: asNumber(fields.total_energy),
    participantCount: asNumber(fields.participant_count),
    allocations,
  }
}

export async function getArenaSnapshot() {
  if (!isSuiWriteConfigured()) {
    return null
  }

  const arena = await getSuiClient().getObject({
    id: suiConfig.arenaObjectId,
    options: {
      showContent: true,
    },
  })

  const content = arena.data?.content as { fields?: JsonLike } | undefined
  if (!content?.fields) {
    return null
  }

  const fields = asRecord(content.fields)
  return {
    profiles: asArray(fields.profiles).map(parseProfile),
    scenarios: asArray(fields.scenarios).map(parseScenario),
  }
}

export async function getChainProfile(address: string) {
  const arena = await getArenaSnapshot()
  if (!arena) {
    return null
  }

  return arena.profiles.find((profile) => profile.address === address) ?? null
}

export async function listChainScenarios() {
  const arena = await getArenaSnapshot()
  return arena?.scenarios ?? []
}

export async function getChainLeaderboard(seed: LeaderboardEntry[]) {
  const arena = await getArenaSnapshot()
  if (!arena || arena.profiles.length === 0) {
    return null
  }

  const chainEntries: LeaderboardEntry[] = arena.profiles
    .filter((profile) => profile.badgeClaimed)
    .map((profile) => ({
      rank: 0,
      previousRank: Math.max(1, profile.points > 10000 ? 8 : 156),
      username: profile.displayName,
      address: profile.address,
      points: profile.points,
      correctCalls: profile.correctCalls,
      totalCalls: profile.totalCalls || 1,
      streak: profile.streak,
      nfts: profile.nftCount,
      tier: profile.badgeTier,
    }))

  const merged = new Map<string, LeaderboardEntry>()
  for (const entry of seed) {
    merged.set(entry.address, { ...entry, rank: 0 })
  }
  for (const entry of chainEntries) {
    merged.set(entry.address, entry)
  }

  return [...merged.values()]
    .sort((left, right) => right.points - left.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}
