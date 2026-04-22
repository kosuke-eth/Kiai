import type {
  KiaiEvent,
  KiaiScenario,
  LeaderboardEntry,
  MarketplaceItem,
  ScenarioLifecycleAction,
  UserProfile,
} from "@/lib/kiai/types"

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(payload || "Request failed")
  }

  return response.json()
}

export interface EventsResponse {
  events: KiaiEvent[]
}

export interface ScenariosResponse {
  scenarios: KiaiScenario[]
}

export interface ProfileResponse {
  profile: UserProfile
  purchaseHistory?: string[]
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

export interface MarketplaceResponse {
  items: MarketplaceItem[]
  purchaseHistory: string[]
}

export interface AdminSessionResponse {
  configured: boolean
  authenticated: boolean
  address: string | null
}

export interface SponsorResponse {
  sponsoredTransaction: string
  sponsoredTransactionBytes: string
  sponsorSignature: string
  sponsorAddress: string
}

export const kiaiApi = {
  getEvents() {
    return requestJson<EventsResponse>("/api/events")
  },
  getScenarios(params?: { eventId?: string; state?: string }) {
    const search = new URLSearchParams()
    if (params?.eventId) search.set("eventId", params.eventId)
    if (params?.state) search.set("state", params.state)
    const suffix = search.size > 0 ? `?${search.toString()}` : ""
    return requestJson<ScenariosResponse>(`/api/scenarios${suffix}`)
  },
  createScenario(body: Record<string, unknown>) {
    return requestJson<{ scenario: KiaiScenario }>("/api/scenarios", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
  updateScenarioState(body: { scenarioId: string; action: ScenarioLifecycleAction }) {
    return requestJson<{ scenario: KiaiScenario }>(`/api/scenarios/${body.scenarioId}/state`, {
      method: "POST",
      body: JSON.stringify({ action: body.action }),
    })
  },
  allocateInsight(body: {
    scenarioId: string
    address?: string
    side: "yes" | "no"
    energyAmount: number
    txDigest?: string
  }) {
    return requestJson<{ scenario: KiaiScenario; profile: UserProfile }>(`/api/scenarios/${body.scenarioId}/allocate`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
  settleScenario(body: { scenarioId: string; winningSide: "yes" | "no" }) {
    return requestJson<{ scenario: KiaiScenario }>(`/api/scenarios/${body.scenarioId}/settle`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
  getAdminSession() {
    return requestJson<AdminSessionResponse>("/api/admin/session")
  },
  createAdminChallenge(address: string) {
    return requestJson<{
      nonce: string
      issuedAt: number
      expiresAt: number
      message: string
    }>("/api/admin/challenge", {
      method: "POST",
      body: JSON.stringify({ address }),
    })
  },
  verifyAdminChallenge(body: { address: string; message: string; signature: string }) {
    return requestJson<{ authenticated: boolean; address: string }>("/api/admin/verify", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
  logoutAdminSession() {
    return requestJson<{ authenticated: false }>("/api/admin/logout", {
      method: "POST",
      body: JSON.stringify({}),
    })
  },
  getProfile(address: string) {
    return requestJson<ProfileResponse>(`/api/profile/${encodeURIComponent(address)}`)
  },
  claimBadge(address?: string, txDigest?: string) {
    return requestJson<ProfileResponse>("/api/claims/badge", {
      method: "POST",
      body: JSON.stringify({ address, txDigest }),
    })
  },
  claimEnergy(address?: string, txDigest?: string) {
    return requestJson<ProfileResponse>("/api/claims/energy", {
      method: "POST",
      body: JSON.stringify({ address, txDigest }),
    })
  },
  getLeaderboard() {
    return requestJson<LeaderboardResponse>("/api/leaderboard")
  },
  getMarketplace(address: string) {
    return requestJson<MarketplaceResponse>(`/api/marketplace?address=${encodeURIComponent(address)}`)
  },
  redeemMarketplaceItem(body: { itemId: string; address?: string }) {
    return requestJson<ProfileResponse>("/api/marketplace/redeem", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
  sponsorTransaction(
    body:
      | { action: "claim_badge"; sender: string }
      | { action: "claim_energy"; sender: string }
      | {
          action: "allocate_insight"
          sender: string
          chainScenarioId: string
          side: "yes" | "no"
          energyAmount: number
        },
  ) {
    return requestJson<SponsorResponse>("/api/sponsor", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },
}
