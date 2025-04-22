import React from 'react'
import { MessageData } from '../types/chat'

interface MostRepliedMessagesProps {
  messages: { message: MessageData; replyCount: number }[]
}

const MostRepliedMessages: React.FC<MostRepliedMessagesProps> = ({ messages }) => {
  // Don't render anything if there are no replied messages
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Top {messages.length} Most Replied Messages</h3>
      <div className="space-y-6">
        {messages.map(({ message, replyCount }, index) => (
          <div key={index} className="flex items-start border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold">
                {message.user.slice(0, 1).toUpperCase()}
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-700">{message.user}</p>
                <span className="text-xs text-gray-500">{message.date} {message.time}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{message.message}</p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MostRepliedMessages

