import { ChatData } from '../types/chat'

const CHAT_DATA_KEY = 'chatData'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

export async function storeChatData(data: ChatData): Promise<void> {
  try {
    const serializedData = JSON.stringify(data)
    if (serializedData.length <= CHUNK_SIZE) {
      localStorage.setItem(CHAT_DATA_KEY, serializedData)
    } else {
      const chunks = Math.ceil(serializedData.length / CHUNK_SIZE)
      for (let i = 0; i < chunks; i++) {
        const chunk = serializedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        localStorage.setItem(`${CHAT_DATA_KEY}_${i}`, chunk)
      }
      localStorage.setItem(`${CHAT_DATA_KEY}_chunks`, chunks.toString())
    }
  } catch (err) {
    console.error('Error storing chat data:', err)
    throw new Error('Failed to store chat data. The file might be too large.')
  }
}

export async function retrieveChatData(): Promise<ChatData | null> {
  try {
    const chunksStr = localStorage.getItem(`${CHAT_DATA_KEY}_chunks`)
    if (chunksStr) {
      const chunks = parseInt(chunksStr, 10)
      let serializedData = ''
      for (let i = 0; i < chunks; i++) {
        const chunk = localStorage.getItem(`${CHAT_DATA_KEY}_${i}`)
        if (chunk) serializedData += chunk
      }
      return JSON.parse(serializedData)
    } else {
      const serializedData = localStorage.getItem(CHAT_DATA_KEY)
      return serializedData ? JSON.parse(serializedData) : null
    }
  } catch (err) {
    console.error('Error retrieving chat data:', err)
    throw new Error('Failed to retrieve stored chat data.')
  }
}

