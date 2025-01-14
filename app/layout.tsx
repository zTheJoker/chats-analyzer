import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: {
    default: 'WhatsApp Chat Analyzer',
    template: '%s | WhatsApp Chat Analyzer'
  },
  description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer. All processing happens in your browser.',
  keywords: ['WhatsApp', 'chat analysis', 'conversation analyzer', 'message statistics', 'chat insights'],
  authors: [{ name: 'ConvoAnalyzer' }],
  creator: 'ConvoAnalyzer',
  publisher: 'ConvoAnalyzer',
  robots: 'index, follow',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://convoanalyzer.com',
    title: 'WhatsApp Chat Analyzer',
    description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer',
    siteName: 'WhatsApp Chat Analyzer',
    images: ['/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Chat Analyzer',
    description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer',
    images: ['/logo.svg'],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
