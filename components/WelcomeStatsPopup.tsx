import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChatData } from '@/types/chat'
import { Users, MessageCircle, Clock, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface WelcomeStatsPopupProps {
  chatData?: ChatData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeStatsPopup({ chatData, isOpen, onOpenChange }: WelcomeStatsPopupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [counts, setCounts] = useState({
    messages: 0,
    users: 0,
    days: 0,
    words: 0
  })

  useEffect(() => {
    if (isOpen && chatData) {
      // Animate counts up
      const maxMessages = chatData.totalMessages
      const maxUsers = Object.keys(chatData.userStats).length
      const maxWords = chatData.totalWordCount
      
      // Calculate days between first message and now
      const firstDate = new Date(chatData.firstMessageDate)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - firstDate.getTime())
      const maxDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Animate the counts
      const duration = 2000 // 2 seconds
      const frames = 30
      const interval = duration / frames
      
      let frame = 0
      const timer = setInterval(() => {
        const progress = Math.min(1, frame / frames)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease out
        
        setCounts({
          messages: Math.round(maxMessages * easeProgress),
          users: Math.round(maxUsers * easeProgress),
          days: Math.round(maxDays * easeProgress),
          words: Math.round(maxWords * easeProgress)
        })
        
        frame++
        if (frame > frames) clearInterval(timer)
      }, interval)
      
      return () => clearInterval(timer)
    }
  }, [isOpen, chatData])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset to first step for next time
    setTimeout(() => setCurrentStep(0), 300)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const statsContent = [
    // Step 1: Total messages
    <motion.div 
      key="messages" 
      className="flex flex-col items-center justify-center p-6 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <MessageCircle className="w-16 h-16 text-purple-500" />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-2xl font-bold text-purple-700 mb-3">
        Messages Analyzed
      </motion.h3>
      <motion.div variants={itemVariants} className="text-5xl font-bold text-purple-800 mb-6">
        {counts.messages.toLocaleString()}
      </motion.div>
      <motion.p variants={itemVariants} className="text-center text-gray-600 max-w-sm">
        That's a lot of conversations! We've analyzed every message to give you the best insights.
      </motion.p>
    </motion.div>,
    
    // Step 2: Participants
    <motion.div 
      key="users" 
      className="flex flex-col items-center justify-center p-6 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <Users className="w-16 h-16 text-blue-500" />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-2xl font-bold text-blue-700 mb-3">
        Participants
      </motion.h3>
      <motion.div variants={itemVariants} className="text-5xl font-bold text-blue-800 mb-6">
        {counts.users}
      </motion.div>
      <motion.p variants={itemVariants} className="text-center text-gray-600 max-w-sm">
        You'll see detailed statistics for each person in the conversation.
      </motion.p>
    </motion.div>,
    
    // Step 3: Time period
    <motion.div 
      key="days" 
      className="flex flex-col items-center justify-center p-6 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <Calendar className="w-16 h-16 text-green-500" />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-2xl font-bold text-green-700 mb-3">
        Days of History
      </motion.h3>
      <motion.div variants={itemVariants} className="text-5xl font-bold text-green-800 mb-6">
        {counts.days}
      </motion.div>
      <motion.p variants={itemVariants} className="text-center text-gray-600 max-w-sm">
        That's {Math.round(counts.days/30)} months or {Math.round(counts.days/365)} years of conversation history!
      </motion.p>
    </motion.div>,
    
    // Step 4: Total words
    <motion.div 
      key="words" 
      className="flex flex-col items-center justify-center p-6 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <Clock className="w-16 h-16 text-amber-500" />
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-2xl font-bold text-amber-700 mb-3">
        Words Exchanged
      </motion.h3>
      <motion.div variants={itemVariants} className="text-5xl font-bold text-amber-800 mb-6">
        {counts.words.toLocaleString()}
      </motion.div>
      <motion.p variants={itemVariants} className="text-center text-gray-600 max-w-sm">
        That's about {Math.round(counts.words/400)} pages of a book! Scroll down to see all your chat insights.
      </motion.p>
    </motion.div>
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-xl">
        <div className="h-[450px] flex flex-col">
          <div className="flex-1 overflow-hidden">
            {statsContent[currentStep]}
          </div>
          
          <DialogFooter className="px-6 py-4 border-t flex flex-row justify-between">
            <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
              Skip
            </Button>
            <div className="flex items-center gap-2">
              {[0,1,2,3].map(step => (
                <div 
                  key={step}
                  className={`h-2 w-2 rounded-full ${currentStep === step ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <Button 
              onClick={handleNext} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {currentStep < 3 ? 'Next' : 'Let\'s Go!'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}