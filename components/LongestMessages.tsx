import React, { useState } from 'react'
import { MessageData } from '../types/chat'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface LongestMessagesProps {
  messages: MessageData[]
}

const LongestMessages: React.FC<LongestMessagesProps> = ({ messages }) => {
  const [expandedMessages, setExpandedMessages] = useState<number[]>([])
  const isMobile = useIsMobile()
  const MESSAGE_PREVIEW_LENGTH = isMobile ? 100 : 250

  const toggleMessage = (index: number) => {
    setExpandedMessages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Top 5 Longest Messages</h3>
      <ul className="space-y-4">
        {messages.map((message, index) => {
          const isExpanded = expandedMessages.includes(index)
          const messageText = message.message
          const shouldTruncate = messageText.length > MESSAGE_PREVIEW_LENGTH && !isExpanded

          return (
            <li key={index} className="border-b pb-2">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-sm">
                  {message.user}
                  <span className="text-gray-500 ml-2">
                    {message.date} {message.time}
                  </span>
                </p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {shouldTruncate 
                    ? `${messageText.slice(0, MESSAGE_PREVIEW_LENGTH)}...` 
                    : messageText
                  }
                </p>
                {messageText.length > MESSAGE_PREVIEW_LENGTH && (
                  <button
                    onClick={() => toggleMessage(index)}
                    className="text-blue-600 text-sm mt-1 flex items-center hover:text-blue-700"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show More
                      </>
                    )}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default LongestMessages

