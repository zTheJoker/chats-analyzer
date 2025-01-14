import React, { useState } from 'react'
import { ChatData } from '../types/chat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import InactivityPeriods from './InactivityPeriods'

interface ChatStatsProps {
  chatData: ChatData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

const ChatStats: React.FC<ChatStatsProps> = ({ chatData }) => {
  const [selectedUser, setSelectedUser] = useState<string>('All Users')

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-md">
          <h4 className="text-lg font-medium mb-2">Total Messages</h4>
          <p className="text-3xl font-bold">{chatData.totalMessages.toLocaleString()}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md">
          <h4 className="text-lg font-medium mb-2">Total Users</h4>
          <p className="text-3xl font-bold">{Object.keys(chatData.userStats).length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-md">
          <h4 className="text-lg font-medium mb-2">Avg Messages/Day</h4>
          <p className="text-3xl font-bold">{chatData.averageMessagesPerDay.toFixed(2)}</p>
        </div>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">User Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Total Messages</th>
                <th className="px-4 py-2">Word Count</th>
                <th className="px-4 py-2">Avg Words/Message</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(chatData.userStats).map(([user, stats]) => (
                <tr key={user} className="border-b">
                  <td className="px-4 py-2">{user}</td>
                  <td className="px-4 py-2">{stats.messageCount}</td>
                  <td className="px-4 py-2">{stats.wordCount}</td>
                  <td className="px-4 py-2">{(stats.wordCount / stats.messageCount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <InactivityPeriods biggestTimeStop={chatData.biggestTimeStop} />
    </div>
  )
}

export default ChatStats

