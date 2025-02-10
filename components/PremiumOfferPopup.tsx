import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function PremiumOfferPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show popup after 20 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 20000)

    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    // TODO: Implement payment flow
    console.log('Starting premium subscription flow')
    setIsOpen(false)
    // For now, just close the popup
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Unlock Premium AI Analysis</DialogTitle>
          <DialogDescription className="mt-4 space-y-3">
            <p className="text-lg">
              Get deeper insights into your conversations with our advanced AI analysis.
            </p>
            <div className="space-y-2">
              <p className="flex items-center">
                ✨ Full AI chat analysis
              </p>
              <p className="flex items-center">
                🤖 Chat with AI about your conversations
              </p>
              <p className="flex items-center">
                🧠 Psychological insights and patterns
              </p>
              <p className="flex items-center">
                📊 Detailed relationship dynamics
              </p>
            </div>
            <p className="font-semibold text-primary mt-4">
              All this for just $3.99!
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Maybe later
          </Button>
          <Button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 