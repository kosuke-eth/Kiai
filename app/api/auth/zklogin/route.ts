import { createHash } from "node:crypto"

import { NextResponse } from "next/server"
import { decodeJwt, jwtToAddress } from "@mysten/sui/zklogin"
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

export async function POST(request: Request) {
  try {
    const { jwt, extendedEphemeralPublicKey, maxEpoch, randomness } = zkLoginSchema.parse(await request.json())
    const saltServiceUrl = process.env.ZKLOGIN_SALT_SERVICE ?? "https://salt.api.mystenlabs.com/get_salt"
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

    const proverUrl = process.env.SUI_ZKLOGIN_PROVER_URL ?? getDefaultProverUrl()

    const proofResponse = await fetch(proverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jwt,
        extendedEphemeralPublicKey,
        maxEpoch,
        jwtRandomness: randomness,
        salt,
        keyClaimName: "sub",
      }),
    })

    if (!proofResponse.ok) {
      const message = await proofResponse.text()
      return new NextResponse(message || "zkLogin prover request failed", { status: 502 })
    }

    const proof = normalizeZkLoginSignatureInputs(await proofResponse.json())
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
