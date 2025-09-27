import React, { useState, useEffect } from 'react'
import { MediaData } from '../types/chat'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Image, FileText, Video, FileAudio, ArrowRight, X, ChevronUp, ChevronDown, ArrowUpDown, Calendar } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

interface MediaGalleryProps {
  media: MediaData[]
}

type SortOption = 'default' | 'oldest' | 'newest';

const MediaGallery: React.FC<MediaGalleryProps> = ({ media }) => {
  const [openMedia, setOpenMedia] = useState<MediaData | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  
  // Get media by type for organized display
  const images = media.filter(item => item.type === 'image')
  const videos = media.filter(item => item.type === 'video')
  const documents = media.filter(item => item.type === 'document' || item.type === 'pdf')
  const audio = media.filter(item => item.type === 'audio')
  const other = media.filter(item => item.type === 'other')
  
  // Function to sort media by date if available (assumes name contains date in format like 'IMG-20230521-WA0001.jpg')
  const sortMediaByDate = (mediaItems: MediaData[], direction: 'asc' | 'desc') => {
    return [...mediaItems].sort((a, b) => {
      // Extract date from filenames if possible
      const dateA = extractDateFromFilename(a.name);
      const dateB = extractDateFromFilename(b.name);
      
      if (dateA && dateB) {
        return direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      // If dates can't be extracted, maintain original order
      return 0;
    });
  };
  
  // Helper function to try extracting date from WhatsApp media filenames
  const extractDateFromFilename = (filename: string): Date | null => {
    // Common WhatsApp naming patterns: IMG-20230521-WA0001.jpg or 20230521_123456.jpg
    const datePattern = /(\d{8})[_-]/;  // Matches 8-digit date patterns
    const match = filename.match(datePattern);
    
    if (match && match[1]) {
      const dateStr = match[1];
      // Format is usually YYYYMMDD
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // Months are 0-indexed in JS
      const day = parseInt(dateStr.substring(6, 8));
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };
  
  // Create sorted media based on selected sort option
  let sortedMedia: MediaData[] = [];
  
  switch (sortBy) {
    case 'oldest':
      sortedMedia = sortMediaByDate([...media], 'asc');
      break;
    case 'newest':
      sortedMedia = sortMediaByDate([...media], 'desc');
      break;
    default:
      // Default priority - images first, then videos, etc.
      sortedMedia = [...images, ...videos, ...audio, ...documents, ...other];
  }
  
  const hasMoreMedia = media.length > 4
  
  // Display a small preview (up to 4 items)
  const previewMedia = showAll ? sortedMedia : sortedMedia.slice(0, 4)
  
  useEffect(() => {
    // Reset current index when sorting changes
    setCurrentIndex(0);
  }, [sortBy]);
  
  // Handle keyboard navigation when viewing images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!openMedia) return;
      
      const currentMediaIndex = sortedMedia.findIndex(m => m.url === openMedia.url);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        // Navigate to next media
        if (currentMediaIndex < sortedMedia.length - 1) {
          setOpenMedia(sortedMedia[currentMediaIndex + 1]);
          setCurrentIndex(currentMediaIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        // Navigate to previous media
        if (currentMediaIndex > 0) {
          setOpenMedia(sortedMedia[currentMediaIndex - 1]);
          setCurrentIndex(currentMediaIndex - 1);
        }
      } else if (e.key === 'Escape') {
        setOpenMedia(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMedia, sortedMedia]);
  
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
            <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100" onClick={() => {
              setOpenMedia(item);
              setCurrentIndex(sortedMedia.findIndex(m => m.url === item.url));
            }}>
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
        <Button size="sm" variant="ghost" onClick={() => {
          setOpenMedia(item);
          setCurrentIndex(sortedMedia.findIndex(m => m.url === item.url));
        }}>
          View
        </Button>
      </div>
    )
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">Media Files</h3>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setSortBy('default')}
                className={sortBy === 'default' ? 'bg-blue-50' : ''}
              >
                Default (by type)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('oldest')}
                className={sortBy === 'oldest' ? 'bg-blue-50' : ''}
              >
                Date (oldest first)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('newest')}
                className={sortBy === 'newest' ? 'bg-blue-50' : ''}
              >
                Date (newest first)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMinimized(!minimized)}
            className="flex items-center gap-1"
          >
            {minimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            {minimized ? 'Expand' : 'Minimize'}
          </Button>
        </div>
      </div>
      
      {!minimized && (
        <>
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
        </>
      )}
      
      {/* Full-size media viewer */}
      <Dialog open={!!openMedia} onOpenChange={(open) => !open && setOpenMedia(null)}>
        <DialogContent className="max-w-4xl w-fit max-h-[90vh] overflow-auto">
          {openMedia && (
            <>
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setMinimized(!minimized)} title={minimized ? "Expand gallery" : "Minimize gallery"}>
                  {minimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setOpenMedia(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-col items-center pt-6">
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
                  
                  <div className="mt-2 mb-2 flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentIndex === 0}
                      onClick={() => {
                        if (currentIndex > 0) {
                          setOpenMedia(sortedMedia[currentIndex - 1]);
                          setCurrentIndex(currentIndex - 1);
                        }
                      }}
                    >
                      Previous
                    </Button>
                    
                    <span className="text-sm text-gray-500 self-center">
                      {currentIndex + 1} of {sortedMedia.length}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentIndex === sortedMedia.length - 1}
                      onClick={() => {
                        if (currentIndex < sortedMedia.length - 1) {
                          setOpenMedia(sortedMedia[currentIndex + 1]);
                          setCurrentIndex(currentIndex + 1);
                        }
                      }}
                    >
                      Next
                    </Button>
                  </div>
                  
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MediaGallery 