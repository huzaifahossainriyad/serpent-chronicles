import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'রিয়াদ সাপ গেম - Riyad Snake Game',
  description: 'রিয়াদের মজাদার অফলাইন সাপ গেম যা বাংলায় খেলা যায়। কীবোর্ড দিয়ে নিয়ন্ত্রণ করুন এবং সর্বোচ্চ স্কোর অর্জন করুন।',
  keywords: ['snake game', 'সাপ গেম', 'riyad snake game', 'bangla game', 'offline game'],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: 'https://snake-game.example.com',
    siteName: 'রিয়াদ সাপ গেম',
    title: 'রিয়াদ সাপ গেম - Riyad Snake Game',
    description: 'রিয়াদের মজাদার অফলাইন সাপ গেম যা বাংলায় খেলা যায়',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
