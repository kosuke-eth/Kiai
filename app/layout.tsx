import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SuiWalletProvider } from '@/components/nbg/wallet-provider'
import { suiConfig } from '@/lib/sui/config'
import './globals.css'
import '@mysten/dapp-kit/dist/index.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'KIAI - Real-Time Fight Sentiment on Sui',
  description: 'A gasless, testnet-first fan sentiment experience for live ONE Championship moments on Sui.',
  icons: {
    icon: [
      {
        url: '/placeholder-logo.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/placeholder-logo.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/placeholder-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/placeholder-logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: suiConfig.network === 'testnet' ? '#d4a300' : '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SuiWalletProvider>
          {children}
        </SuiWalletProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
