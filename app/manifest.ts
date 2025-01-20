import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WhatsApp Chat Analyzer - Free Online Analysis Tool',
    short_name: 'Chat Analyzer',
    description: 'Free WhatsApp chat analyzer tool. Get instant insights from your conversations with complete privacy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ],
    categories: ['tools', 'utilities', 'social'],
    orientation: 'any',
    lang: 'en',
    dir: 'ltr',
  }
} 