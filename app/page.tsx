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
  const [processingStats, setProcessingStats] = useState<{ processed: number; skipped: number; mediaFiles?: number } | null>(null)
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

  const handleFileUpload = async (file: File, mediaFiles?: Array<{
    type: 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'other';
    url: string;
    name: string;
    size?: number;
    blob: Blob;
  }>) => {
    setIsLoading(true)
    setError(null)
    setProcessingStats(null)
    try {
      const text = await file.text()
      if (!text) {
        throw new Error('The uploaded file is empty')
      }
      const processedData = await processWhatsAppChat(text)
      
      // Add media data if available
      if (mediaFiles && mediaFiles.length > 0) {
        // Convert the blob media files to the format expected by ChatData
        processedData.media = mediaFiles.map(file => ({
          type: file.type,
          url: file.url,
          name: file.name,
          size: file.size
        }))
        processedData.hasMedia = true
      } else {
        processedData.hasMedia = false
      }
      
      try {
        await dbService.store('currentChat', processedData)
        setProcessingStats({
          processed: processedData.totalMessages,
          skipped: processedData.systemMessages.length,
          mediaFiles: mediaFiles?.length || 0
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
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <img src="/logo.png" alt="WhatsApp Analyzer Logo" className="h-8 sm:h-10 md:h-16 w-auto" />
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text leading-tight">
            WhatsApp Chat Analyzer
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center text-gray-600 mb-6 md:mb-8 lg:mb-12 px-2">
            Unlock insights from your conversations with our powerful, private, and secure analyzer.
          </p>
          
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl mb-8 sm:mb-12 md:mt-16 mx-2 sm:mx-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6">Analyze Your Chat</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 md:mb-6">
              Export your WhatsApp chat and upload the .txt file here. All processing happens in your browser - your data stays with you.
            </p>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            
            <div className="mt-3 md:mt-4 text-center text-xs sm:text-sm text-gray-500">
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

          <div className="mt-12 sm:mt-16 text-center px-2">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">How It Works</h3>
            <ol className="text-left inline-block text-sm sm:text-base">
              <li className="flex items-center mb-3 sm:mb-4">
                <span className="bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 text-sm sm:text-base flex-shrink-0">1</span>
                Export your WhatsApp chat
              </li>
              <li className="flex items-center mb-3 sm:mb-4">
                <span className="bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 text-sm sm:text-base flex-shrink-0">2</span>
                Upload the .txt file
              </li>
              <li className="flex items-center mb-3 sm:mb-4">
                <span className="bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 text-sm sm:text-base flex-shrink-0">3</span>
                Get instant insights
              </li>
            </ol>
          </div>
          
          <section className="mt-12 sm:mt-16 rounded-lg overflow-hidden shadow-lg mx-2 sm:mx-0">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">See What You'll Get</h2>
            </div>
            
            <div className="p-4 sm:p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-blue-700">Chat Overview</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Participant count & role insights
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Total message analytics
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Most-used emojis breakdown
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-purple-700">User Rankings</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Most/least active user badges
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Top 10 users pie chart
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Per-user message & word counts
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-green-700">Content Insights</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Most-common words list
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Message-length distribution
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Top longest & most-replied messages
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-amber-700">Temporal Analytics</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Message timeline visualization
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Hourly & weekday activity charts
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> "Biggest time-gap" call-out
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-blue-700">Media & Links</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Inline media gallery with counter
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Link statistics (total & top domains)
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-purple-700">Conversation Dynamics</h3>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Conversation starters/closers leaderboard
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Average response time distribution
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Fastest responder badge
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Full report export option
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 bg-blue-50 p-3 sm:p-4 md:p-5 rounded-lg">
                <p className="text-xs sm:text-sm text-center text-blue-600">All features are private and processed entirely in your browser – no data ever leaves your device.</p>
              </div>
            </div>
          </section>

          <section className="mt-12 sm:mt-16 p-4 sm:p-6 rounded-lg bg-gradient-to-r from-gray-50 to-white mx-2 sm:mx-0">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Why Choose WhatsApp Chat Analyzer?</h2>
              <div className="h-1 w-16 sm:w-24 mx-auto mt-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex">
                <div className="mr-3 sm:mr-4 text-blue-500 text-2xl sm:text-3xl flex-shrink-0">🔒</div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">100% Privacy Guaranteed</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Your data never leaves your device. All processing happens in your browser.</p>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex">
                <div className="mr-3 sm:mr-4 text-blue-500 text-2xl sm:text-3xl flex-shrink-0">⚡</div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Get insights in seconds, even with large chat exports.</p>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex">
                <div className="mr-3 sm:mr-4 text-green-500 text-2xl sm:text-3xl flex-shrink-0">🎁</div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">Completely Free</h3>
                  <p className="text-gray-600 text-sm sm:text-base">No registration, no hidden fees, no premium features locked away.</p>
                </div>
              </div>
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex">
                <div className="mr-3 sm:mr-4 text-purple-500 text-2xl sm:text-3xl flex-shrink-0">📊</div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1">Beautiful Visualizations</h3>
                  <p className="text-gray-600 text-sm sm:text-base">See your chat data come to life with interactive charts and graphs.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 sm:mt-16 rounded-lg overflow-hidden mx-2 sm:mx-0">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
              <h2 className="text-lg sm:text-xl font-bold">Ready to analyze your chats?</h2>
              <p className="mt-1 opacity-90 text-sm sm:text-base">It's free, private, and only takes a few seconds</p>
            </div>
          </section>

          <footer className="mt-12 sm:mt-16 py-4 sm:py-6 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-xs sm:text-sm text-gray-500">
                <div className="flex flex-col items-center mb-3 sm:mb-4">
                  <img src="/logo.png" alt="WhatsApp Chat Analyzer Logo" className="h-8 sm:h-10 w-auto mb-3 sm:mb-4" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
                  <p className="text-center md:text-left">
                    For support: <a href="mailto:support@convoanalyzer.com" className="text-gray-600 hover:underline">support@convoanalyzer.com</a>
                  </p>
                  <p className="text-center md:text-right">
                    <a href="/terms" className="text-gray-600 hover:underline">Terms</a>
                    {' · '}
                    <a href="/privacy" className="text-gray-600 hover:underline">Privacy</a>
                    {' · '}
                    <a href="/export" className="text-gray-600 hover:underline">How to Export</a>
                  </p>
                </div>
                <div className="flex justify-center mt-3 sm:mt-4">
                  <a href="https://www.producthunt.com/posts/whatsapp-chat-analyzer?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-whatsapp-chat-analyzer" target="_blank" rel="noopener noreferrer">
                    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=955186&theme=light&t=1745021768528" alt="WhatsApp Chat Analyzer - Free online whatapp chat analysis tool | Product Hunt" style={{width: "200px", height: "43px"}} width="200" height="43" className="sm:w-[250px] sm:h-[54px]" />
                  </a>
                </div>
                <p className="text-center mt-3 sm:mt-4 text-xs">© {new Date().getFullYear()} WhatsApp Chat Analyzer</p>
              </div>            </div>
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
    <main className="flex min-h-screen flex-col items-center justify-between p-2 sm:p-4 md:p-24">
      <PremiumOfferPopup />
      <MainContent />
    </main>
  )
}

