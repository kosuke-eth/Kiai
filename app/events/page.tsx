"use client"

import dynamic from "next/dynamic"

const Header = dynamic(() => import("@/components/nbg/header").then((mod) => mod.Header), {
  ssr: false,
})
const EventsPage = dynamic(() => import("@/components/nbg/events-page").then((mod) => mod.EventsPage), {
  ssr: false,
})
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
})

export default function Events() {
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
      <EventsPage />
    </main>
  )
}
