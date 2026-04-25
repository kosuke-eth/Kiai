"use client"

import { Toaster } from "sonner"

import { Header } from "@/components/nbg/header"
import { AdminConsolePage } from "@/components/nbg/admin-console-page"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Header />
      <AdminConsolePage />
    </main>
  )
}
