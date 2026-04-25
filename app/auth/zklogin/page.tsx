"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { useZkLogin } from "@/hooks/use-zklogin"

export default function ManualZkLoginPage() {
  const router = useRouter()
  const { prepareZkLogin, completeZkLogin } = useZkLogin()
  const [idToken, setIdToken] = useState("")
  const [message, setMessage] = useState("Preparing a zkLogin session...")
  const [isReady, setIsReady] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let isMounted = true

    prepareZkLogin()
      .then(() => {
        if (!isMounted) {
          return
        }

        setIsReady(true)
        setMessage("Paste a supported OpenID id_token to finish zkLogin.")
      })
      .catch((error) => {
        if (!isMounted) {
          return
        }

        setMessage(error instanceof Error ? error.message : "Unable to prepare zkLogin")
      })

    return () => {
      isMounted = false
    }
  }, [prepareZkLogin])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <div className="w-full border border-border bg-card p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">KIAI zkLogin</p>
          <h1 className="mt-3 text-3xl font-black text-balance">Manual OpenID completion</h1>
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Use this when you already have an OpenID <code>id_token</code> from a provider supported by Sui
            zkLogin. Automatic Google redirect remains optional, not required.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Supported on testnet per Sui docs: Google, Facebook, Twitch, Apple, AWS (tenant), Karrier One,
            and Credenza3.
          </p>

          <label className="mt-6 block text-sm font-semibold text-foreground" htmlFor="id-token">
            OpenID <code>id_token</code>
          </label>
          <textarea
            id="id-token"
            value={idToken}
            onChange={(event) => setIdToken(event.target.value)}
            placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiJ9..."
            className="mt-2 min-h-40 w-full border border-border bg-background px-4 py-3 font-mono text-xs text-foreground outline-none transition-colors focus:border-primary"
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                startTransition(async () => {
                  try {
                    if (!idToken.trim()) {
                      throw new Error("An id_token is required")
                    }

                    setMessage("Requesting salt and proof...")
                    await completeZkLogin(idToken.trim())
                    router.replace("/")
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Unable to complete zkLogin")
                  }
                })
              }}
              disabled={!isReady || isPending}
              className="bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Completing..." : "Complete zkLogin"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5"
            >
              Back to app
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
