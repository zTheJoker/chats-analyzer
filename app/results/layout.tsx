import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp Chat Analysis Results',
  description: 'View your WhatsApp chat analysis results. Get detailed insights about message patterns, emoji usage, and chat statistics.',
  robots: {
    index: false, // Don't index individual results pages
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'WhatsApp Chat Analysis Results | WhatsApp Chat Analyzer',
    description: 'View detailed WhatsApp chat analysis with message patterns, emoji stats, and conversation insights.',
    images: [{
      url: '/logo.svg',
      width: 1200,
      height: 630,
      alt: 'WhatsApp Chat Analysis Results'
    }],
  },
  twitter: {
    title: 'WhatsApp Chat Analysis Results | WhatsApp Chat Analyzer',
    description: 'View detailed WhatsApp chat analysis with message patterns, emoji stats, and conversation insights.',
    images: [{
      url: '/logo.svg',
      alt: 'WhatsApp Chat Analysis Results'
    }],
  }
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 