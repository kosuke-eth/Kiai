"use client";

import { Header } from "@/components/nbg/header";
import { RealtimePredictions } from "@/components/nbg/realtime-predictions";
import { Toaster } from "sonner";

export default function PredictionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <RealtimePredictions />
    </main>
  );
}
