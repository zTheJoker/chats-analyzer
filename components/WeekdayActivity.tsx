import React from 'react'
import { WeekdayActivity as WeekdayActivityType } from '../types/chat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WeekdayActivityProps {
  data: WeekdayActivityType[]
}

const WeekdayActivity: React.FC<WeekdayActivityProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Weekday Activity</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="count" name="Total Messages" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="average" name="Average Messages" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeekdayActivity

