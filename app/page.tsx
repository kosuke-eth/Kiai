"use client";

import { Header } from "@/components/nbg/header";
import { LandingPage } from "@/components/nbg/landing-page";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            color: "#1a1a1a",
          },
        }}
      />
      <Header />
      <LandingPage />
    </main>
  );
}
