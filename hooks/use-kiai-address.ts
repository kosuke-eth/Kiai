"use client"

import { useCurrentAccount } from "@mysten/dapp-kit"

import { DEFAULT_USER_ADDRESS } from "@/lib/kiai/constants"
import { useZkLogin } from "@/hooks/use-zklogin"

export function useKiaiAddress() {
  const currentAccount = useCurrentAccount()
  const { session } = useZkLogin()
  return currentAccount?.address ?? session?.address ?? DEFAULT_USER_ADDRESS
}
