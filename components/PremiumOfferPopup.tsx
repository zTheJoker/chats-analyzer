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

export function PremiumOfferPopup({ isResultsPage = false }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if popup has been shown in this session
    const hasBeenShown = localStorage.getItem('premiumPopupShown')
    
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('premiumPopupShown', 'true')
      }, isResultsPage ? 5000 : 20000) // Show after 5 seconds on results page, 20 seconds on home

      return () => clearTimeout(timer)
    }
  }, [isResultsPage])

  const handleGetStarted = () => {
    setIsOpen(false)
    window.open('mailto:support@convoanalyzer.com?subject=Premium%20Access%20Request', '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Unlock Premium AI Analysis
          </DialogTitle>
          <DialogDescription className="mt-4 space-y-3">
            <p className="text-lg">
              Ready to get deeper insights from your conversations?
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>Full AI chat analysis with sentiment tracking</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span>Interactive AI chat about your conversations</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🧠</span>
                <span>Deep psychological insights and patterns</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span>Advanced relationship dynamics analysis</span>
              </p>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="font-semibold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Special Launch Price: $3.99
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Maybe later
          </Button>
          <Button 
            onClick={handleGetStarted} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Get Premium Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 