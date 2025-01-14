import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analysis Results',
  openGraph: {
    title: 'Analysis Results | WhatsApp Chat Analyzer',
    images: ['/logo.svg'],
  },
  twitter: {
    title: 'Analysis Results | WhatsApp Chat Analyzer',
    images: ['/logo.svg'],
  }
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 