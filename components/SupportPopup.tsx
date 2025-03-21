import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'

interface SupportPopupProps {
  trigger: 'scroll' | 'download'
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const SupportPopup: React.FC<SupportPopupProps> = ({ 
  trigger,
  isOpen: externalIsOpen,
  onOpenChange
}) => {
  const [isOpen, setIsOpenInternal] = useState(false)
  
  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen
  const actualOnOpenChange = onOpenChange || setIsOpenInternal

  useEffect(() => {
    // Only handle scroll trigger automatically
    if (trigger !== 'scroll' || externalIsOpen !== undefined) return
    
    const handleScroll = () => {
      // Check if user has scrolled to the bottom
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      if (scrollPosition >= documentHeight - 100) {
        // Check if we've shown this popup before
        const popupShown = localStorage.getItem('supportPopupShown')
        if (!popupShown) {
          setIsOpenInternal(true)
          localStorage.setItem('supportPopupShown', 'true')
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trigger, externalIsOpen])

  return (
    <Dialog open={actualIsOpen} onOpenChange={actualOnOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-purple-300 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Enjoying ConvoAnalyzer?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700 pt-2">
            {trigger === 'download' 
              ? "Great! Your PDF has been successfully downloaded."
              : "We hope you're finding your chat analysis insightful!"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <p className="text-center text-sm text-gray-600">
            If you enjoyed using ConvoAnalyzer, please consider supporting us!
          </p>
          
          <div className="py-2">
            <script 
              type="text/javascript" 
              src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" 
              data-name="bmc-button" 
              data-slug="convoanalyzer" 
              data-color="#BD5FFF" 
              data-emoji="" 
              data-font="Bree" 
              data-text="Buy me a coffee" 
              data-outline-color="#000000" 
              data-font-color="#ffffff" 
              data-coffee-color="#FFDD00"
            ></script>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => actualOnOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}