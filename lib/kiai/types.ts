export type EventStatus = "live" | "upcoming" | "past"
export type ScenarioState = "draft" | "open" | "locked" | "settled" | "archived"
export type ScenarioSide = "yes" | "no"
export type ScenarioResolutionSource = "operator" | "ai_assist"
export type ScenarioLifecycleAction = "publish" | "lock" | "archive"
export type BadgeTier = "white" | "blue" | "purple" | "brown" | "black"
export type MarketplaceCategory = "all" | "tickets" | "merchandise" | "nfts" | "experiences"
export type MarketplacePaymentType = "points" | "nft" | "both"

export interface KiaiEvent {
  id: string
  name: string
  dateLabel: string
  timeLabel: string
  location: string
  venue: string
  status: EventStatus
  fightCount: number
  participantCount: number
  featured?: boolean
}

export interface ScenarioAllocation {
  address: string
  side: ScenarioSide
  energyAmount: number
  createdAt: string
}

export interface KiaiScenario {
  id: string
  chainScenarioId?: string
  eventId: string
  title: string
  prompt: string
  fighterA: { name: string; country: string }
  fighterB: { name: string; country: string }
  round: number
  openAt: string
  lockAt: string
  settleBy: string
  state: ScenarioState
  resolutionSource: ScenarioResolutionSource
  winningSide?: ScenarioSide
  lockedAt?: string
  settledAt?: string
  archivedAt?: string
  totalEnergy: number
  participantCount: number
  allocations: ScenarioAllocation[]
}

export interface UserProfile {
  address: string
  displayName: string
  points: number
  energy: number
  badgeTier: BadgeTier
  badgeXp: number
  badgeClaimed: boolean
  nftCount: number
  correctCalls: number
  totalCalls: number
  streak: number
  linkedWalletKind: "demo" | "injected" | "zklogin"
  lastEnergyClaimAt?: string
}

export interface LeaderboardEntry {
  rank: number
  previousRank: number
  username: string
  address: string
  points: number
  correctCalls: number
  totalCalls: number
  streak: number
  nfts: number
  tier: BadgeTier
}

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: Exclude<MarketplaceCategory, "all">
  pointsCost: number
  nftRequired?: string
  nftCount?: number
  stock: number
  maxPerUser: number
  image: string
  badge?: string
  paymentType: MarketplacePaymentType
  isNftExchange?: boolean
}

export interface AppSnapshot {
  events: KiaiEvent[]
  scenarios: KiaiScenario[]
  leaderboard: LeaderboardEntry[]
  profile: UserProfile
  marketplaceItems: MarketplaceItem[]
}
