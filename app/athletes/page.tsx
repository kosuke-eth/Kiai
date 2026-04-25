"use client"

import dynamic from "next/dynamic"

const Header = dynamic(() => import("@/components/nbg/header").then((mod) => mod.Header), {
  ssr: false,
})
const AthletesPage = dynamic(() => import("@/components/nbg/athletes-page").then((mod) => mod.AthletesPage), {
  ssr: false,
})
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
})

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
      <Header />
      <AthletesPage />
    </main>
  )
}
