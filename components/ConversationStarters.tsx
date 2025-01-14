import React from 'react'
import { ConversationStarters as ConversationStartersType } from '../types/chat'

interface ConversationStartersProps {
  data: ConversationStartersType
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ data }) => {
  const sortedFirstMessage = Object.entries(data.firstMessage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const sortedLastMessage = Object.entries(data.lastMessage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Conversation Starters and Closers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-medium mb-2">Top Conversation Starters</h4>
          <ul className="space-y-2">
            {sortedFirstMessage.map(([user, count], index) => (
              <li key={index} className="flex justify-between">
                <span>{user}</span>
                <span>{count} times</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-2">Top Conversation Closers</h4>
          <ul className="space-y-2">
            {sortedLastMessage.map(([user, count], index) => (
              <li key={index} className="flex justify-between">
                <span>{user}</span>
                <span>{count} times</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConversationStarters

