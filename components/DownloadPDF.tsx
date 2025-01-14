import React, { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Download } from 'lucide-react'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'

const DownloadPDF: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleDownload = async () => {
    setIsGenerating(true)
    toast({
      title: "Preparing PDF",
      description: isMobile 
        ? "This might take a bit longer on mobile devices. Please keep the app open." 
        : "Your report is being generated. This may take a moment...",
      duration: 5000,
    })

    try {
      const element = document.getElementById('report-content')
      if (!element) throw new Error('Report content not found')

      const opt = {
        margin: isMobile ? 8 : 10,
        filename: 'whatsapp-chat-analysis.pdf',
        image: { type: 'jpeg', quality: isMobile ? 0.95 : 0.98 },
        html2canvas: { 
          scale: isMobile ? 1.5 : 2,
          useCORS: true,
          logging: false,
          scrollY: -window.scrollY // Fix for scrolled content
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      }

      // Temporarily hide any expanded content
      const expandedElements = document.querySelectorAll('.expanded-content')
      expandedElements.forEach(el => (el as HTMLElement).style.display = 'none')

      await html2pdf().set(opt).from(element).save()
      
      // Restore expanded content visibility
      expandedElements.forEach(el => (el as HTMLElement).style.display = '')

      toast({
        title: "Success!",
        description: "Your report has been downloaded.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
        ${isMobile ? 'w-full justify-center py-6 text-lg' : ''}`}
    >
      <Download className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} />
      {isGenerating ? 'Generating PDF...' : 'Download Report'}
    </Button>
  )
}

export default DownloadPDF 