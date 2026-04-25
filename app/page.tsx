"use client"

import dynamic from "next/dynamic"

const Header = dynamic(() => import("@/components/nbg/header").then((mod) => mod.Header), {
  ssr: false,
})
const LandingPage = dynamic(() => import("@/components/nbg/landing-page").then((mod) => mod.LandingPage), {
  ssr: false,
})
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
})

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
  )
}
