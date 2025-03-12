import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponseTimeStatsProps {
  responseTimeStats: {
    averageResponseTime: number;
    userResponseTimes: Record<string, number>;
    responseTimeDistribution: Array<{
      range: string;
      count: number;
    }>;
    fastestResponders: Array<{
      user: string;
      averageTime: number;
    }>;
  };
}

const ResponseTimeStats: React.FC<ResponseTimeStatsProps> = ({ responseTimeStats }) => {
  // Format time function
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Response Time Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">Average Response Time</h4>
            <p className="text-3xl font-bold text-indigo-600">{formatTime(responseTimeStats.averageResponseTime)}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-2">Fastest Responders</h4>
            <div className="space-y-3">
              {responseTimeStats.fastestResponders.map((user, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded bg-gray-50">
                  <span className="font-medium">{user.user}</span>
                  <span className="text-indigo-600 font-semibold">{formatTime(user.averageTime)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-3">Response Time Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={responseTimeStats.responseTimeDistribution}
                margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} messages`, 'Count']}
                  labelFormatter={(label) => `Response time: ${label}`}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            How long it takes for users to respond to messages
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponseTimeStats;