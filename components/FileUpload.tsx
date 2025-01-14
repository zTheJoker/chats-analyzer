import React from 'react'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div className="mb-3 md:mb-4">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-32 md:h-48 border-2 border-blue-300 border-dashed rounded-xl md:rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-4 pb-5 md:pt-5 md:pb-6">
          <Upload className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-4 text-blue-500" />
          <p className="mb-1 md:mb-2 text-lg md:text-xl text-blue-700 font-semibold">
            <span className="font-bold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs md:text-sm text-blue-500">WhatsApp chat export file (TXT)</p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>
      {isLoading && (
        <div className="mt-6 md:mt-8 text-center">
          <div className="inline-block h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-blue-600">Processing your file. This may take a moment...</p>
        </div>
      )}
    </div>
  )
}

export default FileUpload

