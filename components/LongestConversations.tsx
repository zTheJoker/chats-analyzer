import React, { useState } from 'react'
import { MessageData } from '../types/chat'

interface LongestConversationsProps {
  conversations: MessageData[][]
}

const LongestConversations: React.FC<LongestConversationsProps> = ({ conversations }) => {
  const [displayCount, setDisplayCount] = useState(5)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Longest Conversations</h3>
      <ul className="space-y-4">
        {conversations.slice(0, displayCount).map((conversation, index) => (
          <li key={index} className="border-b pb-2">
            <p className="font-semibold">{conversation[0].user} - {conversation.length} messages</p>
            <p className="text-sm text-gray-600">
              From: {conversation[0].date} {conversation[0].time}
              <br />
              To: {conversation[conversation.length - 1].date} {conversation[conversation.length - 1].time}
            </p>
            <p className="text-sm italic mt-2">"{conversation[0].message.slice(0, 50)}..."</p>
          </li>
        ))}
      </ul>
      {displayCount < conversations.length && (
        <button
          onClick={() => setDisplayCount(prev => prev + 5)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Show More
        </button>
      )}
    </div>
  )
}

export default LongestConversations

