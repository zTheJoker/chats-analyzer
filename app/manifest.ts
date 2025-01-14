import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WhatsApp Chat Analyzer',
    short_name: 'ChatAnalyzer',
    description: 'Analyze your WhatsApp chats with our powerful, private, and secure analyzer',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
  }
} 