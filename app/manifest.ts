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
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon'
      },
      {
        src: '/logo-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {
        src: '/logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['tools', 'utilities', 'social'],
    orientation: 'any',
    lang: 'en',
    dir: 'ltr',
  }
} 