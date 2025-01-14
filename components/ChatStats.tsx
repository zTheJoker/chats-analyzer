import React, { useState } from 'react'
import { ChatData } from '../types/chat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import InactivityPeriods from './InactivityPeriods'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import UserStatsCard from './UserStatsCard'
import { ChevronUp, ChevronDown } from 'lucide-react'

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
        <Card>
          <CardHeader>
            <CardTitle>Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chatData.totalMessages.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Since {chatData.firstMessageDate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chatData.totalWordCount.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Across all messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{chatData.averageMessagesPerDay.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Messages per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Object.keys(chatData.userStats).length}</p>
            <p className="text-sm text-gray-500">Participants</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">User Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-lg font-medium mb-2">Most Active User</h4>
            <p className="text-xl">{chatData.mostActiveUser}</p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">Least Active User</h4>
            <p className="text-xl">{chatData.leastActiveUser}</p>
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
            .map(([user, stats]) => (
              <UserStatsCard
                key={user}
                user={user}
                stats={stats}
                uniqueWords={chatData.uniqueWordsPerUser[user]}
                totalMessages={chatData.totalMessages}
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

