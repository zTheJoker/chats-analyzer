export interface UserStats {
  messageCount: number
  wordCount: number
}

export interface MessageData {
  date: string
  time: string
  user: string
  message: string
}

export interface ChatData {
  totalMessages: number
  userStats: Record<string, UserStats>
  mostActiveUser: string
  leastActiveUser: string
  averageMessagesPerDay: number
  mostCommonWords: [string, number][]
  messageCountByDate: Record<string, number>
  userMessageCountByDate: Record<string, Record<string, number>>
  averageMessagesByHour: { hour: number; average: number }[]
  messages: MessageData[]
}

