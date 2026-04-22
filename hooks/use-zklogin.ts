"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSuiClient } from "@mysten/dapp-kit"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { generateNonce, generateRandomness, getExtendedEphemeralPublicKey, jwtToAddress } from "@mysten/sui/zklogin"

import type { ZkLoginSignatureInputs } from "@/lib/sui/zklogin"

const SESSION_STORAGE_KEY = "kiai-zklogin-session"
const PENDING_STORAGE_KEY = "kiai-zklogin-pending"

type ZkLoginPendingState = {
  ephemeralSecretKey: string
  maxEpoch: number
  randomness: string
}

export type ZkLoginSession = {
  address: string
  jwt: string
  salt: string
  ephemeralSecretKey: string
  signatureInputs: ZkLoginSignatureInputs
  maxEpoch: number
}

function readJsonStorage<T>(key: string) {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.sessionStorage.getItem(key)
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function writeJsonStorage(key: string, value: unknown) {
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function useZkLogin() {
  const client = useSuiClient()
  const [session, setSession] = useState<ZkLoginSession | null>(null)

  useEffect(() => {
    setSession(readJsonStorage<ZkLoginSession>(SESSION_STORAGE_KEY))
  }, [])

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

  const initiateGoogleLogin = useCallback(async () => {
    if (!googleClientId) {
      throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured")
    }

    const { epoch } = await client.getLatestSuiSystemState()
    const ephemeralKeyPair = Ed25519Keypair.generate()
    const maxEpoch = Number(epoch) + 10
    const randomness = generateRandomness().toString()
    const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness)

    writeJsonStorage(PENDING_STORAGE_KEY, {
      ephemeralSecretKey: ephemeralKeyPair.getSecretKey(),
      maxEpoch,
      randomness,
    } satisfies ZkLoginPendingState)

    const redirectUri = `${window.location.origin}/auth/callback`
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce,
      prompt: "select_account",
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }, [client, googleClientId])

  const completeZkLogin = useCallback(async (jwt: string) => {
    const pending = readJsonStorage<ZkLoginPendingState>(PENDING_STORAGE_KEY)
    if (!pending) {
      throw new Error("No pending zkLogin request was found in session storage")
    }

    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(pending.ephemeralSecretKey)
    const response = await fetch("/api/auth/zklogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jwt,
        maxEpoch: pending.maxEpoch,
        randomness: pending.randomness,
        extendedEphemeralPublicKey: getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey()),
      }),
    })

    try {
      if (!response.ok) {
        throw new Error((await response.text()) || "Unable to complete zkLogin")
      }

      const payload = (await response.json()) as {
        salt: string
        signatureInputs: ZkLoginSignatureInputs
        address?: string
      }
      const nextSession: ZkLoginSession = {
        address: payload.address ?? jwtToAddress(jwt, payload.salt, false),
        jwt,
        salt: payload.salt,
        ephemeralSecretKey: pending.ephemeralSecretKey,
        signatureInputs: payload.signatureInputs,
        maxEpoch: pending.maxEpoch,
      }

      writeJsonStorage(SESSION_STORAGE_KEY, nextSession)
      window.sessionStorage.removeItem(PENDING_STORAGE_KEY)
      setSession(nextSession)
      return nextSession
    } catch (error) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
      window.sessionStorage.removeItem(PENDING_STORAGE_KEY)
      setSession(null)
      throw error
    }
  }, [])

  const clearSession = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    window.sessionStorage.removeItem(PENDING_STORAGE_KEY)
    setSession(null)
  }, [])

  return useMemo(
    () => ({
      googleClientId,
      session,
      isReady: Boolean(googleClientId),
      initiateGoogleLogin,
      completeZkLogin,
      clearSession,
    }),
    [clearSession, completeZkLogin, googleClientId, initiateGoogleLogin, session],
  )
}
