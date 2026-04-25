import { createHash } from "node:crypto"

import { NextResponse } from "next/server"
import { decodeJwt, genAddressSeed, jwtToAddress } from "@mysten/sui/zklogin"
import { z } from "zod"

import { suiConfig } from "@/lib/sui/config"
import { normalizeZkLoginSignatureInputs } from "@/lib/sui/zklogin"

const zkLoginSchema = z.object({
  jwt: z.string().min(1),
  extendedEphemeralPublicKey: z.string().min(1),
  maxEpoch: z.number().int().positive(),
  randomness: z.string().min(1),
})

function createStableSalt(jwt: string) {
  const decoded = decodeJwt(jwt)
  const saltSeed = process.env.SUI_ZKLOGIN_SALT_SEED ?? "kiai-dev-salt"
  const digest = createHash("sha256")
    .update(`${saltSeed}:${decoded.iss}:${decoded.aud}:${decoded.sub}`)
    .digest("hex")

  return BigInt(`0x${digest.slice(0, 32)}`).toString()
}

async function fetchHostedSalt(serviceUrl: string, jwt: string) {
  const response = await fetch(serviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: jwt }),
  })

  if (!response.ok) {
    throw new Error((await response.text()) || "zkLogin salt service request failed")
  }

  const payload = (await response.json()) as { salt?: string }
  if (!payload.salt) {
    throw new Error("zkLogin salt service did not return a salt")
  }

  return payload.salt
}

function getDefaultProverUrl() {
  return suiConfig.network === "testnet" || suiConfig.network === "mainnet"
    ? "https://prover.mystenlabs.com/v1"
    : "https://prover-dev.mystenlabs.com/v1"
}

function getConfiguredUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

function formatProverError(message: string, audience: string | string[] | undefined, proverUrl: string) {
  const normalizedAudience = Array.isArray(audience) ? audience.join(", ") : audience ?? "unknown"

  if (/audience.+not supported/i.test(message)) {
    return [
      `Hosted zkLogin prover rejected the OAuth client ID (${normalizedAudience}).`,
      "Automatic Google zkLogin needs one of the following:",
      "- a self-hosted prover exposed via SUI_ZKLOGIN_PROVER_URL",
      "- or an Enoki / Mysten-managed setup with a supported client ID",
      `Current prover: ${proverUrl}`,
    ].join("\n")
  }

  return message || "zkLogin prover request failed"
}

export async function POST(request: Request) {
  try {
    const { jwt, extendedEphemeralPublicKey, maxEpoch, randomness } = zkLoginSchema.parse(await request.json())
    const decodedJwt = decodeJwt(jwt)
    const saltServiceUrl = getConfiguredUrl(
      process.env.ZKLOGIN_SALT_SERVICE,
      "https://salt.api.mystenlabs.com/get_salt",
    )
    let salt = ""

    try {
      salt = await fetchHostedSalt(saltServiceUrl, jwt)
    } catch (error) {
      if (process.env.NODE_ENV !== "development") {
        throw new Error(
          error instanceof Error
            ? `zkLogin salt service unavailable: ${error.message}`
            : "zkLogin salt service unavailable",
        )
      }

      // Fall back to a deterministic local salt in development when the hosted salt
      // service is unavailable or not configured for this test environment.
      salt = createStableSalt(jwt)
    }

    const proverUrl = getConfiguredUrl(process.env.SUI_ZKLOGIN_PROVER_URL, getDefaultProverUrl())

    const proofResponse = await fetch(proverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jwt,
        extendedEphemeralPublicKey,
        maxEpoch: maxEpoch.toString(),
        jwtRandomness: randomness,
        salt,
        keyClaimName: "sub",
      }),
    })

    if (!proofResponse.ok) {
      const message = await proofResponse.text()
      return new NextResponse(formatProverError(message, decodedJwt.aud, proverUrl), { status: 502 })
    }

    const addressSeed = genAddressSeed(BigInt(salt), "sub", decodedJwt.sub, decodedJwt.aud).toString()
    const proof = normalizeZkLoginSignatureInputs(await proofResponse.json(), addressSeed)
    const address = jwtToAddress(jwt, salt, false)

    return NextResponse.json({
      salt,
      signatureInputs: proof,
      address,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare zkLogin proof"
    return new NextResponse(message, { status: 400 })
  }
}
