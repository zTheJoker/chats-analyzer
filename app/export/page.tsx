'use client'

import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Smartphone, 
  Download, 
  FileText, 
  MoreHorizontal,
  MoreVertical,
  ChevronRight,
  Share2,
  MessageCircle,
  Info,
  Settings,
  Menu
} from 'lucide-react'
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

          <p className="text-lg text-gray-600 mb-8">
            Follow these simple steps to export your WhatsApp chat for analysis. The process is quick and secure.
          </p>

          <div className="prose prose-lg max-w-none">
            <Tabs defaultValue="iphone" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="iphone">iPhone</TabsTrigger>
                <TabsTrigger value="android">Android</TabsTrigger>
              </TabsList>
              
              {/* iPhone Tab Content */}
              <TabsContent value="iphone" className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <ol className="space-y-8">
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">1</div>
                      <div>
                        <h3 className="font-medium mb-2">Open WhatsApp and select your chat</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <span>Open WhatsApp and go to your Chats list</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-5 h-5" />
                            <span>Find and tap the individual or group chat you want to analyze</span>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">2</div>
                      <div>
                        <h3 className="font-medium mb-2">Access chat settings</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            <span>Tap the contact or group name at the top of the chat</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-5 h-5" />
                            <span>Scroll down to find more options</span>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">3</div>
                      <div>
                        <h3 className="font-medium mb-2">Export chat</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            <span>Tap "Export Chat" near the bottom of the settings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Choose "Without Media" when prompted</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <span>Select a method to save or share the exported chat file</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              </TabsContent>

              {/* Android Tab Content */}
              <TabsContent value="android" className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <ol className="space-y-8">
                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">1</div>
                      <div>
                        <h3 className="font-medium mb-2">Open your chat in WhatsApp</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <span>Launch WhatsApp and open your Chats list</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-5 h-5" />
                            <span>Locate and tap the chat you want to analyze</span>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">2</div>
                      <div>
                        <h3 className="font-medium mb-2">Open the menu</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <MoreVertical className="w-5 h-5" />
                            <span>Tap the three dots (⋮) in the top-right corner</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Menu className="w-5 h-5" />
                            <span>This will open the chat options menu</span>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">3</div>
                      <div>
                        <h3 className="font-medium mb-2">Export the chat</h3>
                        <div className="space-y-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            <span>Select "More" from the menu</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            <span>Tap "Export chat"</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Choose "Without media" for faster export</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-blue-50 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Important Notes:</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800">Before Exporting:</h4>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Make sure you have enough storage space</li>
                    <li>Choose "Without Media" for faster processing</li>
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

            <div className="bg-green-50 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Troubleshooting Tips:</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-green-700">
                <li>If you don't see the export option, try updating WhatsApp to the latest version</li>
                <li>For very large chats, the export process might take a few minutes</li>
                <li>If export fails, try closing and reopening WhatsApp</li>
                <li>Make sure you have enough storage space on your device</li>
              </ul>
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