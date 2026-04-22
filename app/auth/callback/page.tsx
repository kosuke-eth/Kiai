"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { useZkLogin } from "@/hooks/use-zklogin"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { completeZkLogin } = useZkLogin()
  const [message, setMessage] = useState("Completing zkLogin with Google...")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
    const idToken = queryParams.get("id_token") ?? hashParams.get("id_token")
    const error = queryParams.get("error") ?? hashParams.get("error")

    if (error) {
      setMessage(`Google login failed: ${error}`)
      return
    }

    if (!idToken) {
      setMessage("Missing Google id_token in callback response")
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
        <div className="w-full border border-border bg-card p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">KIAI zkLogin</p>
          <h1 className="mt-3 text-3xl font-black text-balance">Authenticating your Sui session</h1>
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
          {isPending ? <p className="mt-6 text-xs text-muted-foreground">Requesting salt and proof...</p> : null}
        </div>
      </div>
    </main>
  )
}
