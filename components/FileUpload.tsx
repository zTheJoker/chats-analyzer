import React, { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import JSZip from 'jszip'
import { processUploadedFile } from '../utils/fileProcessing'

interface FileUploadProps {
  onFileUpload: (file: File, mediaFiles?: Array<{
    type: 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'other';
    url: string;
    name: string;
    size?: number;
    blob: Blob;
  }>) => void
  isLoading: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    try {
      setFileError(null)
      setSelectedFile(file)
      setUploadProgress(0)
      
      // Check file type first
      if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Please upload a .txt or .zip file')
      }
      
      // For files over 10MB, show progressive loading animation
      const isLargeFile = file.size > 10 * 1024 * 1024
      
      if (isLargeFile) {
        // Simulate progressive loading for large files
        const progressInterval = setInterval(() => {
          setUploadProgress((prev: number) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 5
          })
        }, 300)
      }

      if (file.name.toLowerCase().endsWith('.txt')) {
        onFileUpload(file)
      } else if (file.name.toLowerCase().endsWith('.zip')) {
        const result = await processUploadedFile(file)
        onFileUpload(result.textFile, result.mediaFiles)
      }
      
      // Set to 100% when done
      setUploadProgress(100)
    } catch (error) {
      console.error('Error processing file:', error)
      setFileError(error instanceof Error ? error.message : 'Error processing file')
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

  const clearFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="mb-3 md:mb-4">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-36 md:h-48 border-2 border-blue-300 border-dashed rounded-xl md:rounded-2xl cursor-pointer transition-colors duration-300 
          ${dragActive ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 hover:bg-blue-100'} 
          ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-blue-700 truncate max-w-[200px] md:max-w-[300px]">
                {selectedFile.name}
              </span>
              {!isLoading && (
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); clearFile(); }} 
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="w-full max-w-xs md:max-w-sm bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-xs text-blue-600">
              {isLoading ? 'Processing...' : 'Ready'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-4 pb-5 md:pt-5 md:pb-6">
            <Upload className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4 text-blue-500" />
            <p className="mb-1 md:mb-2 text-sm md:text-xl text-blue-700 font-semibold text-center">
              <span className="font-bold">Tap to upload</span> or drag and drop
            </p>
            <p className="text-xs md:text-sm text-blue-500 text-center px-2">
              WhatsApp chat export file (.txt) or ZIP containing export
            </p>
          </div>
        )}
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          accept=".txt,.zip"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>
      
      {fileError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{fileError}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 md:mt-8 text-center">
          <div className="inline-block h-12 w-12 md:h-16 md:w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <p className="text-base md:text-lg text-blue-700 font-medium">
              Processing your file...
            </p>
            <p className="mt-1 text-sm text-blue-600">
              {selectedFile?.name.toLowerCase().endsWith('.zip') 
                ? 'Extracting files and analyzing chat data. This may take a moment for large files.' 
                : 'Analyzing chat data. Almost there...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload

