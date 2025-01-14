import React from 'react'
import { BarChart, Lock, Zap } from 'lucide-react'

const Benefits: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
      <div className="flex flex-col items-center text-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <BarChart className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Insightful Analytics</h3>
        <p className="text-gray-600">Gain deep insights into your chat patterns and communication habits.</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">100% Private</h3>
        <p className="text-gray-600">All processing happens locally in your browser. Your data never leaves your device.</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
        <p className="text-gray-600">Get instant results with our efficient processing algorithm.</p>
      </div>
    </div>
  )
}

export default Benefits

