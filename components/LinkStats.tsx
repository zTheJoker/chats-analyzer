import React from 'react'
import { LinkStats as LinkStatsType } from '../types/chat'

interface LinkStatsProps {
  linkStats: LinkStatsType
}

const LinkStats: React.FC<LinkStatsProps> = ({ linkStats }) => {
  const sortedDomains = Object.entries(linkStats.domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Link Statistics</h3>
      <p className="mb-4">Total links shared: {linkStats.totalLinks}</p>
      <h4 className="text-lg font-medium mb-2">Top 5 Domains</h4>
      <ul className="space-y-2">
        {sortedDomains.map(([domain, count], index) => (
          <li key={index} className="flex justify-between">
            <span>{domain}</span>
            <span>{count} links</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LinkStats

