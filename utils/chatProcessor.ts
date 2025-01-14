import { ChatData, UserStats, MessageData } from '../types/chat'
import { parse, format, isValid } from 'date-fns'
import emojiRegex from 'emoji-regex'

const WHATSAPP_SYSTEM_WORDS = new Set([
  'created', 'changed', 'left', 'added', 'removed', 'joined', 'using', 'link', 'deleted', 'omitted',
  'this', 'message', 'was', 'edited', 'poll', 'the', 'group', 'admin', 'you', 'to',
  // Add more WhatsApp system words as needed
])

function isNonLatinChar(char: string): boolean {
  return /[^\u0000-\u007F]/.test(char)
}

function getWeekday(dateString: string): string {
  const date = parse(dateString, 'dd/MM/yyyy', new Date())
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

function countEmojis(text: string): number {
  const emojiRegExp = emojiRegex()
  return (text.match(emojiRegExp) || []).length
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.startsWith('www.') ? domain.slice(4) : domain
  } catch {
    return url
  }
}

export interface WeekdayActivity {
  day: string
  count: number
  average: number
}

export interface MessageLengthDistribution {
  range: string
  count: number
}

export interface EmojiStats {
  emoji: string
  count: number
}

export interface UserEmojiStats {
  user: string
  emojiCount: number
}

export interface LinkStats {
  totalLinks: number
  domainCounts: Record<string, number>
}

export interface ConversationStarters {
  firstMessage: Record<string, number>
  lastMessage: Record<string, number>
}

export interface InactivityPeriod {
  start: string
  end: string
  duration: number
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
  weekdayActivity: WeekdayActivity[]
  messageLengthDistribution: MessageLengthDistribution[]
  longestMessages: MessageData[]
  emojiStats: EmojiStats[]
  userEmojiStats: UserEmojiStats[]
  linkStats: LinkStats
  conversationStarters: ConversationStarters
  inactivityPeriods: InactivityPeriod[]
  biggestTimeStop: InactivityPeriod | null
  longestConversations: MessageData[][]
  mostRepliedMessages: { message: MessageData; replyCount: number }[]
  systemMessages: string[]
}

const MESSAGE_PATTERNS = [
  // Standard format with RTL support: [date], [time] - [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–]\s*(.*?):\s*(.+)$/,
  
  // Alternative format with optional brackets: [date] [time] [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*?):\s*(.+)$/,
  
  // System message format: [date], [time] - [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–]?\s*(.+)$/
];

function parseDate(dateString: string): Date | null {
  // Clean up the date string
  const cleanDate = dateString.trim().replace(/[,]/g, '');
  
  // Define all possible date formats
  const formats = [
    'M/d/yy', 'M/d/yyyy', 'd/M/yy', 'd/M/yyyy',
    'MM/dd/yy', 'MM/dd/yyyy', 'dd/MM/yy', 'dd/MM/yyyy',
    'M-d-yy', 'M-d-yyyy', 'd-M-yy', 'd-M-yyyy',
    'MM-dd-yy', 'MM-dd-yyyy', 'dd-MM-yy', 'dd-MM-yyyy',
    'M.d.yy', 'M.d.yyyy', 'd.M.yy', 'd.M.yyyy',
    'MM.dd.yy', 'MM.dd.yyyy', 'dd.MM.yy', 'dd.MM.yyyy',
    'yyyy/MM/dd', 'yy/MM/dd', 'yyyy-MM-dd', 'yy-MM-dd',
    'yyyy.MM.dd', 'yy.MM.dd'
  ];

  let parsedDate: Date | null = null;

  for (const dateFormat of formats) {
    try {
      const attemptedDate = parse(cleanDate, dateFormat, new Date());
      if (isValid(attemptedDate)) {
        // Handle two-digit years
        if (dateFormat.includes('yy') && !dateFormat.includes('yyyy')) {
          const year = attemptedDate.getFullYear();
          // If the year is in the future, subtract 100 years
          if (year > new Date().getFullYear() + 1) {
            attemptedDate.setFullYear(year - 100);
          }
        }
        parsedDate = attemptedDate;
        break;
      }
    } catch {
      continue;
    }
  }

  return parsedDate;
}

function cleanWhatsAppFormatting(text: string): string {
  return text
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Remove RTL/LTR markers
    .replace(/^\[|\]$/g, '')                      // Remove brackets
    .trim();
}

function cleanupText(text: string): string {
  // Remove control characters but preserve RTL text
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\u200B/g, '') // Zero-width space
    .trim();
}

export async function processWhatsAppChat(chatText: string): Promise<ChatData> {
  let processedLines = 0
  let skippedLines = 0
  if (!chatText || typeof chatText !== 'string') {
    throw new Error('Invalid chat text provided')
  }

  const lines = chatText.split('\n')
  if (lines.length === 0) {
    throw new Error('The chat file is empty')
  }

  console.log('Sample of first few lines:', lines.slice(0, 5));

  const userStats: Record<string, UserStats> = {}
  const messageCountByDate: Record<string, number> = {}
  const userMessageCountByDate: Record<string, Record<string, number>> = {}
  const wordFrequency: Record<string, number> = {}
  const messagesByHour: number[] = new Array(24).fill(0)
  const messages: MessageData[] = []

  let totalMessages = 0
  let currentDate = ''

  const weekdayMessageCounts: Record<string, number> = {}
  const messageLengths: number[] = []
  const emojiCounts: Record<string, number> = {}
  const userEmojiCounts: Record<string, number> = {}
  const linkCounts: Record<string, number> = {}
  const firstMessageUsers: Record<string, number> = {}
  const lastMessageUsers: Record<string, number> = {}
  let lastMessageDate = ''
  let lastMessageTime = ''

  const systemMessages: string[] = []

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      let match: RegExpMatchArray | null = null
      let date: string | undefined
      let time: string | undefined
      let user: string | undefined
      let message: string | undefined
      let isSystemMessage = false

      // Try each pattern until we find a match
      for (const pattern of MESSAGE_PATTERNS) {
        match = line.match(pattern)
        if (match) {
          if (match.length === 5) {
            // Regular message
            [, date, time, user, message] = match
            date = cleanWhatsAppFormatting(date)
            time = cleanWhatsAppFormatting(time)
            user = cleanWhatsAppFormatting(user)
            message = cleanWhatsAppFormatting(message)
          } else if (match.length === 4) {
            // System message
            [, date, time, message] = match
            date = cleanWhatsAppFormatting(date)
            time = cleanWhatsAppFormatting(time)
            message = cleanWhatsAppFormatting(message)
            isSystemMessage = true
          }
          break
        }
      }

      // Special handling for system messages and media
      if (message) {
        const mediaPattern = /<?(Media|image|video|audio|sticker) omitted>?/i
        const deletedPattern = /(?:This message was deleted|You deleted this message)/i
        
        if (mediaPattern.test(message) || deletedPattern.test(message)) {
          isSystemMessage = true
        }
      }

      if (!match || (!date && !time)) {
        // If no pattern matches or missing date/time, treat as system message
        systemMessages.push(cleanupText(line))
        skippedLines++
        continue
      }

      // Normalize date format
      const parsedDate = parseDate(date)
      if (!parsedDate) {
        console.warn(`Skipping invalid line ${i + 1}: Invalid date format - ${date}`)
        skippedLines++
        continue
      }

      const normalizedDate = format(parsedDate, 'dd/MM/yyyy')

      console.log('Parsed date:', {
        original: date,
        parsed: parsedDate,
        normalized: normalizedDate
      });

      // Handle system messages
      if (isSystemMessage) {
        systemMessages.push(message!)
        continue
      }

      // Process regular messages
      if (!user || !message) {
        console.warn(`Skipping invalid line ${i + 1}: Missing user or message`)
        skippedLines++
        continue
      }

      // Clean up user name and message
      user = cleanupText(user.trim())
      message = cleanupText(message.trim())

      // Process the message
      if (!userStats[user]) {
        userStats[user] = { messageCount: 0, wordCount: 0 }
      }
      if (!userMessageCountByDate[user]) {
        userMessageCountByDate[user] = {}
      }

      userStats[user].messageCount++
      totalMessages++

      if (normalizedDate !== currentDate) {
        currentDate = normalizedDate
      }
      messageCountByDate[normalizedDate] = (messageCountByDate[normalizedDate] || 0) + 1
      userMessageCountByDate[user][normalizedDate] = (userMessageCountByDate[user][normalizedDate] || 0) + 1

      const hour = parseInt(time.split(':')[0], 10)
      messagesByHour[hour]++

      const words = message.split(/\s+/)
      words.forEach((word) => {
        const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '')
        if (cleanWord && !WHATSAPP_SYSTEM_WORDS.has(cleanWord) && (isNaN(Number(cleanWord)) || isNonLatinChar(cleanWord[0]))) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1
          userStats[user].wordCount++
        }
      })

      const weekday = getWeekday(normalizedDate)
      weekdayMessageCounts[weekday] = (weekdayMessageCounts[weekday] || 0) + 1

      messageLengths.push(message.length)

      const emojisInMessage = message.match(emojiRegex()) || []
      emojisInMessage.forEach(emoji => {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1
        userEmojiCounts[user] = (userEmojiCounts[user] || 0) + 1
      })

      const urlMatches = message.match(/https?:\/\/[^\s]+/g) || []
      urlMatches.forEach(url => {
        const domain = extractDomain(url)
        linkCounts[domain] = (linkCounts[domain] || 0) + 1
      })

      if (normalizedDate !== lastMessageDate) {
        firstMessageUsers[user] = (firstMessageUsers[user] || 0) + 1
        if (lastMessageDate) {
          lastMessageUsers[messages[messages.length - 1].user] = (lastMessageUsers[messages[messages.length - 1].user] || 0) + 1
        }
        lastMessageDate = normalizedDate
      }

      lastMessageTime = time
      messages.push({ date: normalizedDate, time, user, message })

      processedLines++

      // Add debug logging
      console.log('Processing line:', {
        original: line,
        match: match ? {
          date,
          time,
          user,
          message,
          isSystemMessage
        } : null
      });
    }

    const sortedUsers = Object.entries(userStats).sort((a, b) => b[1].messageCount - a[1].messageCount)
    const mostActiveUser = sortedUsers[0]?.[0] || 'N/A'
    const leastActiveUser = sortedUsers[sortedUsers.length - 1]?.[0] || 'N/A'

    const totalDays = Object.keys(messageCountByDate).length
    const averageMessagesPerDay = totalDays > 0 ? totalMessages / totalDays : 0

    const mostCommonWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const averageMessagesByHour = messagesByHour.map((count, hour) => ({
      hour,
      average: totalDays > 0 ? count / totalDays : 0,
    }))

    // Calculate weekday activity
    const weekdayActivity: WeekdayActivity[] = Object.entries(weekdayMessageCounts).map(([day, count]) => ({
      day,
      count,
      average: count / totalDays
    }))

    // Calculate message length distribution
    const messageLengthDistribution: MessageLengthDistribution[] = [
      { range: '0-10', count: 0 },
      { range: '11-20', count: 0 },
      { range: '21-50', count: 0 },
      { range: '51-100', count: 0 },
      { range: '101+', count: 0 }
    ]

    messageLengths.forEach(length => {
      if (length <= 10) messageLengthDistribution[0].count++
      else if (length <= 20) messageLengthDistribution[1].count++
      else if (length <= 50) messageLengthDistribution[2].count++
      else if (length <= 100) messageLengthDistribution[3].count++
      else messageLengthDistribution[4].count++
    })

    // Get top 5 longest messages
    const longestMessages = messages
      .sort((a, b) => b.message.length - a.message.length)
      .slice(0, 5)

    // Get emoji stats
    const emojiStats: EmojiStats[] = Object.entries(emojiCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get user emoji stats
    const userEmojiStats: UserEmojiStats[] = Object.entries(userEmojiCounts)
      .map(([user, emojiCount]) => ({ user, emojiCount }))
      .sort((a, b) => b.emojiCount - a.emojiCount)

    // Get link stats
    const linkStats: LinkStats = {
      totalLinks: Object.values(linkCounts).reduce((a, b) => a + b, 0),
      domainCounts: linkCounts
    }

    // Get conversation starters
    const conversationStarters: ConversationStarters = {
      firstMessage: firstMessageUsers,
      lastMessage: lastMessageUsers
    }

    // Calculate inactivity periods
    const inactivityPeriods: InactivityPeriod[] = []
    for (let i = 1; i < messages.length; i++) {
      const prevMessage = messages[i - 1]
      const currMessage = messages[i]
      const prevDateTime = parse(`${prevMessage.date} ${prevMessage.time}`, 'dd/MM/yyyy HH:mm:ss', new Date())
      const currDateTime = parse(`${currMessage.date} ${currMessage.time}`, 'dd/MM/yyyy HH:mm:ss', new Date())
      const diffHours = (currDateTime.getTime() - prevDateTime.getTime()) / (1000 * 60 * 60)

      if (diffHours >= 6) {
        inactivityPeriods.push({
          start: `${prevMessage.date} ${prevMessage.time}`,
          end: `${currMessage.date} ${currMessage.time}`,
          duration: diffHours
        })
      }
    }

    // Get the biggest time stop
    const biggestTimeStop = inactivityPeriods.length > 0
      ? inactivityPeriods.reduce((max, period) => period.duration > max.duration ? period : max, inactivityPeriods[0])
      : null;

    // Calculate longest conversations (threads of consecutive messages from the same user)
    const longestConversations: MessageData[][] = []
    let currentConversation: MessageData[] = []
    let currentUser = ''

    messages.forEach((message) => {
      if (message.user === currentUser) {
        currentConversation.push(message)
      } else {
        if (currentConversation.length > 1) {
          longestConversations.push(currentConversation)
        }
        currentConversation = [message]
        currentUser = message.user
      }
    })
    if (currentConversation.length > 1) {
      longestConversations.push(currentConversation)
    }
    longestConversations.sort((a, b) => b.length - a.length)

    // Calculate messages with most replies
    const messageReplies: Record<string, { message: MessageData; replyCount: number }> = {}
    messages.forEach((message, index) => {
      const replyMatch = message.message.match(/^@(\S+)/)
      if (replyMatch) {
        const repliedUser = replyMatch[1]
        for (let i = index - 1; i >= 0; i--) {
          if (messages[i].user === repliedUser) {
            const key = `${messages[i].date}-${messages[i].time}-${messages[i].user}`
            if (messageReplies[key]) {
              messageReplies[key].replyCount++
            } else {
              messageReplies[key] = { message: messages[i], replyCount: 1 }
            }
            break
          }
        }
      }
    })
    const mostRepliedMessages = Object.values(messageReplies)
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 3)

    console.log(`Processed ${processedLines} lines, skipped ${skippedLines} lines.`)
    return {
      totalMessages,
      userStats,
      mostActiveUser,
      leastActiveUser,
      averageMessagesPerDay,
      mostCommonWords,
      messageCountByDate,
      userMessageCountByDate,
      averageMessagesByHour,
      messages,
      weekdayActivity,
      messageLengthDistribution,
      longestMessages,
      emojiStats,
      userEmojiStats,
      linkStats,
      conversationStarters,
      inactivityPeriods,
      biggestTimeStop,
      longestConversations,
      mostRepliedMessages,
      systemMessages,
    }
  } catch (error) {
    console.error('Error in processWhatsAppChat:', error)
    throw new Error(`Failed to process chat data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

