import React from 'react'
import { MessageData } from '../types/chat'

interface MostRepliedMessagesProps {
  messages: { message: MessageData; replyCount: number }[]
}

const MostRepliedMessages: React.FC<MostRepliedMessagesProps> = ({ messages }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Top 3 Most Replied Messages</h3>
      <ul className="space-y-4">
        {messages.map(({ message, replyCount }, index) => (
          <li key={index} className="border-b pb-2">
            <p className="font-semibold">{message.user} - {message.date} {message.time}</p>
            <p className="text-sm text-gray-600">{message.message}</p>
            <p className="text-sm font-medium mt-1">Replies: {replyCount}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MostRepliedMessages

