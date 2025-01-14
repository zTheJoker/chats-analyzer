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
                label
              >
                {emojiStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-2">Top Emoji Users</h4>
          <ul className="space-y-2">
            {userEmojiStats.slice(0, 5).map((user, index) => (
              <li key={index} className="flex justify-between">
                <span>{user.user}</span>
                <span>{user.emojiCount} emojis</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EmojiStats

