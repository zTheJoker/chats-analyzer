'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Smartphone, Download, FileText, Phone, MessageCircle, MoreVertical, Share2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HowToExport() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analyzer
          </Link>

          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            How to Export Your WhatsApp Chat
          </h1>

          <div className="prose prose-lg max-w-none">
            <Tabs defaultValue="iphone" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="iphone">iPhone</TabsTrigger>
                <TabsTrigger value="android">Android</TabsTrigger>
              </TabsList>
              
              {/* iPhone Tab Content */}
              <TabsContent value="iphone">
                {/* iPhone instructions content */}
                {/* ... (previous iPhone content) ... */}
              </TabsContent>

              {/* Android Tab Content */}
              <TabsContent value="android">
                {/* Android instructions content */}
                {/* ... (previous Android content) ... */}
              </TabsContent>
            </Tabs>

            <div className="bg-blue-50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Important Notes:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800">Before Exporting:</h4>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Make sure you have enough storage space</li>
                    <li>Consider choosing "Without Media" for faster processing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800">After Exporting:</h4>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>The exported file will be in .txt format</li>
                    <li>File size depends on chat length</li>
                    <li>All processing happens locally in your browser</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Start Analyzing Your Chat
              </Link>
              <p className="text-sm text-gray-500">Your privacy is our priority - all processing happens locally</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 