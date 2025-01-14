import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { UserStats } from '../types/chat'

interface UserStatsCardProps {
  user: string
  stats: UserStats
  uniqueWords: Set<string>
  totalMessages: number
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ user, stats, uniqueWords, totalMessages }) => {
  const messagePercentage = ((stats.messageCount / totalMessages) * 100).toFixed(1)
  const averageWordsPerMessage = (stats.wordCount / stats.messageCount).toFixed(1)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl">{user}</span>
          <span className="text-sm text-gray-500">{messagePercentage}% of total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Messages</p>
            <p className="text-2xl font-semibold">{stats.messageCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Words</p>
            <p className="text-2xl font-semibold">{stats.wordCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unique Words</p>
            <p className="text-2xl font-semibold">{uniqueWords.size.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Words/Message</p>
            <p className="text-2xl font-semibold">{averageWordsPerMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserStatsCard 