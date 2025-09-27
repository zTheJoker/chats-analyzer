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

  // Get max count for percentage calculations
  const maxStarterCount = sortedFirstMessage.length > 0 ? sortedFirstMessage[0][1] : 0
  const maxCloserCount = sortedLastMessage.length > 0 ? sortedLastMessage[0][1] : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6">Conversation Starters and Closers</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Conversation Starters */}
        <div>
          <div className="flex items-center mb-4 gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowUp className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-xl font-medium text-gray-800">Top Conversation Starters</h4>
          </div>
          
          <ul className="space-y-4">
            {sortedFirstMessage.map(([user, count], index) => {
              const percentOfMax = Math.round((count / maxStarterCount) * 100)
              const initial = user.charAt(0)
              
              return (
                <li key={index} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                      {initial}
                    </div>
                    
                    {/* User info and stats */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{user}</span>
                        <span className="text-blue-600 font-bold">{count} times</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        Initiates conversations frequently
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        
        {/* Conversation Closers */}
        <div>
          <div className="flex items-center mb-4 gap-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="text-xl font-medium text-gray-800">Top Conversation Closers</h4>
          </div>
          
          <ul className="space-y-4">
            {sortedLastMessage.map(([user, count], index) => {
              const percentOfMax = Math.round((count / maxCloserCount) * 100)
              const initial = user.charAt(0)
              
              return (
                <li key={index} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-lg">
                      {initial}
                    </div>
                    
                    {/* User info and stats */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{user}</span>
                        <span className="text-orange-600 font-bold">{count} times</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full" 
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">
                        Usually has the last word
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConversationStarters

