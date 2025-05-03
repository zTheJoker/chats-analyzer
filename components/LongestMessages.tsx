import React, { useState } from 'react'
import { MessageData } from '../types/chat'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useIsMobile } from '../hooks/use-mobile'

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
      <div className="bg-[#e5ddd5] p-4 rounded-lg bg-[url('/whatsapp-bg.png')] bg-repeat">
        <ul className="space-y-4">
          {messages.map((message, index) => {
            const isExpanded = expandedMessages.includes(index)
            const messageText = message.message
            const shouldTruncate = messageText.length > MESSAGE_PREVIEW_LENGTH && !isExpanded

            // Determine the message position based on the user (alternating sides)
            const isOddIndex = index % 2 !== 0

            return (
              <li key={index} className={`flex ${isOddIndex ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${isOddIndex ? 'bg-white' : 'bg-[#d9fdd3]'} rounded-lg p-3 shadow-sm`}>
                  {/* Header with user info */}
                  <div className="mb-1">
                    <span className={`font-medium text-sm ${isOddIndex ? 'text-blue-600' : 'text-green-700'}`}>
                      {message.user}
                    </span>
                  </div>

                  {/* Message content */}
                  <div className="relative">
                    <p className={`text-sm text-gray-800 whitespace-pre-wrap break-words
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
                  </div>

                  {/* Timestamp and show more/less button */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {message.date} {message.time}
                    </span>
                    
                    {messageText.length > MESSAGE_PREVIEW_LENGTH && (
                      <button
                        onClick={() => toggleMessage(index)}
                        className="text-gray-600 text-xs flex items-center hover:text-gray-800 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default LongestMessages

