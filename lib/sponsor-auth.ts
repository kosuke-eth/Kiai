import "server-only"

import { createHmac, randomUUID } from "node:crypto"

import { SuiGraphQLClient } from "@mysten/sui/graphql"
import { normalizeSuiAddress } from "@mysten/sui/utils"
import { verifyPersonalMessageSignature } from "@mysten/sui/verify"

import { suiConfig } from "@/lib/sui/config"

const SPONSOR_CHALLENGE_TTL_MS = 5 * 60 * 1000
const SPONSOR_RATE_LIMIT_WINDOW_MS = 60 * 1000
const SPONSOR_RATE_LIMIT_MAX = 12

type SponsorRateLimitRecord = {
  count: number
  resetAt: number
}

const sponsorRateLimits = new Map<string, SponsorRateLimitRecord>()

let graphQlClientSingleton: SuiGraphQLClient | null = null

function getGraphQlUrl() {
  return suiConfig.network === "mainnet"
    ? "https://sui-mainnet.mystenlabs.com/graphql"
    : "https://graphql.testnet.sui.io/graphql"
}

function getSuiGraphQlClient() {
  graphQlClientSingleton ??= new SuiGraphQLClient({
    network: suiConfig.network,
    url: getGraphQlUrl(),
  })

  return graphQlClientSingleton
}

function getSponsorAuthSecret() {
  return process.env.KIAI_ADMIN_SESSION_SECRET || process.env.SUI_ADMIN_PRIVATE_KEY || ""
}

function signChallengeToken(value: string) {
  const secret = getSponsorAuthSecret()
  if (!secret) {
    throw new Error("Sponsor auth secret is not configured")
  }

  return createHmac("sha256", secret).update(value).digest("base64url")
}

function cleanupExpiredRateLimits(now: number) {
  for (const [key, record] of sponsorRateLimits.entries()) {
    if (record.resetAt <= now) {
      sponsorRateLimits.delete(key)
    }
  }
}

function parseChallengeMessage(message: string) {
  const lines = message.split("\n")
  if (lines.length !== 5 || lines[0] !== "KIAI sponsor auth") {
    throw new Error("Invalid sponsor challenge message")
  }

  const address = lines[1]?.replace(/^address:/, "")
  const nonce = lines[2]?.replace(/^nonce:/, "")
  const issuedAt = Number(lines[3]?.replace(/^issued_at:/, ""))
  const expiresAt = Number(lines[4]?.replace(/^expires_at:/, ""))

  if (!address || !nonce || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    throw new Error("Sponsor challenge message is malformed")
  }

  return {
    address: normalizeSuiAddress(address),
    nonce,
    issuedAt,
    expiresAt,
  }
}

export function createSponsorChallenge(address: string) {
  const normalizedAddress = normalizeSuiAddress(address)
  const issuedAt = Date.now()
  const expiresAt = issuedAt + SPONSOR_CHALLENGE_TTL_MS
  const nonce = randomUUID()
  const tokenPayload = `${normalizedAddress}:${nonce}:${issuedAt}:${expiresAt}`

  return {
    nonce,
    issuedAt,
    expiresAt,
    token: signChallengeToken(tokenPayload),
    message: [
      "KIAI sponsor auth",
      `address:${normalizedAddress}`,
      `nonce:${nonce}`,
      `issued_at:${issuedAt}`,
      `expires_at:${expiresAt}`,
    ].join("\n"),
  }
}

export async function verifySponsorChallenge(input: {
  address: string
  message: string
  signature: string
  token: string
}) {
  const normalizedAddress = normalizeSuiAddress(input.address)
  const parsedMessage = parseChallengeMessage(input.message)

  if (parsedMessage.address !== normalizedAddress) {
    throw new Error("Sponsor challenge address does not match the requested sender")
  }

  const tokenPayload = `${normalizedAddress}:${parsedMessage.nonce}:${parsedMessage.issuedAt}:${parsedMessage.expiresAt}`
  if (signChallengeToken(tokenPayload) !== input.token) {
    throw new Error("Sponsor challenge token is invalid")
  }

  if (parsedMessage.expiresAt < Date.now()) {
    throw new Error("Sponsor challenge has expired")
  }

  const messageBytes = new TextEncoder().encode(input.message)

  try {
    await verifyPersonalMessageSignature(messageBytes, input.signature, {
      address: normalizedAddress,
    })
  } catch {
    await verifyPersonalMessageSignature(messageBytes, input.signature, {
      client: getSuiGraphQlClient(),
      address: normalizedAddress,
    })
  }

  return {
    address: normalizedAddress,
  }
}

export function assertSponsorRateLimit(address: string, requestIp: string | null) {
  const now = Date.now()
  cleanupExpiredRateLimits(now)

  const normalizedAddress = normalizeSuiAddress(address)
  const limiterKey = `${normalizedAddress}:${requestIp ?? "unknown"}`
  const currentRecord = sponsorRateLimits.get(limiterKey)

  if (!currentRecord || currentRecord.resetAt <= now) {
    sponsorRateLimits.set(limiterKey, {
      count: 1,
      resetAt: now + SPONSOR_RATE_LIMIT_WINDOW_MS,
    })
    return
  }

  if (currentRecord.count >= SPONSOR_RATE_LIMIT_MAX) {
    throw new Error("Too many sponsor requests for this sender, wait a minute and try again")
  }

  currentRecord.count += 1
}
