import React, { useState } from 'react'
import { ChatData } from '../types/chat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import InactivityPeriods from './InactivityPeriods'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import UserStatsCard from './UserStatsCard'
import { ChevronUp, ChevronDown, Trophy, UserMinus } from 'lucide-react'

interface ChatStatsProps {
  chatData: ChatData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

const ChatStats: React.FC<ChatStatsProps> = ({ chatData }) => {
  const [selectedUser, setSelectedUser] = useState<string>('All Users')
  const [showAllUsers, setShowAllUsers] = useState(false)

  const userOptions = ['All Users', ...Object.keys(chatData.userStats)]

  const filteredTimeSeriesData = selectedUser === 'All Users'
    ? Object.entries(chatData.messageCountByDate).map(([date, count]) => ({ date, count }))
    : Object.entries(chatData.messageCountByDate).map(([date, _]) => ({
      date,
      count: chatData.userMessageCountByDate[selectedUser]?.[date] || 0
    }))

  const userMessageData = Object.entries(chatData.userStats)
    .map(([user, stats]) => ({
      name: user,
      value: stats.messageCount,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6">Chat Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">{chatData.totalMessages.toLocaleString()}</p>
            <p className="text-sm text-blue-700">Since {chatData.firstMessageDate}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Word Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold text-purple-900">{chatData.totalWordCount.toLocaleString()}</p>
                <p className="text-sm text-purple-700">Total words written</p>
              </div>
              <div className="pt-2 border-t border-purple-200">
                <p className="text-xl font-semibold text-purple-900">
                  {chatData.totalWordCount && chatData.totalMessages 
                    ? (chatData.totalWordCount / chatData.totalMessages).toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-purple-700">Average words per message</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">{chatData.averageMessagesPerDay.toFixed(1)}</p>
            <p className="text-sm text-green-700">Messages per day</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-900">{Object.keys(chatData.userStats).length}</p>
            <p className="text-sm text-amber-700">Participants</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold mb-6">User Activity Rankings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-600" />
              <h4 className="text-lg font-medium text-gray-800">Most Active User</h4>
            </div>
            <p className="text-3xl font-bold text-amber-800 mt-2">{chatData.mostActiveUser}</p>
            <p className="text-sm text-amber-700 mt-1">
              {chatData.userStats[chatData.mostActiveUser]?.messageCount.toLocaleString()} messages
            </p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <UserMinus className="w-6 h-6 text-gray-600" />
              <h4 className="text-lg font-medium text-gray-800">Least Active User</h4>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{chatData.leastActiveUser}</p>
            <p className="text-sm text-gray-700 mt-1">
              {chatData.userStats[chatData.leastActiveUser]?.messageCount.toLocaleString()} messages
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Most Common Words</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {chatData.mostCommonWords.map(([word, count]) => (
            <div key={word} className="bg-gray-100 p-2 rounded-md">
              <span className="font-medium">{word}:</span> {count}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Message Distribution</h3>
        <div className="mb-4">
          <label htmlFor="userSelect" className="mr-2 font-medium">Select User:</label>
          <select
            id="userSelect"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="p-2 border rounded"
          >
            {userOptions.map((user) => (
              <option key={user} value={user}>
                {user} ({chatData.userMessageCountByDate[user] ? Object.values(chatData.userMessageCountByDate[user]).reduce((a, b) => a + b, 0) : 0} messages)
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredTimeSeriesData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" name="Messages" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Average Messages per Hour</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chatData.averageMessagesByHour}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" name="Avg Messages" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Top 10 Users by Message Count</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={userMessageData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {userMessageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(chatData.userStats)
            .sort(([, a], [, b]) => b.messageCount - a.messageCount)
            .slice(0, showAllUsers ? undefined : 3)
            .map(([user, stats], index) => (
              <UserStatsCard
                key={user}
                user={user}
                stats={stats}
                uniqueWords={chatData.uniqueWordsPerUser?.[user] || new Set()}
                totalMessages={chatData.totalMessages}
                rank={index + 1}
              />
            ))}
        </div>
        {Object.keys(chatData.userStats).length > 3 && (
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="w-full mt-4 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 transition-colors border border-gray-200"
          >
            {showAllUsers ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show More Users <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
      <InactivityPeriods biggestTimeStop={chatData.biggestTimeStop} />
    </div>
  )
}

export default ChatStats

