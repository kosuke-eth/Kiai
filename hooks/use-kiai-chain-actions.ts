"use client"

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSignTransaction,
  useSuiClient,
} from "@mysten/dapp-kit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fromBase64, normalizeSuiAddress } from "@mysten/sui/utils"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { getZkLoginSignature } from "@mysten/sui/zklogin"

import { kiaiApi } from "@/lib/kiai/api"
import { isSuiWriteConfigured, suiConfig } from "@/lib/sui/config"
import {
  createAllocateInsightTransaction,
  createClaimBadgeTransaction,
  createClaimEnergyTransaction,
} from "@/lib/sui/transactions"
import { Transaction } from "@mysten/sui/transactions"
import type { KiaiScenario, ScenarioSide } from "@/lib/kiai/types"
import { useZkLogin } from "@/hooks/use-zklogin"

export function useKiaiChainActions(address: string) {
  const queryClient = useQueryClient()
  const currentAccount = useCurrentAccount()
  const client = useSuiClient()
  const signTransaction = useSignTransaction()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()
  const signPersonalMessage = useSignPersonalMessage()
  const { session: zkLoginSession } = useZkLogin()

  const activeAddress = currentAccount?.address ?? zkLoginSession?.address ?? address
  const chainReady = isSuiWriteConfigured() && Boolean(currentAccount?.address || zkLoginSession?.address)
  const sponsorEndpoint = suiConfig.sponsoredTxEndpoint

  async function executeTransaction(
    transaction: Transaction,
    sponsorAction:
      | { action: "claim_badge"; sender: string }
      | { action: "claim_energy"; sender: string }
      | {
          action: "allocate_insight"
          sender: string
          chainScenarioId: string
          side: "yes" | "no"
          energyAmount: number
        },
  ) {
    if (!currentAccount?.address && !zkLoginSession?.address) {
      throw new Error("A connected wallet or zkLogin session is required")
    }

    async function createSponsorAuth(sender: string) {
      const challenge = await kiaiApi.createSponsorChallenge(sender)
      const messageBytes = new TextEncoder().encode(challenge.message)

      if (zkLoginSession && !currentAccount?.address) {
        const ephemeralKeypair = Ed25519Keypair.fromSecretKey(zkLoginSession.ephemeralSecretKey)
        const { signature: userSignature } = await ephemeralKeypair.signPersonalMessage(messageBytes)
        return {
          message: challenge.message,
          token: challenge.token,
          signature: getZkLoginSignature({
            inputs: zkLoginSession.signatureInputs,
            maxEpoch: zkLoginSession.maxEpoch,
            userSignature,
          }),
        }
      }

      const signed = await signPersonalMessage.mutateAsync({
        message: messageBytes,
      })
      return {
        message: challenge.message,
        token: challenge.token,
        signature: signed.signature,
      }
    }

    if (sponsorEndpoint) {
      let payload: Awaited<ReturnType<typeof kiaiApi.sponsorTransaction>>
      try {
        payload = await kiaiApi.sponsorTransaction({
          ...sponsorAction,
          auth: await createSponsorAuth(sponsorAction.sender),
        })
      } catch (error) {
        if (currentAccount?.address && error instanceof Error && /not configured/i.test(error.message)) {
          return signAndExecuteTransaction.mutateAsync({
            transaction,
          })
        }

        throw error
      }

      const requiresSponsorSignature =
        normalizeSuiAddress(payload.sponsorAddress) !== normalizeSuiAddress(sponsorAction.sender)

      if (zkLoginSession && !currentAccount?.address) {
        const ephemeralKeypair = Ed25519Keypair.fromSecretKey(zkLoginSession.ephemeralSecretKey)
        const { signature: userSignature } = await ephemeralKeypair.signTransaction(fromBase64(payload.sponsoredTransactionBytes))
        const zkLoginSignature = getZkLoginSignature({
          inputs: zkLoginSession.signatureInputs,
          maxEpoch: zkLoginSession.maxEpoch,
          userSignature,
        })

        return client.executeTransactionBlock({
          transactionBlock: payload.sponsoredTransactionBytes,
          signature: requiresSponsorSignature ? [zkLoginSignature, payload.sponsorSignature] : zkLoginSignature,
          options: {
            showEffects: true,
          },
        })
      }

      const sponsoredTransaction = Transaction.from(fromBase64(payload.sponsoredTransactionBytes))
      const signed = await signTransaction.mutateAsync({
        transaction: sponsoredTransaction,
      })
      return client.executeTransactionBlock({
        transactionBlock: payload.sponsoredTransactionBytes,
        signature: requiresSponsorSignature ? [signed.signature, payload.sponsorSignature] : signed.signature,
        options: {
          showEffects: true,
        },
      })
    }

    if (zkLoginSession && !currentAccount?.address) {
      throw new Error("zkLogin execution requires sponsored transactions")
    }

    return signAndExecuteTransaction.mutateAsync({
      transaction,
    })
  }

  const claimBadge = useMutation({
    mutationFn: async () => {
      if (!chainReady) {
        return kiaiApi.claimBadge(address)
      }

      const result = await executeTransaction(createClaimBadgeTransaction(), {
        action: "claim_badge",
        sender: activeAddress,
      })
      await kiaiApi.claimBadge(activeAddress, result.digest)
      return kiaiApi.getProfile(activeAddress)
    },
    onSuccess: () => {
      toast.success("KIAI Badge claimed", {
        description: chainReady
          ? sponsorEndpoint
            ? "The badge claim used a sponsored Sui transaction and then synced the local read model."
            : "The badge claim was signed with your wallet and mirrored into the local read model."
          : "Your white belt badge is now active on the testnet profile.",
      })
      queryClient.invalidateQueries({ queryKey: ["kiai-profile", address] })
      queryClient.invalidateQueries({ queryKey: ["kiai-leaderboard"] })
    },
    onError: (error) => {
      toast.error("Unable to claim badge", { description: error.message })
    },
  })

  const claimEnergy = useMutation({
    mutationFn: async () => {
      if (!chainReady) {
        return kiaiApi.claimEnergy(address)
      }

      const result = await executeTransaction(createClaimEnergyTransaction(), {
        action: "claim_energy",
        sender: activeAddress,
      })
      await kiaiApi.claimEnergy(activeAddress, result.digest)
      return kiaiApi.getProfile(activeAddress)
    },
    onSuccess: () => {
      toast.success("KIAI Energy loaded", {
        description: chainReady
          ? sponsorEndpoint
            ? "The refill used a sponsored Sui transaction and then synced the local read model."
            : "The energy refill was signed onchain and mirrored into the local read model."
          : "600 energy has been added to your live-event balance.",
      })
      queryClient.invalidateQueries({ queryKey: ["kiai-profile", address] })
    },
    onError: (error) => {
      toast.error("Unable to claim energy", { description: error.message })
    },
  })

  const allocateInsight = useMutation({
    mutationFn: async (input: { scenario: KiaiScenario; side: ScenarioSide; energyAmount: number }) => {
      if (!chainReady || !input.scenario.chainScenarioId) {
        return kiaiApi.allocateInsight({
          scenarioId: input.scenario.id,
          address: activeAddress,
          side: input.side,
          energyAmount: input.energyAmount,
        })
      }

      const result = await executeTransaction(
        createAllocateInsightTransaction({
          chainScenarioId: input.scenario.chainScenarioId,
          side: input.side,
          energyAmount: input.energyAmount,
        }),
        {
          action: "allocate_insight",
          sender: activeAddress,
          chainScenarioId: input.scenario.chainScenarioId,
          side: input.side,
          energyAmount: input.energyAmount,
        },
      )

      return kiaiApi.allocateInsight({
        scenarioId: input.scenario.id,
        address: activeAddress,
        side: input.side,
        energyAmount: input.energyAmount,
        txDigest: result.digest,
      })
    },
    onSuccess: (_, variables) => {
      toast.success("Insight synchronized", {
        description: chainReady && variables.scenario.chainScenarioId
          ? sponsorEndpoint
            ? `${variables.energyAmount} energy used a sponsored Sui transaction and then synced locally.`
            : `${variables.energyAmount} energy was signed onchain and mirrored locally.`
          : `${variables.energyAmount} energy applied to ${variables.side.toUpperCase()}.`,
      })
      queryClient.invalidateQueries({ queryKey: ["kiai-profile", address] })
      queryClient.invalidateQueries({ queryKey: ["kiai-scenarios", "active"] })
      queryClient.invalidateQueries({ queryKey: ["kiai-leaderboard"] })
    },
    onError: (error) => {
      toast.error("Unable to allocate insight", { description: error.message })
    },
  })

  return {
    chainReady,
    claimBadge,
    claimEnergy,
    allocateInsight,
  }
}
