import React from 'react'
import { InactivityPeriod } from '../types/chat'

interface InactivityPeriodsProps {
  biggestTimeStop: InactivityPeriod | null
}

const InactivityPeriods: React.FC<InactivityPeriodsProps> = ({ biggestTimeStop }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4">Biggest Time Stop</h3>
      {biggestTimeStop ? (
        <div className="border-b pb-2">
          <p className="font-semibold">From {biggestTimeStop.start} to {biggestTimeStop.end}</p>
          <p className="text-sm text-gray-600">Duration: {biggestTimeStop.duration.toFixed(2)} hours</p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">No significant inactivity periods found.</p>
      )}
    </div>
  )
}

export default InactivityPeriods

