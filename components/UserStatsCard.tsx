import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { UserStats } from '../types/chat'

interface UserStatsCardProps {
  user: string
  stats: UserStats
  uniqueWords: Set<string>
  totalMessages: number
  rank: number
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ user, stats, uniqueWords, totalMessages, rank }) => {
  const messagePercentage = totalMessages > 0 
    ? ((stats.messageCount / totalMessages) * 100).toFixed(1)
    : '0.0'
  // Ensure wordCount and messageCount are valid numbers to avoid NaN
  const averageWordsPerMessage = stats.messageCount > 0 
    ? (stats.wordCount / stats.messageCount).toFixed(1) 
    : '0.0'

  return (
    <Card className="hover:shadow-lg transition-shadow relative">
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
        #{rank}
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl">{user}</span>
          <span className="text-sm text-gray-500">{messagePercentage}% of total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Messages Sent</p>
            <p className="text-2xl font-semibold">{stats.messageCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Words Written</p>
            <p className="text-2xl font-semibold">{stats.wordCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unique Words Used</p>
            <p className="text-2xl font-semibold">{uniqueWords?.size?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Words/Message</p>
            <p className="text-2xl font-semibold">{averageWordsPerMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserStatsCard 