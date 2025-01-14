import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://convoanalyzer.com',
    title: 'WhatsApp Chat Analyzer',
    description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer',
    siteName: 'WhatsApp Chat Analyzer'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Chat Analyzer',
    description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Toaster />
    </html>
  )
}
