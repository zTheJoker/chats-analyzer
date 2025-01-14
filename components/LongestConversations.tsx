import React, { useState } from 'react'
import { MessageData } from '../types/chat'
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

interface LongestConversationsProps {
  conversations: MessageData[][]
}

const LongestConversations: React.FC<LongestConversationsProps> = ({ conversations }) => {
  const [displayCount, setDisplayCount] = useState(3)
  const MESSAGE_PREVIEW_LENGTH = 250

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">Longest Message Threads</h3>
      </div>

      <div className="space-y-6">
        {/* Top 3 conversations with full preview */}
        {conversations.slice(0, 3).map((conversation, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-r from-blue-50 to-transparent p-6 rounded-xl border border-blue-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-semibold text-blue-800">
                  {conversation[0].user}
                </span>
                <span className="ml-2 text-sm text-blue-600 font-medium">
                  {conversation.length} messages
                </span>
              </div>
              <span className="text-sm text-gray-500">
                #{index + 1}
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                From: {conversation[0].date} {conversation[0].time}
                <br />
                To: {conversation[conversation.length - 1].date} {conversation[conversation.length - 1].time}
              </p>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <p className="text-gray-700 leading-relaxed">
                  {conversation[0].message.slice(0, MESSAGE_PREVIEW_LENGTH)}
                  {conversation[0].message.length > MESSAGE_PREVIEW_LENGTH && "..."}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Expandable additional conversations */}
        {displayCount > 3 && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            {conversations.slice(3, displayCount).map((conversation, index) => (
              <div key={index + 3} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{conversation[0].user}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {conversation.length} messages
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {conversation[0].date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more/less button */}
        {conversations.length > 3 && (
          <button
            onClick={() => setDisplayCount(prev => prev === 3 ? 8 : 3)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            {displayCount === 3 ? (
              <>
                Show More <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default LongestConversations

