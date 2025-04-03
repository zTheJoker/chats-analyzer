import React, { useState } from 'react'
import { MediaData } from '../types/chat'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Image, FileText, Video, FileAudio, ArrowRight, X } from 'lucide-react'

interface MediaGalleryProps {
  media: MediaData[]
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media }) => {
  const [openMedia, setOpenMedia] = useState<MediaData | null>(null)
  const [showAll, setShowAll] = useState(false)
  
  // Get media by type for organized display
  const images = media.filter(item => item.type === 'image')
  const videos = media.filter(item => item.type === 'video')
  const documents = media.filter(item => item.type === 'document' || item.type === 'pdf')
  const audio = media.filter(item => item.type === 'audio')
  const other = media.filter(item => item.type === 'other')
  
  // Display a small preview of images (up to 4)
  const previewImages = images.slice(0, 4)
  const hasMoreMedia = media.length > 4
  
  const displayCount = showAll ? media.length : Math.min(media.length, 4)
  const previewMedia = showAll ? media : media.slice(0, 4)
  
  if (!media || media.length === 0) {
    return null
  }
  
  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <FileAudio className="w-5 h-5" />
      case 'document':
      case 'pdf':
      default: return <FileText className="w-5 h-5" />
    }
  }
  
  const renderMediaItem = (item: MediaData) => {
    if (item.type === 'image') {
      return (
        <div className="relative group overflow-hidden rounded-lg border border-gray-200">
          <img 
            src={item.url} 
            alt={item.name} 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100" onClick={() => setOpenMedia(item)}>
              View
            </Button>
          </div>
        </div>
      )
    } 
    
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center">
          {getMediaIcon(item.type)}
          <span className="ml-2 truncate max-w-[150px]">{item.name}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setOpenMedia(item)}>
          View
        </Button>
      </div>
    )
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-2xl font-semibold mb-4">Media Files</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {previewMedia.map((item, index) => (
          <div key={`${item.name}-${index}`} className="aspect-square">
            {renderMediaItem(item)}
          </div>
        ))}
      </div>
      
      {hasMoreMedia && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showAll ? (
              <>Show Less <X className="h-4 w-4" /></>
            ) : (
              <>Show All Media ({media.length}) <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      )}
      
      {/* Full-size media viewer */}
      <Dialog open={!!openMedia} onOpenChange={(open) => !open && setOpenMedia(null)}>
        <DialogContent className="max-w-4xl w-fit max-h-[90vh] overflow-auto">
          {openMedia && (
            <div className="flex flex-col items-center">
              {openMedia.type === 'image' && (
                <img 
                  src={openMedia.url} 
                  alt={openMedia.name} 
                  className="max-h-[70vh] object-contain" 
                />
              )}
              
              {openMedia.type === 'video' && (
                <video 
                  src={openMedia.url} 
                  controls 
                  className="max-h-[70vh]"
                />
              )}
              
              {openMedia.type === 'audio' && (
                <audio 
                  src={openMedia.url} 
                  controls 
                  className="w-full" 
                />
              )}
              
              {(openMedia.type === 'document' || openMedia.type === 'pdf' || openMedia.type === 'other') && (
                <iframe 
                  src={openMedia.url} 
                  className="w-full h-[70vh]"
                  title={openMedia.name}
                />
              )}
              
              <div className="mt-4 text-center">
                <p className="font-medium">{openMedia.name}</p>
                {openMedia.size && (
                  <p className="text-sm text-gray-500">
                    {(openMedia.size / 1024).toFixed(1)} KB
                  </p>
                )}
                
                <Button 
                  className="mt-4"
                  variant="outline"
                  asChild
                >
                  <a href={openMedia.url} download={openMedia.name} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MediaGallery 