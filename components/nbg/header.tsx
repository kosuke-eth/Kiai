"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Coins, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletButton } from "./wallet-button";
import { useCurrentAccount } from "@mysten/dapp-kit";

const NAV_ITEMS = [
  { label: "EVENTS", href: "/events" },
  { label: "PREDICTIONS", href: "/predictions" },
  { label: "ATHLETES", href: "/athletes" },
  { label: "LEADERBOARD", href: "/leaderboard" },
  { label: "MARKETPLACE", href: "/marketplace" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const points = 12450; // Demo points

  return (
    <header className="sticky top-0 z-50 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-primary">
              KIAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Points Display - only show when connected */}
            {currentAccount && (
              <div className="hidden sm:flex items-center gap-2 bg-primary/20 px-3 py-1.5">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {points.toLocaleString()} KP
                </span>
              </div>
            )}

            {/* Search */}
            <button className="hidden md:flex items-center justify-center w-9 h-9 hover:bg-sidebar-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Wallet Button */}
            <WalletButton />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-sidebar border-t border-sidebar-border"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {currentAccount && (
                <div className="flex items-center gap-2 px-4 py-3 mt-2 bg-primary/10">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    {points.toLocaleString()} KP
                  </span>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
