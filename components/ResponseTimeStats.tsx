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
    if (seconds === 0) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Check if there's any data to show
  const hasResponseData = responseTimeStats.averageResponseTime > 0 || 
    responseTimeStats.responseTimeDistribution.some(item => item.count > 0);

  // Check if we have responder data
  const hasResponderData = responseTimeStats.fastestResponders.length > 0;

  // Helper to check if distribution data exists
  const hasDistributionData = responseTimeStats.responseTimeDistribution.some(
    item => item.count > 0
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Response Time Analysis</h3>
      
      {!hasResponseData ? (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p>Not enough data available to analyze response times.</p>
          <p className="text-sm text-gray-500 mt-2">This may happen if all messages were sent by the same person or if timestamps couldn't be parsed correctly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2">Average Response Time</h4>
              <p className="text-3xl font-bold text-indigo-600">
                {formatTime(responseTimeStats.averageResponseTime)}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-2">Fastest Responders</h4>
              {hasResponderData ? (
                <div className="space-y-3">
                  {responseTimeStats.fastestResponders.map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded bg-gray-50">
                      <span className="font-medium">{user.user}</span>
                      <span className="text-indigo-600 font-semibold">{formatTime(user.averageTime)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not enough data to determine fastest responders.</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-3">Response Time Distribution</h4>
            {hasDistributionData ? (
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
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No response distribution data available</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              How long it takes for users to respond to messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTimeStats;