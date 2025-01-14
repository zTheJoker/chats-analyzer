import React, { useState } from 'react'
import { Upload } from 'lucide-react'
import JSZip from 'jszip'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file: File) => {
    try {
      if (file.name.toLowerCase().endsWith('.txt')) {
        onFileUpload(file)
      } else if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = new JSZip()
        const contents = await zip.loadAsync(file)
        
        // Find the first .txt file in the ZIP
        const txtFile = Object.values(contents.files).find(f => 
          !f.dir && f.name.toLowerCase().endsWith('.txt') && 
          (f.name.toLowerCase().includes('chat') || f.name.toLowerCase().includes('whatsapp'))
        )

        if (!txtFile) {
          throw new Error('No WhatsApp chat export file found in the ZIP')
        }

        // Get the text content
        const textContent = await txtFile.async('blob')
        const chatFile = new File([textContent], txtFile.name, {
          type: 'text/plain'
        })

        onFileUpload(chatFile)
      } else {
        throw new Error('Please upload a .txt or .zip file')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert(error instanceof Error ? error.message : 'Error processing file')
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  return (
    <div className="mb-3 md:mb-4">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 md:h-48 border-2 border-blue-300 border-dashed rounded-xl md:rounded-2xl cursor-pointer transition-colors duration-300 
          ${dragActive ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 hover:bg-blue-100'} 
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-4 pb-5 md:pt-5 md:pb-6">
          <Upload className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4 text-blue-500" />
          <p className="mb-1 md:mb-2 text-lg md:text-xl text-blue-700 font-semibold">
            <span className="font-bold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs md:text-sm text-blue-500">
            WhatsApp chat export file (.txt) or ZIP containing export
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".txt,.zip"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>
      {isLoading && (
        <div className="mt-6 md:mt-8 text-center">
          <div className="inline-block h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-blue-600">
            Processing your file. This may take a moment...
          </p>
        </div>
      )}
    </div>
  )
}

export default FileUpload

