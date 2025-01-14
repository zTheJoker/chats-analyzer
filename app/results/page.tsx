'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChatStats from '../../components/ChatStats'
import WeekdayActivity from '../../components/WeekdayActivity'
import MessageLengthDistribution from '../../components/MessageLengthDistribution'
import LongestMessages from '../../components/LongestMessages'
import EmojiStats from '../../components/EmojiStats'
import LinkStats from '../../components/LinkStats'
import ConversationStarters from '../../components/ConversationStarters'
import InactivityPeriods from '../../components/InactivityPeriods'
import LongestConversations from '../../components/LongestConversations'
import MostRepliedMessages from '../../components/MostRepliedMessages'
import { ChatData } from '../../types/chat'
import KeyStatistics from '../../components/KeyStatistics'
import DownloadPDF from '../../components/DownloadPDF'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default function Results() {
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [router])

  if (!chatData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center">WhatsApp Chat Analysis Results</h1>
        <DownloadPDF />
      </div>

      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          All processing is done locally in your browser. Your chat data never leaves your device.
        </AlertDescription>
      </Alert>

      <div id="report-content" className="space-y-8">
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
    </main>
  )
}

