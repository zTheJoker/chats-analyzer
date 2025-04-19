'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatData } from '@/types/chat'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { PremiumOfferPopup } from '@/components/PremiumOfferPopup'
import { WelcomeStatsPopup } from '@/components/WelcomeStatsPopup'
import { SupportPopup } from '@/components/SupportPopup'
import { dbService } from '@/utils/storage'

// Dynamically import components with ssr disabled
const ChatStats = dynamic(() => import('@/components/ChatStats'), { ssr: false })
const WeekdayActivity = dynamic(() => import('@/components/WeekdayActivity'), { ssr: false })
const MessageLengthDistribution = dynamic(() => import('@/components/MessageLengthDistribution'), { ssr: false })
const LongestMessages = dynamic(() => import('@/components/LongestMessages'), { ssr: false })
const EmojiStats = dynamic(() => import('@/components/EmojiStats'), { ssr: false })
const LinkStats = dynamic(() => import('@/components/LinkStats'), { ssr: false })
const ConversationStarters = dynamic(() => import('@/components/ConversationStarters'), { ssr: false })
const InactivityPeriods = dynamic(() => import('@/components/InactivityPeriods'), { ssr: false })
const LongestConversations = dynamic(() => import('@/components/LongestConversations'), { ssr: false })
const MostRepliedMessages = dynamic(() => import('@/components/MostRepliedMessages'), { ssr: false })
const KeyStatistics = dynamic(() => import('@/components/KeyStatistics'), { ssr: false })
const ResponseTimeStats = dynamic(() => import('@/components/ResponseTimeStats'), { ssr: false })
const DownloadPDF = dynamic(() => import('@/components/DownloadPDF'), { ssr: false })
const MediaGallery = dynamic(() => import('@/components/MediaGallery'), { ssr: false })

export default function Results() {
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeStats, setShowWelcomeStats] = useState(false)
  const [showProductHuntBanner, setShowProductHuntBanner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Product Hunt banner should be displayed (36 hours from July 17, 2024)
    const expirationTime = new Date('2025-04-20T12:00:00Z').getTime();
    const currentTime = new Date().getTime();
    setShowProductHuntBanner(currentTime < expirationTime);

    const fetchData = async () => {
      try {
        // Initialize IndexedDB
        await dbService.init({
          onError: (error) => {
            console.error('IndexedDB error:', error)
            setError('Failed to access storage. Please try using a different browser or enable cookies.')
            setTimeout(() => router.push('/'), 3000)
          },
          onBlocked: () => {
            setError('Please close other tabs with this site open and try again.')
            setTimeout(() => router.push('/'), 3000)
          }
        })

        // Retrieve chat data
        const data = await dbService.retrieve('currentChat')
        if (data) {
          setChatData(data)
          
          // Show welcome stats popup if user hasn't seen it before
          if (!localStorage.getItem('welcomeStatsShown')) {
            // Add small delay to ensure data is loaded and rendered
            setTimeout(() => setShowWelcomeStats(true), 500)
            localStorage.setItem('welcomeStatsShown', 'true')
          }
        } else {
          setError('No chat data found. Please upload a chat file first.')
          setTimeout(() => router.push('/'), 3000)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load chat data. Please try again.')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    fetchData()

    return () => {
      dbService.close()
    }
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2 text-sm">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  if (!chatData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PremiumOfferPopup isResultsPage={true} />
      <WelcomeStatsPopup 
        chatData={chatData} 
        isOpen={showWelcomeStats} 
        onOpenChange={setShowWelcomeStats} 
      />
      <SupportPopup trigger="scroll" />
      
      {showProductHuntBanner && (
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 border-b border-orange-200 py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <p className="font-medium text-orange-800">
                We're live on Product Hunt! If you enjoyed our tool, please give us an upvote 🙏
              </p>
              <a href="https://www.producthunt.com/posts/whatsapp-chat-analyzer?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-whatsapp-chat-analyzer" 
                target="_blank" 
                rel="noopener noreferrer">
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=955186&theme=light&t=1745021768528" 
                  alt="WhatsApp Chat Analyzer - Free online whatapp chat analysis tool | Product Hunt" 
                  style={{width: "250px", height: "54px"}} 
                  width="250" 
                  height="54" 
                />
              </a>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <img src="/logo.png" alt="WhatsApp Analyzer Logo" className="h-10 md:h-16 w-auto" />
        </div>
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            WhatsApp Chat Analysis Results
          </h1>
        </div>

        <div id="report-content" className="space-y-6 md:space-y-8">
          <KeyStatistics chatData={chatData} emojiStats={chatData.emojiStats} />
          <ChatStats chatData={chatData} />
          {chatData.hasMedia && chatData.media && chatData.media.length > 0 && (
            <MediaGallery media={chatData.media} />
          )}
          <WeekdayActivity data={chatData.weekdayActivity} />
          <MessageLengthDistribution data={chatData.messageLengthDistribution} />
          {chatData.responseTimeStats && (
            <ResponseTimeStats responseTimeStats={chatData.responseTimeStats} />
          )}
          <LongestMessages messages={chatData.longestMessages} />
          <EmojiStats emojiStats={chatData.emojiStats} userEmojiStats={chatData.userEmojiStats} />
          <LinkStats linkStats={chatData.linkStats} />
          <ConversationStarters data={chatData.conversationStarters} />
          <InactivityPeriods biggestTimeStop={chatData.biggestTimeStop} />
          <LongestConversations conversations={chatData.longestConversations} />
          <MostRepliedMessages messages={chatData.mostRepliedMessages} />
        </div>

        <div className="mt-8 md:mt-12 border-t border-gray-200 pt-6">
          <div className="flex flex-col items-center gap-4 md:gap-6 max-w-md mx-auto">
            <DownloadPDF />
            
            <Alert className="bg-gray-50 border-gray-200">
              <Info className="h-4 w-4 text-gray-500" />
              <AlertDescription className="text-sm text-gray-500">
                All processing is done locally in your browser - your data never leaves your device.
              </AlertDescription>
            </Alert>

            <div className="w-full flex flex-col items-center text-center text-sm text-gray-400 py-4">
              <div className="mb-4">
                <img src="/logo.png" alt="WhatsApp Analyzer Logo" className="h-10 w-auto" />
              </div>
              <div>
                <a href="/terms" className="hover:text-gray-600">Terms</a>
                {' · '}
                <a href="/privacy" className="hover:text-gray-600">Privacy</a>
                {' · '}
                <a href="mailto:support@convoanalyzer.com" className="hover:text-gray-600">Support</a>
              </div>
              <div className="mt-4">
                <a href="https://www.producthunt.com/posts/whatsapp-chat-analyzer?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-whatsapp-chat-analyzer" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=955186&theme=light&t=1745021768528" 
                    alt="WhatsApp Chat Analyzer - Free online whatapp chat analysis tool | Product Hunt" 
                    style={{width: "250px", height: "54px"}} 
                    width="250" 
                    height="54" 
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

