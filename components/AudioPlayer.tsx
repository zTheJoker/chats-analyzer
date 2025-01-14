import React, { useRef, useState } from 'react'

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
      <audio ref={audioRef} src="/background-music.wav" />
      <button
        onClick={togglePlay}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        {isPlaying ? 'Pause' : 'Play'} Background Music
      </button>
    </div>
  )
}

export default AudioPlayer

