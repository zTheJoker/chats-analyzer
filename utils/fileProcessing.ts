import JSZip from 'jszip'

interface ProcessResult {
  textFile: File;
  mediaFiles?: {
    type: 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'other';
    url: string;
    name: string;
    size?: number;
    blob: Blob;
  }[];
}

interface ZipFile {
  dir: boolean;
  name: string;
  async: (type: string) => Promise<Blob>;
}

export async function processUploadedFile(file: File): Promise<ProcessResult> {
  if (file.name.toLowerCase().endsWith('.txt')) {
    return { textFile: file }
  }
  
  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = new JSZip()
    try {
      const contents = await zip.loadAsync(file)
      
      // Find WhatsApp chat export file
      const txtFile = Object.values(contents.files).find((f: any) => 
        !f.dir && 
        f.name.toLowerCase().endsWith('.txt') && 
        (f.name.toLowerCase().includes('chat') || f.name.toLowerCase().includes('whatsapp'))
      ) as ZipFile | undefined

      if (!txtFile) {
        throw new Error('No WhatsApp chat export file found in the ZIP')
      }

      // Extract the text content
      const textContent = await txtFile.async('blob')
      const chatFile = new File([textContent], txtFile.name, { type: 'text/plain' })
      
      // Extract media files if they exist
      const mediaFiles = []
      
      for (const filename in contents.files) {
        const zipFile = contents.files[filename] as ZipFile
        if (zipFile.dir) continue
        
        // Skip the chat file itself
        if (zipFile === txtFile) continue
        
        // Check if it's a media file (images, videos, PDFs, etc.)
        const extension = filename.split('.').pop()?.toLowerCase()
        if (!extension) continue
        
        let type: 'image' | 'video' | 'audio' | 'document' | 'pdf' | 'other' = 'other'
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          type = 'image'
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
          type = 'video'
        } else if (['mp3', 'wav', 'ogg', 'm4a', 'opus'].includes(extension)) {
          type = 'audio'
        } else if (extension === 'pdf') {
          type = 'pdf'
        } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
          type = 'document'
        }
        
        try {
          const blob = await zipFile.async('blob')
          const url = URL.createObjectURL(blob)
          
          mediaFiles.push({
            type,
            url,
            name: filename.split('/').pop() || filename,
            size: blob.size,
            blob
          })
        } catch (error) {
          console.error(`Error extracting media file ${filename}:`, error)
          // Continue with other files
        }
      }
      
      return { 
        textFile: chatFile,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined
      }
    } catch (error) {
      console.error('Error processing ZIP file:', error)
      throw new Error('Failed to process ZIP file')
    }
  }

  throw new Error('Unsupported file type. Please upload a .txt or .zip file')
} 