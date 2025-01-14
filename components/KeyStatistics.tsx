import React, { useState } from 'react'
import { ChatData, UserStats } from '../types/chat'
import { ChevronDown, ChevronUp, MessageCircle, Type, Smile } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  const userKeyStats: UserKeyStats[] = Object.entries(chatData.userStats)
    .map(([user, stats]) => {
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
    })
    .sort((a, b) => b.messageCount - a.messageCount)

  const displayedUsers = showAllUsers ? userKeyStats : userKeyStats.slice(0, 5)
  
  // Prepare data for bar charts
  const messageData = displayedUsers.map(stats => ({
    name: stats.user,
    Messages: stats.messageCount,
    Words: stats.wordCount,
    Emojis: stats.emojiCount
  }))

  const emojiBarData = emojiStats.slice(0, 8).map(stat => ({
    name: stat.emoji,
    count: stat.count
  }))

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Chat Overview</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-800">Total Messages</h3>
          </div>
          <p className="text-3xl font-semibold text-blue-700">
            {chatData.totalMessages.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {Math.round(chatData.averageMessagesPerDay)} messages per day
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Type className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-800">Total Words</h3>
          </div>
          <p className="text-3xl font-semibold text-purple-700">
            {Object.values(chatData.userStats)
              .reduce((sum, stats) => sum + stats.wordCount, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Over {Object.keys(chatData.messageCountByDate).length} days
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Smile className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-800">Most Used Emojis</h3>
          </div>
          <p className="text-2xl leading-relaxed">
            {emojiStats.slice(0, 5).map(e => e.emoji).join(' ')}
          </p>
          <p className="text-sm text-green-600 mt-1">Top 5 most frequently used</p>
        </div>
      </div>

      {/* User Activity Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">User Activity</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={messageData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emoji Usage Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Emoji Usage</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={emojiBarData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed User Stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed User Statistics</h3>
        
        {displayedUsers.map((stats, index) => (
          <div 
            key={stats.user}
            className="bg-gray-50 rounded-xl p-6 transition-all hover:bg-gray-100 border border-gray-200"
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
            className="w-full mt-4 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 transition-colors border border-gray-200"
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