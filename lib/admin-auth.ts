import "server-only"

import { createHmac, randomUUID } from "node:crypto"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { normalizeSuiAddress } from "@mysten/sui/utils"
import { verifyPersonalMessageSignature } from "@mysten/sui/verify"

import { getSuiClient } from "@/lib/sui/server"

const ADMIN_COOKIE_NAME = "kiai-admin-session"
const CHALLENGE_TTL_MS = 5 * 60 * 1000
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

type ChallengeRecord = {
  address: string
  issuedAt: number
  expiresAt: number
}

const adminChallenges = new Map<string, ChallengeRecord>()

function getAdminSessionSecret() {
  return process.env.KIAI_ADMIN_SESSION_SECRET ?? ""
}

function getAdminAllowlist() {
  return (process.env.KIAI_ADMIN_ALLOWLIST ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => normalizeSuiAddress(entry))
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url")
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8")
}

function signValue(value: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(value).digest("base64url")
}

function parseChallengeMessage(message: string) {
  const lines = message.split("\n")
  if (lines.length !== 5 || lines[0] !== "KIAI admin login") {
    throw new Error("Invalid admin challenge message")
  }

  const address = lines[1]?.replace(/^address:/, "")
  const nonce = lines[2]?.replace(/^nonce:/, "")
  const issuedAt = Number(lines[3]?.replace(/^issued_at:/, ""))
  const expiresAt = Number(lines[4]?.replace(/^expires_at:/, ""))

  if (!address || !nonce || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    throw new Error("Admin challenge message is malformed")
  }

  return {
    address: normalizeSuiAddress(address),
    nonce,
    issuedAt,
    expiresAt,
  }
}

function createSessionToken(address: string) {
  const payload = JSON.stringify({
    address,
    exp: Date.now() + SESSION_TTL_MS,
  })
  const encodedPayload = base64UrlEncode(payload)
  const signature = signValue(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function readSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)
  if (signature !== expectedSignature) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as { address?: string; exp?: number }
    if (!payload.address || !payload.exp || payload.exp < Date.now()) {
      return null
    }

    const address = normalizeSuiAddress(payload.address)
    if (!getAdminAllowlist().includes(address)) {
      return null
    }

    return {
      address,
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminSessionSecret() && getAdminAllowlist().length > 0)
}

export function isAllowedAdminAddress(address: string) {
  return getAdminAllowlist().includes(normalizeSuiAddress(address))
}

export function createAdminChallenge(address: string) {
  const normalizedAddress = normalizeSuiAddress(address)
  const issuedAt = Date.now()
  const expiresAt = issuedAt + CHALLENGE_TTL_MS
  const nonce = randomUUID()

  adminChallenges.set(nonce, {
    address: normalizedAddress,
    issuedAt,
    expiresAt,
  })

  return {
    nonce,
    issuedAt,
    expiresAt,
    message: [
      "KIAI admin login",
      `address:${normalizedAddress}`,
      `nonce:${nonce}`,
      `issued_at:${issuedAt}`,
      `expires_at:${expiresAt}`,
    ].join("\n"),
  }
}

export async function verifyAdminChallenge(input: {
  address: string
  message: string
  signature: string
}) {
  const normalizedAddress = normalizeSuiAddress(input.address)
  if (!isAllowedAdminAddress(normalizedAddress)) {
    throw new Error("Wallet is not allowlisted for admin access")
  }

  const parsedMessage = parseChallengeMessage(input.message)
  if (parsedMessage.address !== normalizedAddress) {
    throw new Error("Signed admin challenge address does not match the request")
  }

  const challenge = adminChallenges.get(parsedMessage.nonce)
  adminChallenges.delete(parsedMessage.nonce)

  if (!challenge) {
    throw new Error("Admin challenge nonce is missing or already used")
  }

  if (challenge.address !== normalizedAddress) {
    throw new Error("Admin challenge address does not match the signed wallet")
  }

  if (challenge.issuedAt !== parsedMessage.issuedAt || challenge.expiresAt !== parsedMessage.expiresAt) {
    throw new Error("Admin challenge timestamps do not match")
  }

  if (challenge.expiresAt < Date.now()) {
    throw new Error("Admin challenge has expired")
  }

  await verifyPersonalMessageSignature(new TextEncoder().encode(input.message), input.signature, {
    client: getSuiClient(),
    address: normalizedAddress,
  })

  return {
    address: normalizedAddress,
  }
}

export function createAdminSessionResponse(address: string) {
  const response = NextResponse.json({
    authenticated: true,
    address,
  })

  response.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(address), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  })

  return response
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({
    authenticated: false,
  })

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}

export async function getAdminSession() {
  if (!isAdminAuthConfigured()) {
    return {
      configured: false,
      authenticated: false,
      address: null as string | null,
    }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  const session = token ? readSessionToken(token) : null

  return {
    configured: true,
    authenticated: Boolean(session),
    address: session?.address ?? null,
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session.configured) {
    return {
      ok: false as const,
      response: new NextResponse("Admin auth is not configured", { status: 503 }),
    }
  }

  if (!session.authenticated || !session.address) {
    return {
      ok: false as const,
      response: new NextResponse("Admin authentication required", { status: 401 }),
    }
  }

  return {
    ok: true as const,
    address: session.address,
  }
}
