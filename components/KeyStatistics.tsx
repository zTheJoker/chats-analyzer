import React, { useState } from 'react'
import { ChatData, UserStats } from '../types/chat'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface UserKeyStats {
  user: string
  messageCount: number
  wordCount: number
  averageWordsPerMessage: number
  uniqueWords: Set<string>
  emojiCount: number
  longestMessage: number
}

interface KeyStatisticsProps {
  chatData: ChatData
  emojiStats: { emoji: string; count: number }[]
}

const KeyStatistics: React.FC<KeyStatisticsProps> = ({ chatData, emojiStats }) => {
  const [showAllUsers, setShowAllUsers] = useState(false)

  // Calculate per-user statistics
  const userKeyStats: UserKeyStats[] = Object.entries(chatData.userStats).map(([user, stats]) => {
    const userMessages = chatData.messages.filter(m => m.user === user)
    const uniqueWords = new Set(
      userMessages
        .flatMap(m => m.message.toLowerCase().split(/\s+/))
        .filter(word => word.length > 2)
    )
    const longestMessage = Math.max(...userMessages.map(m => m.message.length))
    const emojiCount = userMessages.reduce((count, m) => 
      count + (m.message.match(/[\p{Emoji}]/gu)?.length || 0), 0
    )

    return {
      user,
      messageCount: stats.messageCount,
      wordCount: stats.wordCount,
      averageWordsPerMessage: Math.round(stats.wordCount / stats.messageCount),
      uniqueWords,
      emojiCount,
      longestMessage
    }
  }).sort((a, b) => b.messageCount - a.messageCount)

  const displayedUsers = showAllUsers ? userKeyStats : userKeyStats.slice(0, 5)
  const topEmojis = emojiStats.slice(0, 5).map(e => e.emoji).join(' ')

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Key Statistics</h2>
      
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Total Activity</h3>
          <p className="text-3xl font-semibold text-gray-900">
            {chatData.totalMessages.toLocaleString()} messages
          </p>
          <p className="text-xl text-gray-700 mt-1">
            {Object.values(chatData.userStats)
              .reduce((sum, stats) => sum + stats.wordCount, 0)
              .toLocaleString()} words
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Most Used Emojis</h3>
          <p className="text-3xl">{topEmojis}</p>
          <p className="text-sm text-gray-500 mt-2">Top 5 most frequently used</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Chat Period</h3>
          <p className="text-xl font-medium text-gray-900">
            {Object.keys(chatData.messageCountByDate).length} days
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {Math.round(chatData.averageMessagesPerDay)} messages per day
          </p>
        </div>
      </div>

      {/* Per-User Stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">User Statistics</h3>
        
        {displayedUsers.map((stats, index) => (
          <div 
            key={stats.user}
            className="bg-gray-50 rounded-xl p-6 transition-all hover:bg-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-800">
                {stats.user}
                {index === 0 && <span className="ml-2 text-sm text-blue-600">Most Active</span>}
              </h4>
              <span className="text-sm text-gray-500">
                {((stats.messageCount / chatData.totalMessages) * 100).toFixed(1)}% of total
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-xl font-medium text-gray-900">{stats.messageCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Words</p>
                <p className="text-xl font-medium text-gray-900">{stats.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Words</p>
                <p className="text-xl font-medium text-gray-900">{stats.uniqueWords.size.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Emojis Used</p>
                <p className="text-xl font-medium text-gray-900">{stats.emojiCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}

        {userKeyStats.length > 5 && (
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="w-full mt-4 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {showAllUsers ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show All Users <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default KeyStatistics 