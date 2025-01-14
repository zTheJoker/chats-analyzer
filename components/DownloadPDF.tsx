import React, { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Download } from 'lucide-react'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'

const DownloadPDF: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsGenerating(true)
    toast({
      title: "Preparing PDF",
      description: "Your report is being generated. This may take a moment...",
    })

    try {
      const element = document.getElementById('report-content')
      if (!element) throw new Error('Report content not found')

      const opt = {
        margin: 10,
        filename: 'whatsapp-chat-analysis.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(opt).from(element).save()
      
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
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? 'Generating PDF...' : 'Download Report'}
    </Button>
  )
}

export default DownloadPDF 