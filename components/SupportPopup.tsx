import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import { HeartIcon } from 'lucide-react'

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
  const bmcButtonRef = useRef<HTMLDivElement>(null)
  
  const actualIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen
  const actualOnOpenChange = onOpenChange || setIsOpenInternal

  // Insert Buy Me a Coffee button when the dialog is open
  useEffect(() => {
    if (actualIsOpen && bmcButtonRef.current) {
      // Clear any existing button
      bmcButtonRef.current.innerHTML = ''
      
      // Create script element
      const script = document.createElement('script')
      script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js'
      script.setAttribute('data-name', 'bmc-button')
      script.setAttribute('data-slug', 'convoanalyzer')
      script.setAttribute('data-color', '#BD5FFF')
      script.setAttribute('data-emoji', '')
      script.setAttribute('data-font', 'Bree')
      script.setAttribute('data-text', 'Buy me a coffee')
      script.setAttribute('data-outline-color', '#000000')
      script.setAttribute('data-font-color', '#ffffff')
      script.setAttribute('data-coffee-color', '#FFDD00')
      
      // Append to DOM
      bmcButtonRef.current.appendChild(script)
    }
  }, [actualIsOpen])

  // Handle scroll event
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
      <DialogContent className="sm:max-w-[425px] border-purple-300 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-blue-600"></div>
        
        <DialogHeader className="pt-6">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Enjoying ConvoAnalyzer?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700 pt-2">
            {trigger === 'download' 
              ? "Great! Your PDF has been successfully downloaded. 🎉"
              : "We hope you're finding your chat insights valuable! 📊"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-6 pt-4">
          <p className="text-center text-base text-gray-700 max-w-[90%]">
            If you've enjoyed using our free tool, please consider supporting us to keep it running and help us add more features!
          </p>
          
          <div ref={bmcButtonRef} className="py-3 flex justify-center">
            {/* Buy Me a Coffee button will be inserted here via script */}
            {/* Fallback button in case script fails */}
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md flex items-center gap-2" 
              onClick={() => window.open('https://www.buymeacoffee.com/convoanalyzer', '_blank')}
            >
              <HeartIcon size={18} />
              Support This Project
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-2 border-gray-300 text-gray-600 hover:bg-gray-100" 
            onClick={() => actualOnOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}