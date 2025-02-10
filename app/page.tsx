'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '../components/FileUpload'
import Benefits from '../components/Benefits'
import { processWhatsAppChat } from '../utils/chatProcessor'
import { dbService } from '../utils/storage'
import Link from 'next/link'
import { PremiumOfferPopup } from '../components/PremiumOfferPopup'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStats, setProcessingStats] = useState<{ processed: number; skipped: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Initialize IndexedDB when component mounts
    const initDB = async () => {
      try {
        await dbService.init({
          onError: (error) => {
            console.error('IndexedDB error:', error)
            setError('Failed to initialize storage. Please try using a different browser or enable cookies.')
          },
          onBlocked: () => {
            setError('Please close other tabs with this site open and try again.')
          }
        })
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error)
        setError('Storage initialization failed. Please try using a different browser or enable cookies.')
      }
    }
    initDB()
    return () => {
      setMounted(false)
      dbService.close()
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setProcessingStats(null)
    try {
      const text = await file.text()
      if (!text) {
        throw new Error('The uploaded file is empty')
      }
      const processedData = await processWhatsAppChat(text)
      
      try {
        await dbService.store('currentChat', processedData)
        setProcessingStats({
          processed: processedData.totalMessages,
          skipped: processedData.systemMessages.length
        })
        router.push('/results')
      } catch (dbError) {
        console.error('Storage error:', dbError)
        throw new Error('Failed to store chat data. Please try using a different browser or enable cookies.')
      }
    } catch (err) {
      console.error('Error processing chat data:', err)
      let errorMessage = 'An error occurred while processing the chat data. '
      if (err instanceof Error) {
        errorMessage += err.message
      } else {
        errorMessage += 'Unknown error'
      }
      errorMessage += ' Some lines may have been skipped due to invalid formats. Please check the console for more details.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const MainContent = () => (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-6xl text-4xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            WhatsApp Chat Analyzer
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-600 mb-8 md:mb-12">
            Unlock insights from your conversations with our powerful, private, and secure analyzer.
          </p>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl mb-12 md:mt-16">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Analyze Your Chat</h2>
            <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
              Export your WhatsApp chat and upload the .txt file here. All processing happens in your browser - your data stays with you.
            </p>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            
            <div className="mt-3 md:mt-4 text-center text-xs md:text-sm text-gray-500">
              <p>
                Need help exporting your chat?{' '}
                <Link href="/export" className="text-blue-600 hover:text-blue-700 hover:underline">
                  View step-by-step guide
                </Link>
              </p>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
                <p className="mt-2">Please check the browser console for more detailed information about skipped lines.</p>
              </div>
            )}
            {processingStats && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-bold">Processing Complete:</p>
                <p>Processed {processingStats.processed} messages.</p>
                <p>Skipped {processingStats.skipped} lines.</p>
                {processingStats.skipped > 0 && (
                  <p className="mt-2">Some lines were skipped due to invalid formats. Check the console for details.</p>
                )}
              </div>
            )}
          </div>

          <Benefits />

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
            <ol className="text-left inline-block">
              <li className="flex items-center mb-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">1</span>
                Export your WhatsApp chat
              </li>
              <li className="flex items-center mb-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">2</span>
                Upload the .txt file
              </li>
              <li className="flex items-center mb-4">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">3</span>
                Get instant insights
              </li>
            </ol>
          </div>

          <footer className="mt-16 py-6 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-sm text-gray-500">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p>
                    For support: <a href="mailto:support@convoanalyzer.com" className="text-gray-600 hover:underline">support@convoanalyzer.com</a>
                  </p>
                  <p>
                    <a href="/terms" className="text-gray-600 hover:underline">Terms</a>
                    {' · '}
                    <a href="/privacy" className="text-gray-600 hover:underline">Privacy</a>
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-12" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <PremiumOfferPopup />
      <MainContent />
    </main>
  )
}

