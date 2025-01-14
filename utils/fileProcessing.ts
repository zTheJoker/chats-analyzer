import JSZip from 'jszip'

export async function processUploadedFile(file: File): Promise<File> {
  if (file.name.toLowerCase().endsWith('.txt')) {
    return file
  }
  
  if (file.name.toLowerCase().endsWith('.zip')) {
    const zip = new JSZip()
    try {
      const contents = await zip.loadAsync(file)
      
      // Find WhatsApp chat export file
      const txtFile = Object.values(contents.files).find(f => 
        !f.dir && 
        f.name.toLowerCase().endsWith('.txt') && 
        (f.name.toLowerCase().includes('chat') || f.name.toLowerCase().includes('whatsapp'))
      )

      if (!txtFile) {
        throw new Error('No WhatsApp chat export file found in the ZIP')
      }

      // Extract the text content
      const textContent = await txtFile.async('blob')
      return new File([textContent], txtFile.name, { type: 'text/plain' })
    } catch (error) {
      console.error('Error processing ZIP file:', error)
      throw new Error('Failed to process ZIP file')
    }
  }

  throw new Error('Unsupported file type. Please upload a .txt or .zip file')
} 