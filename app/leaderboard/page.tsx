"use client";

import { Header } from "@/components/nbg/header";
import { LeaderboardPage } from "@/components/nbg/leaderboard-page";
import { Toaster } from "sonner";

export default function Leaderboard() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <LeaderboardPage />
    </main>
  );
}
