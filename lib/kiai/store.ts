import "server-only"

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import {
  DEFAULT_SETTLEMENT_WINDOW_SECONDS,
  DEFAULT_USER_ADDRESS,
  ENERGY_CLAIM_AMOUNT,
  MIN_SCENARIO_WINDOW_SECONDS,
} from "@/lib/kiai/constants"
import {
  type BadgeTier,
  type KiaiEvent,
  type KiaiScenario,
  type LeaderboardEntry,
  type MarketplaceItem,
  type ScenarioAllocation,
  type ScenarioLifecycleAction,
  type ScenarioSide,
  type ScenarioState,
  type UserProfile,
} from "@/lib/kiai/types"

const DATA_DIRECTORY = join(process.cwd(), ".data")
const DATA_FILE = join(DATA_DIRECTORY, "kiai-store.json")
const STORE_VERSION = 1

const EVENTS: KiaiEvent[] = [
  {
    id: "one-samurai-1",
    name: "ONE SAMURAI 1",
    dateLabel: "APR 29, 2026",
    timeLabel: "2:00PM JST",
    location: "Tokyo, Japan",
    venue: "Ariake Arena",
    status: "live",
    fightCount: 12,
    participantCount: 3420,
    featured: true,
  },
  {
    id: "one-friday-fights-62",
    name: "ONE Friday Fights 62",
    dateLabel: "MAY 3, 2026",
    timeLabel: "7:30PM ICT",
    location: "Bangkok, Thailand",
    venue: "Lumpinee Stadium",
    status: "upcoming",
    fightCount: 10,
    participantCount: 0,
  },
  {
    id: "one-170",
    name: "ONE 170",
    dateLabel: "MAY 10, 2026",
    timeLabel: "6:00PM ICT",
    location: "Bangkok, Thailand",
    venue: "Impact Arena",
    status: "upcoming",
    fightCount: 14,
    participantCount: 0,
    featured: true,
  },
]

const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "ticket-1",
    name: "ONE SAMURAI 2 - VIP Ringside",
    description: "VIP ringside seat for ONE SAMURAI 2 at Ariake Arena, Tokyo.",
    category: "tickets",
    pointsCost: 50000,
    stock: 3,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "HOT",
    paymentType: "points",
  },
  {
    id: "ticket-2",
    name: "Fighter Training Camp Access",
    description: "Exclusive access to a ONE Championship fighter training camp.",
    category: "tickets",
    pointsCost: 25000,
    nftRequired: "Combat IQ",
    nftCount: 1,
    stock: 2,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "EXCLUSIVE",
    paymentType: "both",
  },
  {
    id: "merch-1",
    name: "KIAI x ONE Samurai Hoodie",
    description: "Limited edition collaboration hoodie featuring the KIAI x ONE Samurai design.",
    category: "merchandise",
    pointsCost: 8000,
    stock: 20,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "LIMITED",
    paymentType: "points",
  },
  {
    id: "nft-exchange",
    name: "Combat IQ NFT",
    description: "Exchange KP for a Combat IQ NFT to unlock exclusive rewards.",
    category: "nfts",
    pointsCost: 1000,
    stock: 50,
    maxPerUser: 10,
    image: "/images/fighters-battle.jpg",
    badge: "EXCHANGE",
    paymentType: "points",
    isNftExchange: true,
  },
  {
    id: "exp-1",
    name: "Virtual Meet & Greet",
    description: "30-minute virtual meeting with a ONE Championship fighter of your choice.",
    category: "experiences",
    pointsCost: 75000,
    stock: 3,
    maxPerUser: 1,
    image: "/images/fighters-battle.jpg",
    badge: "VIP",
    paymentType: "points",
  },
]

const SEEDED_LEADERBOARD: Omit<LeaderboardEntry, "rank">[] = [
  {
    previousRank: 1,
    username: "SamuraiMaster",
    address: "0x1a2b...3c4d",
    points: 128450,
    correctCalls: 892,
    totalCalls: 1124,
    streak: 12,
    nfts: 47,
    tier: "black",
  },
  {
    previousRank: 3,
    username: "MuayThaiKing",
    address: "0x5e6f...7g8h",
    points: 115200,
    correctCalls: 756,
    totalCalls: 980,
    streak: 8,
    nfts: 38,
    tier: "brown",
  },
  {
    previousRank: 2,
    username: "KnockoutReader",
    address: "0x9i0j...1k2l",
    points: 108750,
    correctCalls: 701,
    totalCalls: 945,
    streak: 5,
    nfts: 35,
    tier: "brown",
  },
]

const SEEDED_PROFILES: Record<string, UserProfile> = {
  [DEFAULT_USER_ADDRESS]: {
    address: DEFAULT_USER_ADDRESS,
    displayName: "Demo Fighter",
    points: 12450,
    energy: 400,
    badgeTier: "white",
    badgeXp: 80,
    badgeClaimed: true,
    nftCount: 1,
    correctCalls: 89,
    totalCalls: 134,
    streak: 3,
    linkedWalletKind: "demo",
    lastEnergyClaimAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
}

const SEEDED_SCENARIOS: KiaiScenario[] = [
  createSeedScenario({
    id: "scenario-1",
    eventId: "one-samurai-1",
    title: "Round 2 Knockdown Window",
    prompt: "Will a knockdown happen before the end of the next 60 seconds?",
    fighterA: { name: "Takeru Segawa", country: "JPN" },
    fighterB: { name: "Superlek", country: "THA" },
    round: 2,
    offsetMinutes: -2,
    lockOffsetSeconds: 50,
  }),
  createSeedScenario({
    id: "scenario-2",
    eventId: "one-samurai-1",
    title: "High Kick Read",
    prompt: "Will a high kick be attempted in the next 45 seconds?",
    fighterA: { name: "Rodtang", country: "THA" },
    fighterB: { name: "Jonathan Haggerty", country: "GBR" },
    round: 1,
    offsetMinutes: -1,
    lockOffsetSeconds: 80,
  }),
  createSeedScenario({
    id: "scenario-3",
    eventId: "one-170",
    title: "Clinch Pressure",
    prompt: "Will a clinch sequence start within the next 30 seconds once the round opens?",
    fighterA: { name: "Tawanchai", country: "THA" },
    fighterB: { name: "Jo Nattawut", country: "THA" },
    round: 1,
    offsetMinutes: 45,
    lockOffsetSeconds: 120,
    state: "draft",
  }),
]

interface PersistedStore {
  version: number
  events: KiaiEvent[]
  marketplaceItems: MarketplaceItem[]
  scenarios: KiaiScenario[]
  profiles: Record<string, UserProfile>
  leaderboardSeed: Omit<LeaderboardEntry, "rank">[]
  purchaseHistory: Record<string, string[]>
}

function createSeedScenario(input: {
  id: string
  eventId: string
  title: string
  prompt: string
  fighterA: { name: string; country: string }
  fighterB: { name: string; country: string }
  round: number
  offsetMinutes: number
  lockOffsetSeconds: number
  state?: ScenarioState
}): KiaiScenario {
  const now = Date.now()
  const openAt = new Date(now + input.offsetMinutes * 60_000)
  const lockAt = new Date(openAt.getTime() + input.lockOffsetSeconds * 1000)
  const settleBy = new Date(lockAt.getTime() + DEFAULT_SETTLEMENT_WINDOW_SECONDS * 1000)

  return {
    id: input.id,
    eventId: input.eventId,
    title: input.title,
    prompt: input.prompt,
    fighterA: input.fighterA,
    fighterB: input.fighterB,
    round: input.round,
    openAt: openAt.toISOString(),
    lockAt: lockAt.toISOString(),
    settleBy: settleBy.toISOString(),
    state: input.state ?? "open",
    resolutionSource: "operator",
    totalEnergy: 0,
    participantCount: 0,
    allocations: [],
  }
}

function getBadgeTierFromXp(xp: number): BadgeTier {
  if (xp >= 900) return "black"
  if (xp >= 600) return "brown"
  if (xp >= 350) return "purple"
  if (xp >= 180) return "blue"
  return "white"
}

function createInitialSnapshot(): PersistedStore {
  return {
    version: STORE_VERSION,
    events: structuredClone(EVENTS),
    marketplaceItems: structuredClone(MARKETPLACE_ITEMS),
    scenarios: structuredClone(SEEDED_SCENARIOS),
    profiles: structuredClone(SEEDED_PROFILES),
    leaderboardSeed: structuredClone(SEEDED_LEADERBOARD),
    purchaseHistory: {},
  }
}

function loadPersistedSnapshot(): PersistedStore {
  const fallback = createInitialSnapshot()
  if (!existsSync(DATA_FILE)) {
    return fallback
  }

  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<PersistedStore>
    if (raw.version !== STORE_VERSION) {
      return fallback
    }

    return {
      version: STORE_VERSION,
      events: Array.isArray(raw.events) ? raw.events : fallback.events,
      marketplaceItems: Array.isArray(raw.marketplaceItems) ? raw.marketplaceItems : fallback.marketplaceItems,
      scenarios: Array.isArray(raw.scenarios) ? raw.scenarios : fallback.scenarios,
      profiles: raw.profiles && typeof raw.profiles === "object" ? raw.profiles : fallback.profiles,
      leaderboardSeed: Array.isArray(raw.leaderboardSeed) ? raw.leaderboardSeed : fallback.leaderboardSeed,
      purchaseHistory:
        raw.purchaseHistory && typeof raw.purchaseHistory === "object" ? raw.purchaseHistory : fallback.purchaseHistory,
    }
  } catch {
    return fallback
  }
}

function writePersistedSnapshot(snapshot: PersistedStore) {
  mkdirSync(DATA_DIRECTORY, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(snapshot, null, 2))
}

class KiaiStore {
  private events: KiaiEvent[]
  private marketplaceItems: MarketplaceItem[]
  private scenarios: KiaiScenario[]
  private profiles: Record<string, UserProfile>
  private leaderboardSeed: Omit<LeaderboardEntry, "rank">[]
  private purchaseHistory: Map<string, string[]>

  constructor(snapshot = loadPersistedSnapshot()) {
    this.events = structuredClone(snapshot.events)
    this.marketplaceItems = structuredClone(snapshot.marketplaceItems)
    this.scenarios = structuredClone(snapshot.scenarios)
    this.profiles = structuredClone(snapshot.profiles)
    this.leaderboardSeed = structuredClone(snapshot.leaderboardSeed)
    this.purchaseHistory = new Map(Object.entries(snapshot.purchaseHistory))
  }

  getDefaultAddress() {
    return DEFAULT_USER_ADDRESS
  }

  getEvents() {
    this.syncScenarioStates()
    return this.events.map((event) => ({
      ...event,
      participantCount: this.countParticipantsForEvent(event.id),
    }))
  }

  listScenarios(input?: { eventId?: string; state?: ScenarioState | "active" }) {
    this.syncScenarioStates()
    return this.scenarios.filter((scenario) => {
      if (input?.eventId && scenario.eventId !== input.eventId) return false
      if (!input?.state) return true
      if (input.state === "active") {
        return scenario.state === "open" || scenario.state === "locked"
      }
      return scenario.state === input.state
    })
  }

  createScenario(input: {
    id?: string
    chainScenarioId?: string
    eventId: string
    title: string
    prompt: string
    fighterAName: string
    fighterACountry: string
    fighterBName: string
    fighterBCountry: string
    round: number
    opensInSeconds?: number
    lockInSeconds: number
    openAt?: string
    lockAt?: string
    settleBy?: string
    state?: ScenarioState
  }) {
    const now = Date.now()
    const openAt = input.openAt ? new Date(input.openAt) : new Date(now + (input.opensInSeconds ?? 0) * 1000)
    const lockAt = input.lockAt ? new Date(input.lockAt) : new Date(openAt.getTime() + input.lockInSeconds * 1000)
    const settleBy = input.settleBy
      ? new Date(input.settleBy)
      : new Date(lockAt.getTime() + DEFAULT_SETTLEMENT_WINDOW_SECONDS * 1000)
    const scenario: KiaiScenario = {
      id: input.id ?? crypto.randomUUID(),
      chainScenarioId: input.chainScenarioId,
      eventId: input.eventId,
      title: input.title,
      prompt: input.prompt,
      fighterA: { name: input.fighterAName, country: input.fighterACountry },
      fighterB: { name: input.fighterBName, country: input.fighterBCountry },
      round: input.round,
      openAt: openAt.toISOString(),
      lockAt: lockAt.toISOString(),
      settleBy: settleBy.toISOString(),
      state: input.state ?? (openAt.getTime() > now ? "draft" : "open"),
      resolutionSource: "operator",
      totalEnergy: 0,
      participantCount: 0,
      allocations: [],
    }

    this.scenarios.unshift(scenario)
    this.persist()
    return scenario
  }

  getScenario(id: string) {
    this.syncScenarioStates()
    const scenario = this.scenarios.find((item) => item.id === id)
    if (!scenario) {
      throw new Error("Scenario not found")
    }
    return scenario
  }

  updateScenarioLifecycle(input: { scenarioId: string; action: ScenarioLifecycleAction }) {
    this.syncScenarioStates()
    const scenario = this.getScenario(input.scenarioId)
    const now = Date.now()

    if (input.action === "publish") {
      if (scenario.state === "settled" || scenario.state === "archived") {
        throw new Error("Only draft or locked scenarios can be published")
      }

      const originalWindowMs = Math.max(
        new Date(scenario.lockAt).getTime() - new Date(scenario.openAt).getTime(),
        MIN_SCENARIO_WINDOW_SECONDS * 1000,
      )
      const nextLockAt = new Date(now + originalWindowMs)

      scenario.openAt = new Date(now).toISOString()
      scenario.lockAt = nextLockAt.toISOString()
      scenario.settleBy = new Date(nextLockAt.getTime() + DEFAULT_SETTLEMENT_WINDOW_SECONDS * 1000).toISOString()
      scenario.lockedAt = undefined
      scenario.archivedAt = undefined
      scenario.state = "open"
    }

    if (input.action === "lock") {
      if (scenario.state !== "open" && scenario.state !== "draft") {
        throw new Error("Only draft or open scenarios can be locked")
      }

      const lockedAt = new Date(now)
      scenario.lockedAt = lockedAt.toISOString()
      scenario.lockAt = lockedAt.toISOString()
      scenario.settleBy = new Date(now + DEFAULT_SETTLEMENT_WINDOW_SECONDS * 1000).toISOString()
      scenario.state = "locked"
    }

    if (input.action === "archive") {
      if (scenario.state === "open") {
        throw new Error("Lock or settle the scenario before archiving it")
      }

      scenario.archivedAt = new Date(now).toISOString()
      scenario.state = "archived"
    }

    this.persist()
    return scenario
  }

  ensureProfile(address?: string) {
    const normalizedAddress = address?.trim() || DEFAULT_USER_ADDRESS
    const existing = this.profiles[normalizedAddress]
    if (existing) return existing

    const profile: UserProfile = {
      address: normalizedAddress,
      displayName:
        normalizedAddress === DEFAULT_USER_ADDRESS
          ? "Demo Fighter"
          : `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
      points: 1250,
      energy: 0,
      badgeTier: "white",
      badgeXp: 0,
      badgeClaimed: false,
      nftCount: 0,
      correctCalls: 0,
      totalCalls: 0,
      streak: 0,
      linkedWalletKind: normalizedAddress === DEFAULT_USER_ADDRESS ? "demo" : "injected",
    }
    this.profiles[normalizedAddress] = profile
    this.persist()
    return profile
  }

  getProfile(address?: string) {
    return this.ensureProfile(address)
  }

  claimBadge(address?: string) {
    const profile = this.ensureProfile(address)
    if (!profile.badgeClaimed) {
      profile.badgeClaimed = true
      profile.badgeTier = "white"
      profile.nftCount += 1
      profile.badgeXp += 25
      this.persist()
    }
    return profile
  }

  claimEnergy(address?: string) {
    const profile = this.ensureProfile(address)
    const now = new Date()
    const lastClaim = profile.lastEnergyClaimAt ? new Date(profile.lastEnergyClaimAt) : null
    if (!lastClaim || now.getTime() - lastClaim.getTime() >= 60 * 60 * 1000) {
      profile.energy += ENERGY_CLAIM_AMOUNT
      profile.lastEnergyClaimAt = now.toISOString()
      this.persist()
    }
    return profile
  }

  allocateInsight(input: { scenarioId: string; address?: string; side: ScenarioSide; energyAmount: number }) {
    this.syncScenarioStates()
    const scenario = this.getScenario(input.scenarioId)
    if (scenario.state !== "open") {
      throw new Error("Scenario is not open for allocations")
    }

    const profile = this.ensureProfile(input.address)
    if (!profile.badgeClaimed) {
      throw new Error("Claim your KIAI Badge before allocating insight")
    }
    if (profile.energy < input.energyAmount) {
      throw new Error("Not enough KIAI Energy available")
    }

    const allocation: ScenarioAllocation = {
      address: profile.address,
      side: input.side,
      energyAmount: input.energyAmount,
      createdAt: new Date().toISOString(),
    }

    profile.energy -= input.energyAmount
    scenario.allocations.push(allocation)
    scenario.totalEnergy += input.energyAmount
    scenario.participantCount = new Set(scenario.allocations.map((item) => item.address)).size
    this.persist()
    return { scenario, profile }
  }

  settleScenario(input: { scenarioId: string; winningSide: ScenarioSide }) {
    this.syncScenarioStates()
    const scenario = this.getScenario(input.scenarioId)
    if (scenario.state === "archived") {
      throw new Error("Archived scenarios cannot be settled")
    }
    if (scenario.state === "settled") {
      return scenario
    }
    if (scenario.state === "draft") {
      throw new Error("Publish or lock the scenario before settling it")
    }

    scenario.lockedAt ??= new Date().toISOString()
    scenario.state = "settled"
    scenario.winningSide = input.winningSide
    scenario.settledAt = new Date().toISOString()

    const seenCorrectAddresses = new Set<string>()

    for (const allocation of scenario.allocations) {
      const profile = this.ensureProfile(allocation.address)
      profile.totalCalls += 1

      if (allocation.side === input.winningSide) {
        const pointsAward = allocation.energyAmount * 2
        const xpAward = Math.max(20, Math.floor(allocation.energyAmount / 2))
        profile.points += pointsAward
        profile.badgeXp += xpAward
        profile.correctCalls += 1
        profile.streak += 1
        seenCorrectAddresses.add(profile.address)
      } else {
        profile.streak = 0
      }

      profile.badgeTier = getBadgeTierFromXp(profile.badgeXp)
    }

    for (const address of Object.keys(this.profiles)) {
      if (!seenCorrectAddresses.has(address) && this.profiles[address].totalCalls > 0) {
        this.profiles[address].badgeTier = getBadgeTierFromXp(this.profiles[address].badgeXp)
      }
    }

    this.persist()
    return scenario
  }

  getLeaderboard() {
    const profileEntries: LeaderboardEntry[] = Object.values(this.profiles)
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

    return [...this.leaderboardSeed.map((entry) => ({ ...entry, rank: 0 })), ...profileEntries]
      .sort((left, right) => right.points - left.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  getMarketplaceItems() {
    return this.marketplaceItems
  }

  redeemMarketplaceItem(input: { itemId: string; address?: string }) {
    const profile = this.ensureProfile(input.address)
    const item = this.marketplaceItems.find((entry) => entry.id === input.itemId)
    if (!item) throw new Error("Marketplace item not found")
    if (item.stock <= 0) throw new Error("This item is no longer available")

    const history = this.purchaseHistory.get(profile.address) ?? []
    const ownedCount = history.filter((entry) => entry === item.id).length
    if (ownedCount >= item.maxPerUser) {
      throw new Error("You have reached the redemption limit for this reward")
    }

    if (item.paymentType === "points" || item.paymentType === "both") {
      if (profile.points < item.pointsCost) throw new Error("Not enough KP available")
    }
    if ((item.paymentType === "nft" || item.paymentType === "both") && item.nftCount) {
      if (profile.nftCount < item.nftCount) throw new Error("Not enough Combat IQ NFTs available")
    }

    if (item.paymentType === "points" || item.paymentType === "both") {
      profile.points -= item.pointsCost
    }
    if ((item.paymentType === "nft" || item.paymentType === "both") && item.nftCount) {
      profile.nftCount -= item.nftCount
    }
    if (item.isNftExchange) {
      profile.nftCount += 1
    }

    item.stock -= 1
    history.push(item.id)
    this.purchaseHistory.set(profile.address, history)
    this.persist()

    return { profile, item, history }
  }

  getPurchaseHistory(address?: string) {
    const profile = this.ensureProfile(address)
    return this.purchaseHistory.get(profile.address) ?? []
  }

  private countParticipantsForEvent(eventId: string) {
    return this.scenarios
      .filter((scenario) => scenario.eventId === eventId && scenario.state !== "archived")
      .reduce((sum, scenario) => sum + scenario.participantCount, 0)
  }

  private syncScenarioStates() {
    const now = Date.now()
    this.scenarios = this.scenarios.map((scenario) => {
      if (scenario.state === "settled" || scenario.settledAt) {
        return { ...scenario, state: "settled" }
      }
      if (scenario.state === "archived" || scenario.archivedAt) {
        return { ...scenario, state: "archived" }
      }
      if (scenario.lockedAt) {
        return { ...scenario, state: "locked" }
      }

      const openAt = new Date(scenario.openAt).getTime()
      const lockAt = new Date(scenario.lockAt).getTime()
      const nextState: ScenarioState = now < openAt ? "draft" : now < lockAt ? "open" : "locked"

      return {
        ...scenario,
        state: nextState,
      }
    })
  }

  private persist() {
    writePersistedSnapshot({
      version: STORE_VERSION,
      events: this.events,
      marketplaceItems: this.marketplaceItems,
      scenarios: this.scenarios,
      profiles: this.profiles,
      leaderboardSeed: this.leaderboardSeed,
      purchaseHistory: Object.fromEntries(this.purchaseHistory),
    })
  }
}

declare global {
  var __kiaiStore: KiaiStore | undefined
}

export function getKiaiStore() {
  globalThis.__kiaiStore ??= new KiaiStore()
  return globalThis.__kiaiStore
}
