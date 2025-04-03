import React from 'react'
import { MessageSquare, ArrowUp, ArrowDown } from 'lucide-react'

interface ConversationStartersProps {
  data: {
    firstMessage: Record<string, number>
    lastMessage: Record<string, number>
  }
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversation Starters */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-[#075e54] text-white p-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h4 className="font-medium">Top Conversation Starters</h4>
          </div>
          
          <div className="bg-[#e5ddd5] p-4 bg-[url('/whatsapp-bg.png')] bg-repeat">
            <ul className="space-y-3">
              {sortedFirstMessage.map(([user, count], index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    {user.charAt(0)}
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-blue-700">{user}</span>
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <ArrowUp className="w-3 h-3" />
                        <span>{count} times</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Initiates conversations frequently</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Conversation Closers */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-[#075e54] text-white p-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h4 className="font-medium">Top Conversation Closers</h4>
          </div>
          
          <div className="bg-[#e5ddd5] p-4 bg-[url('/whatsapp-bg.png')] bg-repeat">
            <ul className="space-y-3">
              {sortedLastMessage.map(([user, count], index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white flex-shrink-0">
                    {user.charAt(0)}
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-red-700">{user}</span>
                      <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <ArrowDown className="w-3 h-3" />
                        <span>{count} times</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Usually has the last word</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationStarters

