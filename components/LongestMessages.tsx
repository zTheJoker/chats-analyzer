import React from 'react'
import { MessageData } from '../types/chat'

interface LongestMessagesProps {
  messages: MessageData[]
}

const LongestMessages: React.FC<LongestMessagesProps> = ({ messages }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Top 5 Longest Messages</h3>
      <ul className="space-y-4">
        {messages.map((message, index) => (
          <li key={index} className="border-b pb-2">
            <p className="font-semibold">{message.user} - {message.date} {message.time}</p>
            <p className="text-sm text-gray-600">{message.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LongestMessages

