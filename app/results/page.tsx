'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatData } from '@/types/chat'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

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
const DownloadPDF = dynamic(() => import('@/components/DownloadPDF'), { ssr: false })

export default function Results() {
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchData = async () => {
      try {
        const dbName = 'WhatsAppAnalyzer'
        const storeName = 'chatData'
        const request = indexedDB.open(dbName, 1)

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(storeName, 'readonly')
          const store = transaction.objectStore(storeName)
          const getRequest = store.get('currentChat')

          getRequest.onsuccess = () => {
            if (getRequest.result) {
              setChatData(getRequest.result)
            } else {
              router.push('/')
            }
          }
        }

        request.onerror = () => {
          console.error('Error opening IndexedDB')
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/')
      }
    }

    fetchData()
  }, [router])

  if (!chatData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            WhatsApp Chat Analysis Results
          </h1>
        </div>

        <div id="report-content" className="space-y-6 md:space-y-8">
          <KeyStatistics chatData={chatData} emojiStats={chatData.emojiStats} />
          <ChatStats chatData={chatData} />
          <WeekdayActivity data={chatData.weekdayActivity} />
          <MessageLengthDistribution data={chatData.messageLengthDistribution} />
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

            <div className="w-full text-center text-sm text-gray-400 py-4">
              <a href="/terms" className="hover:text-gray-600">Terms</a>
              {' · '}
              <a href="/privacy" className="hover:text-gray-600">Privacy</a>
              {' · '}
              <a href="mailto:support@convoanalyzer.com" className="hover:text-gray-600">Support</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

