"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { useZkLogin } from "@/hooks/use-zklogin"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { completeZkLogin } = useZkLogin()
  const [message, setMessage] = useState("Completing zkLogin...")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const idToken = queryParams.get("id_token") ?? hashParams.get("id_token")
    const error = queryParams.get("error") ?? hashParams.get("error")

    if (error) {
      setMessage(`OpenID login failed: ${error}`)
      return
    }

    if (!idToken) {
      setMessage("Missing id_token in callback response")
      return
    }

    startTransition(async () => {
      try {
        await completeZkLogin(idToken)
        router.replace("/")
      } catch (callbackError) {
        const nextMessage = callbackError instanceof Error ? callbackError.message : "Unable to complete zkLogin"
        setMessage(nextMessage)
      }
    })
  }, [completeZkLogin, router])

  const detailLines = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
        <div className="w-full border border-border bg-card p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">KIAI zkLogin</p>
          <h1 className="mt-3 text-3xl font-black text-balance">Authenticating your Sui session</h1>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {detailLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {isPending ? <p className="mt-6 text-xs text-muted-foreground">Requesting salt and proof...</p> : null}
        </div>
      </div>
    </main>
  )
}
