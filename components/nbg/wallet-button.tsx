"use client"

import { useCurrentAccount, useDisconnectWallet, useWallets, useConnectWallet } from "@mysten/dapp-kit"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ChevronDown, LogOut, Copy, Check, X } from "lucide-react"

import { useZkLogin } from "@/hooks/use-zklogin"

export function WalletButton() {
  const wallets = useWallets()
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const currentAccount = useCurrentAccount()
  const { session, isReady: zkLoginReady, initiateGoogleLogin, clearSession } = useZkLogin()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const connectedAddress = currentAccount?.address ?? session?.address
  const isZkLoginSession = !currentAccount?.address && Boolean(session?.address)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyAddress = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    if (currentAccount) {
      disconnect()
    } else {
      clearSession()
    }
    setShowDropdown(false)
  }

  // Connected state
  if (connectedAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{formatAddress(connectedAddress)}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 bg-card border border-border shadow-lg z-50"
              >
                <div className="p-4 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    {isZkLoginSession ? "Connected with Google zkLogin" : "Connected Wallet"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{formatAddress(connectedAddress)}</p>
                    <button
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {isZkLoginSession ? "Sign out" : "Disconnect"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Not connected state
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md border border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold">Connect Wallet</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Sui wallet to start making predictions and earning KP.
                </p>

                <div className="space-y-2">
                  {zkLoginReady ? (
                    <button
                      onClick={async () => {
                        setShowModal(false)
                        await initiateGoogleLogin()
                      }}
                      className="w-full flex items-center gap-3 p-3 border border-primary/40 bg-primary/10 hover:border-primary hover:bg-primary/15 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-black">
                        G
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Continue with Google</p>
                        <p className="text-xs text-muted-foreground">zkLogin on Sui</p>
                      </div>
                    </button>
                  ) : null}

                  {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => {
                          connect({ wallet })
                          setShowModal(false)
                        }}
                        className="w-full flex items-center gap-3 p-3 border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {wallet.icon && (
                          <img 
                            src={wallet.icon} 
                            alt={wallet.name} 
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <div className="text-left">
                          <p className="font-semibold">{wallet.name}</p>
                          <p className="text-xs text-muted-foreground">Sui Wallet</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No Sui wallets detected. Install one of the following:
                      </p>
                      {[
                        { name: "Sui Wallet", url: "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" },
                        { name: "Slush", url: "https://slush.app" },
                        { name: "Suiet", url: "https://suiet.app" },
                        { name: "Nightly", url: "https://nightly.app" },
                        { name: "Ethos Wallet", url: "https://ethoswallet.xyz" },
                        { name: "Martian Wallet", url: "https://martianwallet.xyz" },
                        { name: "Glass Wallet", url: "https://glasswallet.app" },
                        { name: "Elli Wallet", url: "https://elliwallet.com" },
                        { name: "Frontier", url: "https://frontier.xyz" },
                        { name: "Surf Wallet", url: "https://surf.tech" },
                        { name: "OKX Wallet", url: "https://www.okx.com/web3" },
                        { name: "Bitget Wallet", url: "https://web3.bitget.com" },
                        { name: "Trust Wallet", url: "https://trustwallet.com" },
                        { name: "Coin98", url: "https://coin98.com" },
                        { name: "SafePal", url: "https://safepal.com" },
                      ].map((wallet) => (
                        <a
                          key={wallet.name}
                          href={wallet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="font-semibold">{wallet.name}</span>
                          </div>
                          <span className="text-xs text-primary">Install</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  By connecting, you agree to the Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
