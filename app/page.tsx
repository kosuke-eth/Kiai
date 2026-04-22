"use client";

import { Header } from "@/components/nbg/header";
import { LandingPage } from "@/components/nbg/landing-page";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <LandingPage />
    </main>
  );
}
