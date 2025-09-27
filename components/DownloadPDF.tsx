import React, { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Download } from 'lucide-react'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { SupportPopup } from './SupportPopup'

const DownloadPDF: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSupportPopup, setShowSupportPopup] = useState(false)
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

      // Add temporary styles for PDF generation
      const style = document.createElement('style')
      style.textContent = `
        .recharts-legend-wrapper {
          position: relative !important;
          width: 100% !important;
          left: 0 !important;
          margin: 10px auto !important;
          text-align: center !important;
        }
        .recharts-default-legend {
          justify-content: center !important;
          display: flex !important;
          flex-wrap: wrap !important;
          width: 100% !important;
          margin: 0 auto !important;
        }
        .recharts-legend-item {
          margin: 0 10px !important;
        }
        /* Adjust card and chart container styles for PDF */
        .card, .chart-container, .stats-container {
          margin-bottom: 20px !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        /* Ensure charts maintain reasonable height */
        .recharts-wrapper {
          height: 300px !important;
          margin-bottom: 15px !important;
        }
        /* Add some spacing between sections */
        #report-content > div {
          margin-bottom: 30px !important;
        }
      `
      document.head.appendChild(style)

      // Add footer
      const footer = document.createElement('div')
      footer.innerHTML = `
        <div style="
          text-align: center;
          padding: 20px;
          margin-top: 30px;
          border-top: 1px solid #eaeaea;
          color: #666;
          font-size: 14px;
        ">
          Created with ConvoAnalyzer - Try it out at ConvoAnalyzer.com
        </div>
      `
      element.appendChild(footer)

      const opt = {
        margin: isMobile ? 8 : 10,
        filename: 'whatsapp-chat-analysis.pdf',
        image: { type: 'jpeg', quality: isMobile ? 0.95 : 0.98 },
        html2canvas: { 
          scale: isMobile ? 1.5 : 2,
          useCORS: true,
          logging: false,
          scrollY: -window.scrollY,
          windowWidth: 1200, // Force consistent width for better rendering
          onclone: (clonedDoc: Document) => {
            // Ensure charts are properly sized in the clone
            const charts = clonedDoc.querySelectorAll('.recharts-wrapper')
            charts.forEach(chart => {
              (chart as HTMLElement).style.width = '100%'
              ;(chart as HTMLElement).style.minWidth = '500px'
              ;(chart as HTMLElement).style.maxHeight = '300px'
            })
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        // Remove forced page breaks and let content flow naturally
        pagebreak: { mode: 'css' }
      }

      // Temporarily hide any expanded content
      const expandedElements = document.querySelectorAll('.expanded-content')
      expandedElements.forEach(el => (el as HTMLElement).style.display = 'none')

      await html2pdf().set(opt).from(element).save()
      
      // Cleanup
      document.head.removeChild(style)
      element.removeChild(footer)
      expandedElements.forEach(el => (el as HTMLElement).style.display = '')

      toast({
        title: "Success!",
        description: "Your report has been downloaded.",
        duration: 3000,
      })
      
      // Show support popup after successful download
      setShowSupportPopup(true)
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
    <>
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
          ${isMobile ? 'w-full justify-center py-6 text-lg' : ''}`}
      >
        <Download className={`${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} />
        {isGenerating ? 'Generating PDF...' : 'Download Report'}
      </Button>
      
      <SupportPopup 
        trigger="download" 
        isOpen={showSupportPopup} 
        onOpenChange={setShowSupportPopup} 
      />
    </>
  )
}

export default DownloadPDF 