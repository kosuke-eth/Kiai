"use client";

import { Header } from "@/components/nbg/header";
import { EventsPage } from "@/components/nbg/events-page";
import { Toaster } from "sonner";

export default function Events() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <EventsPage />
    </main>
  );
}
