"use client";

import { Header } from "@/components/nbg/header";
import { AthletesPage } from "@/components/nbg/athletes-page";
import { Toaster } from "sonner";

export default function Athletes() {
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
      <Header points={1250} isConnected={true} />
      <AthletesPage />
    </main>
  );
}
