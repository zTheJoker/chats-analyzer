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
  // Calculate total words excluding WhatsApp system words
  const totalWords = Object.values(chatData.userStats)
    .reduce((sum, stats) => sum + stats.wordCount, 0)

  // Calculate average messages per day
  const totalDays = Object.keys(chatData.messageCountByDate).length
  const avgMessagesPerDay = Math.round(chatData.totalMessages / totalDays)

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
            {avgMessagesPerDay} messages per day
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Type className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-800">Total Words</h3>
          </div>
          <p className="text-3xl font-semibold text-purple-700">
            {totalWords.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {Math.round(totalWords / chatData.totalMessages)} words per message
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
          <p className="text-sm text-green-600 mt-1">
            {emojiStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()} total emojis used
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyStatistics 