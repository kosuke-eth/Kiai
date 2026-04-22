"use client";

import { Header } from "@/components/nbg/header";
import { AthletesPage } from "@/components/nbg/athletes-page";
import { Toaster } from "sonner";

export default function Athletes() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <AthletesPage />
    </main>
  );
}
