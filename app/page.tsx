'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '../components/FileUpload'
import Benefits from '../components/Benefits'
import { processWhatsAppChat } from '../utils/chatProcessor'

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStats, setProcessingStats] = useState<{ processed: number; skipped: number } | null>(null)
  const router = useRouter()

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
      
      // Store the processed data in IndexedDB
      const dbName = 'WhatsAppAnalyzer'
      const storeName = 'chatData'
      const request = indexedDB.open(dbName, 1)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        db.createObjectStore(storeName)
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        store.put(processedData, 'currentChat')

        transaction.oncomplete = () => {
          setProcessingStats({
            processed: processedData.totalMessages,
            skipped: processedData.systemMessages.length
          })
          router.push('/results')
        }
      }

      request.onerror = () => {
        throw new Error('Failed to store chat data in IndexedDB')
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            WhatsApp Chat Analyzer
          </h1>
          <p className="text-2xl text-center text-gray-600 mb-12">
            Unlock insights from your conversations with our powerful, private, and secure analyzer.
          </p>
          
          <Benefits />

          <div className="bg-white p-8 rounded-3xl shadow-2xl mt-16">
            <h2 className="text-3xl font-semibold mb-6">Analyze Your Chat</h2>
            <p className="text-lg text-gray-600 mb-6">
              Export your WhatsApp chat and upload the .txt file here. All processing happens in your browser - your data stays with you.
            </p>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
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

          <p className="text-sm text-center text-gray-500 mt-16">
            By using this service, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  )
}

