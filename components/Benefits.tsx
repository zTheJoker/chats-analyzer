import React from 'react'
import { BarChart, Lock, Zap } from 'lucide-react'

const Benefits: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 my-8 md:my-16">
      <div className="flex flex-col items-center text-center p-4 md:p-0">
        <div className="bg-blue-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
          <BarChart className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Insightful Analytics</h3>
        <p className="text-sm md:text-base text-gray-600">Gain deep insights into your chat patterns and communication habits.</p>
      </div>
      <div className="flex flex-col items-center text-center p-4 md:p-0">
        <div className="bg-green-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
          <Lock className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">100% Private</h3>
        <p className="text-sm md:text-base text-gray-600">All processing happens locally in your browser. Your data never leaves your device.</p>
      </div>
      <div className="flex flex-col items-center text-center p-4 md:p-0">
        <div className="bg-purple-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Lightning Fast</h3>
        <p className="text-sm md:text-base text-gray-600">Get instant results with our efficient processing algorithm.</p>
      </div>
    </div>
  )
}

export default Benefits

