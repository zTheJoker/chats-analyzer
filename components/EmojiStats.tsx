import React from 'react'
import { EmojiStats as EmojiStatsType, UserEmojiStats } from '../types/chat'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface EmojiStatsProps {
  emojiStats: EmojiStatsType[]
  userEmojiStats: UserEmojiStats[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

const EmojiStats: React.FC<EmojiStatsProps> = ({ emojiStats, userEmojiStats }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Emoji Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-medium mb-2">Top 10 Emojis</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emojiStats}
                dataKey="count"
                nameKey="emoji"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ emoji, percent }) => `${emoji} (${(percent * 100).toFixed(0)}%)`}
              >
                {emojiStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [value, `Count for ${props.payload.emoji}`]}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="text-xl">{data.emoji}</p>
                        <p className="text-sm font-medium">{data.count} times</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-2">Top Emoji Users</h4>
          <ul className="space-y-2">
            {userEmojiStats.slice(0, 5).map((user, index) => (
              <li key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{user.user}</span>
                <span className="text-indigo-600 font-semibold">{user.emojiCount} emojis</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-2">Most Popular Emojis</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {emojiStats.slice(0, 10).map((emoji, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-1">{emoji.emoji}</div>
                  <div className="text-xs text-gray-600">{emoji.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmojiStats

