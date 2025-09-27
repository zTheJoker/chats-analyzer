import React from 'react'
import { MessageLengthDistribution as MessageLengthDistributionType } from '../types/chat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MessageLengthDistributionProps {
  data: MessageLengthDistributionType[]
}

const MessageLengthDistribution: React.FC<MessageLengthDistributionProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Message Length Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Message Count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MessageLengthDistribution

