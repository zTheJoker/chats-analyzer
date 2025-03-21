import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { PostHogProvider } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'WhatsApp Chat Analyzer - Free Online Chat Analysis Tool',
    template: '%s | WhatsApp Chat Analyzer'
  },
  description: 'Free WhatsApp chat analyzer tool. Get detailed insights about message patterns, emoji usage, chat statistics, response times, and more. 100% private & secure - all analysis happens in your browser without sending data to any server.',
  keywords: [
    'WhatsApp chat analyzer',
    'WhatsApp message analysis',
    'chat statistics',
    'WhatsApp conversation analysis',
    'message patterns',
    'chat insights',
    'WhatsApp data analysis',
    'chat history analyzer',
    'WhatsApp chat statistics',
    'analyze WhatsApp messages',
    'free WhatsApp analyzer',
    'WhatsApp chat statistics tool',
    'private chat analyzer',
    'WhatsApp data visualization',
    'WhatsApp chat export analysis',
    'WhatsApp chat txt file analyzer',
    'chat stats WhatsApp',
    'WhatsApp analyser'
  ],
  authors: [{ name: 'ConvoAnalyzer' }],
  creator: 'ConvoAnalyzer',
  publisher: 'ConvoAnalyzer',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://convoanalyzer.com',
    title: 'WhatsApp Chat Analyzer - Free Online Chat Analysis Tool',
    description: 'Analyze your WhatsApp chats instantly with our free online tool. Get detailed message patterns, emoji stats, response times, and chat insights. 100% private & secure - your data never leaves your device.',
    siteName: 'WhatsApp Chat Analyzer',
    images: [{
      url: '/logo-512x512.png',
      width: 512,
      height: 512,
      alt: 'WhatsApp Chat Analyzer Logo'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Chat Analyzer - Free Online Chat Analysis Tool',
    description: 'Analyze your WhatsApp chats instantly with our free online tool. Get detailed message patterns, emoji stats, response times, and chat insights. 100% private & secure - your data never leaves your device.',
    images: [{
      url: '/logo-512x512.png',
      width: 512,
      height: 512,
      alt: 'WhatsApp Chat Analyzer Logo'
    }],
  },
  alternates: {
    canonical: 'https://convoanalyzer.com'
  },
  verification: {
    google: 'google-site-verification'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
