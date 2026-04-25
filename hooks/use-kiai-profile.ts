"use client"

import { useQuery } from "@tanstack/react-query"

import { kiaiApi } from "@/lib/kiai/api"

export function useKiaiProfile(address: string) {
  return useQuery({
    queryKey: ["kiai-profile", address],
    queryFn: () => kiaiApi.getProfile(address),
    refetchInterval: 15_000,
  })
}
