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
      <ul className="space-y-6">
        {messages.map((message, index) => {
          const isExpanded = expandedMessages.includes(index)
          const messageText = message.message
          const shouldTruncate = messageText.length > MESSAGE_PREVIEW_LENGTH && !isExpanded

          return (
            <li key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex flex-col space-y-2">
                {/* Header with user info and timestamp */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-sm text-gray-900">
                    {message.user}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.date} {message.time}
                  </span>
                </div>

                {/* Message content */}
                <div className="relative">
                  <p className={`text-sm text-gray-600 whitespace-pre-wrap break-words
                    ${!isExpanded ? 'line-clamp-3' : ''}`}
                  >
                    {shouldTruncate 
                      ? messageText.slice(0, MESSAGE_PREVIEW_LENGTH)
                      : messageText
                    }
                    {shouldTruncate && !isExpanded && (
                      <span className="text-gray-400">...</span>
                    )}
                  </p>

                  {/* Gradient overlay for truncated messages */}
                  {shouldTruncate && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>

                {/* Show more/less button */}
                {messageText.length > MESSAGE_PREVIEW_LENGTH && (
                  <button
                    onClick={() => toggleMessage(index)}
                    className="text-blue-600 text-sm flex items-center hover:text-blue-700 transition-colors"
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

