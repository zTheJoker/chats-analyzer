import { UserStats, MessageData } from '../types/chat'
import { parse, format, isValid } from 'date-fns'
import emojiRegex from 'emoji-regex'

const WHATSAPP_SYSTEM_WORDS = new Set([
  'created', 'changed', 'left', 'added', 'removed', 'joined', 'using', 'link', 'deleted', 'omitted',
  'this', 'message', 'was', 'edited', 'poll', 'the', 'group', 'admin', 'you', 'to', 'and',
  'image', 'video', 'audio', 'sticker', 'gif', 'document', 'contact', 'location', 'live',
  'missed', 'call', 'voice', 'ended', 'started', 'changed', 'security', 'code', 'invite',
  'link', 'description', 'subject', 'icon', 'participants', 'now', 'admin',
  
  // Common words to filter in multiple languages
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'en', 'sobre', 'para', 'de', 'con',
  'le', 'la', 'les', 'et', 'ou', 'mais', 'sur', 'pour', 'de', 'avec',
  'der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'auf', 'für', 'von', 'mit'
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
  firstMessageDate: string
  totalWordCount: number
  uniqueWordsPerUser: Record<string, Set<string>>
}

const MESSAGE_PATTERNS = [
  // Standard WhatsApp format with RTL support: [date], [time] - [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–]\s*(.*?):\s*(.+)$/,
  
  // WhatsApp format with optional brackets: [date] [time] [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*?):\s*(.+)$/,
  
  // WhatsApp format with date/time without brackets: MM/DD/YY, HH:MM - User: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]\s*(.*?):\s*(.+)$/,
  
  // Hebrew/RTL format with square brackets: [DD/MM/YYYY, HH:MM:SS] User: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*?):\s*(.+)$/,
  
  // System message format: [date], [time] - [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–]?\s*(.+)$/
];

function parseDate(dateString: string): Date | null {
  // Clean up the date string
  const cleanDate = dateString.trim().replace(/[,\[\]]/g, '');
  
  // Define all possible date formats
  const formats = [
    // US formats (month first)
    'M/d/yy', 'M/d/yyyy', 'MM/dd/yy', 'MM/dd/yyyy',
    'M-d-yy', 'M-d-yyyy', 'MM-dd-yy', 'MM-dd-yyyy',
    'M.d.yy', 'M.d.yyyy', 'MM.dd.yy', 'MM.dd.yyyy',
    
    // European/International formats (day first)
    'd/M/yy', 'd/M/yyyy', 'dd/MM/yy', 'dd/MM/yyyy',
    'd-M-yy', 'd-M-yyyy', 'dd-MM-yy', 'dd-MM-yyyy',
    'd.M.yy', 'd.M.yyyy', 'dd.MM.yy', 'dd.MM.yyyy',
    
    // ISO formats (year first)
    'yyyy/MM/dd', 'yy/MM/dd', 'yyyy-MM-dd', 'yy-MM-dd',
    'yyyy.MM.dd', 'yy.MM.dd',
    
    // Additional formats for different locales
    'yyyy/d/M', 'yy/d/M', 'yyyy/dd/MM', 'yy/dd/MM',
    'd/MMM/yyyy', 'dd/MMM/yyyy', 'd/MMM/yy', 'dd/MMM/yy',
    'MMM/d/yyyy', 'MMM/dd/yyyy', 'MMM/d/yy', 'MMM/dd/yy'
  ];

  let parsedDate: Date | null = null;

  // First, check if we have a numeric format before attempting parsing
  // This helps avoid unnecessary parsing attempts
  const isNumericDate = /^\d{1,4}[-./]\d{1,2}[-./]\d{1,4}$/.test(cleanDate);
  
  if (isNumericDate) {
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
          
          // Validate that the date is reasonable (not in the far future)
          if (attemptedDate.getFullYear() <= new Date().getFullYear() + 1) {
            parsedDate = attemptedDate;
            break;
          }
        }
      } catch {
        continue;
      }
    }
  }

  // If we couldn't parse the date, try to handle special cases
  if (!parsedDate) {
    try {
      // Try to parse as a JavaScript Date object directly
      const directDate = new Date(cleanDate);
      if (isValid(directDate) && directDate.getFullYear() > 1970) {
        parsedDate = directDate;
      }
    } catch {
      // Ignore errors from direct parsing
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

function isValidWord(word: string): boolean {
  const cleanWord = word.toLowerCase().trim()
  return (
    cleanWord.length > 2 && // Minimum length
    !WHATSAPP_SYSTEM_WORDS.has(cleanWord) && // Not a system/common word
    !/^\d+$/.test(cleanWord) && // Not just numbers
    !/^[!@#$%^&*(),.?":{}|<>]+$/.test(cleanWord) // Not just punctuation
  )
}

function processWords(message: string, user: string): number {
  // Normalize text to handle unicode variations
  const normalizedMessage = message.normalize('NFD');
  
  // Handle URLs as single words
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withoutUrls = normalizedMessage.replace(urlRegex, ' URL ');
  
  // Split by various delimiters while preserving words from different scripts
  // This pattern works better for languages like Hebrew, Arabic, Chinese, etc.
  const words = withoutUrls
    .split(/[\s!?.,:;()\[\]{}'"،、。？！।॥「」『』【】〖〗《》]+/)
    .filter(word => {
      const cleanWord = word.toLowerCase().trim()
      return (
        cleanWord.length > 1 && // At least 2 characters
        !WHATSAPP_SYSTEM_WORDS.has(cleanWord) &&
        !/^\d+$/.test(cleanWord) && // Not just numbers
        !/^[!@#$%^&*(),.?":{}|<>]+$/.test(cleanWord) && // Not just punctuation
        cleanWord !== 'URL' // Filter out our URL placeholder
      )
    });

  return words.length;
}

export async function processWhatsAppChat(chatText: string): Promise<ChatData> {
  try {
    if (!chatText || typeof chatText !== 'string') {
      throw new Error('Invalid chat text provided')
    }

    const lines = chatText.split('\n')
    if (lines.length === 0) {
      throw new Error('The chat file is empty')
    }

    // Initialize all required data structures with default values
    const userStats: Record<string, UserStats> = {}
    const messageCountByDate: Record<string, number> = {}
    const userMessageCountByDate: Record<string, Record<string, number>> = {}
    const wordFrequency: Record<string, number> = {}
    const messagesByHour: number[] = new Array(24).fill(0)
    const messages: MessageData[] = []
    const weekdayMessageCounts: Record<string, number> = {}
    const messageLengths: number[] = []
    const emojiCounts: Record<string, number> = {}
    const userEmojiCounts: Record<string, number> = {}
    const linkCounts: Record<string, number> = {}
    const firstMessageUsers: Record<string, number> = {}
    const lastMessageUsers: Record<string, number> = {}
    const systemMessages: string[] = []
    const uniqueWordsPerUser: Record<string, Set<string>> = {}
    
    let totalMessages = 0
    let totalWordCount = 0
    let firstMessageDate = ''
    let processedLines = 0
    let skippedLines = 0
    let currentDate = ''
    let lastMessageDate = ''
    let lastMessageTime = ''

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

      // Special handling for system messages and media across different languages
      if (message) {
        // Media patterns in multiple languages (English, Hebrew, Spanish, etc.)
        const mediaPattern = /<?(Media|image|video|audio|sticker|gif|document|contact|location|live|תמונה|סרטון|הודעה קולית|מדיה|imagen|video|audio|sticker|documento) omitted>?/i
        
        // Deleted message patterns in multiple languages
        const deletedPattern = /(?:This message was deleted|You deleted this message|הודעה זו נמחקה|ההודעה נמחקה|Este mensaje fue eliminado|Has eliminado este mensaje|Message supprimé|Du hast diese Nachricht gelöscht)/i
        
        // Missing media patterns
        const missingMediaPattern = /(Media not included|Media not available|Failed to load|Failed to download)/i
        
        // Poll, contacts, locations patterns
        const specialContentPattern = /(Poll:|Live location|Location:|Contact card|Contact:|Poll message)/i
        
        if (mediaPattern.test(message) || 
            deletedPattern.test(message) || 
            missingMediaPattern.test(message) ||
            specialContentPattern.test(message) ||
            message.includes('omitted')) {
          isSystemMessage = true
        }
      }

      if (!match || (!date && !time)) {
        // If no pattern matches or missing date/time, treat as system message
        systemMessages.push(cleanupText(line))
        skippedLines++
        continue
      }

      // Handle system messages
      if (isSystemMessage) {
        systemMessages.push(message || '')
        continue
      }

      // Process regular messages
      if (!user || !message || !time || !date) {
        console.warn(`Skipping invalid line ${i + 1}: Missing required data`)
        skippedLines++
        continue
      }

      // Parse the date using our enhanced parser
      const parsedDate = parseDate(date)
      if (!parsedDate || !isValid(parsedDate)) {
        console.warn(`Skipping invalid line ${i + 1}: Invalid date format '${date}'`)
        skippedLines++
        continue
      }

      // Clean up user name and message
      user = cleanupText(user.trim())
      message = cleanupText(message.trim())
      const normalizedDate = format(parsedDate, 'dd/MM/yyyy')

      // Add message to messages array
      const messageData: MessageData = {
        date: normalizedDate,
        time,
        user,
        message
      }
      messages.push(messageData)

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

      // Process words for frequency using our improved method
      if (!isSystemMessage && user && message) {
        const wordCount = processWords(message, user)
        
        // Process words for both frequency and uniqueness
        const normalizedMessage = message.normalize('NFD');
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const withoutUrls = normalizedMessage.replace(urlRegex, ' URL ');
        
        const messageWords = withoutUrls
          .split(/[\s!?.,:;()\[\]{}'"،、。？！।॥「」『』【】〖〗《》]+/)
          .filter(word => {
            const cleanWord = word.toLowerCase().trim()
            return (
              cleanWord.length > 1 &&
              !WHATSAPP_SYSTEM_WORDS.has(cleanWord) &&
              !/^\d+$/.test(cleanWord) &&
              !/^[!@#$%^&*(),.?":{}|<>]+$/.test(cleanWord) &&
              cleanWord !== 'URL'
            )
          })
          
        messageWords.forEach((word) => {
          const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '')
          if (cleanWord && !WHATSAPP_SYSTEM_WORDS.has(cleanWord) && 
              (isNaN(Number(cleanWord)) || isNonLatinChar(cleanWord[0]))) {
            // Update word frequency
            wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1
            
            // Update unique words for user
            if (!uniqueWordsPerUser[user]) {
              uniqueWordsPerUser[user] = new Set()
            }
            uniqueWordsPerUser[user].add(cleanWord)
          }
        })
        
        // Update user stats with the word count from our specialized function
        userStats[user].wordCount += wordCount
        totalWordCount += wordCount
      }

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

      if (!firstMessageDate && normalizedDate) {
        firstMessageDate = normalizedDate
      }

      // Word processing is now handled earlier in a more accurate way
    }

    // Ensure safe calculations
    const totalDays = Object.keys(messageCountByDate).length || 1
    const averageMessagesPerDay = totalMessages / totalDays

    // Sort users by message count
    const sortedUsers = Object.entries(userStats).sort((a, b) => b[1].messageCount - a[1].messageCount)
    const mostActiveUser = sortedUsers[0]?.[0] || 'Unknown'
    const leastActiveUser = sortedUsers[sortedUsers.length - 1]?.[0] || 'Unknown'

    const mostCommonWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const averageMessagesByHour = messagesByHour.map((count, hour) => ({
      hour,
      average: count / totalDays,
    }))

    // Calculate weekday activity
    const weekdayActivity: WeekdayActivity[] = Object.entries(weekdayMessageCounts).map(([day, count]) => ({
      day,
      count,
      average: count / totalDays
    }))

    // Calculate message length distribution
    const messageLengthDistribution: MessageLengthDistribution[] = [
      { range: '0-10', count: messageLengths.filter(l => l <= 10).length },
      { range: '11-20', count: messageLengths.filter(l => l > 10 && l <= 20).length },
      { range: '21-50', count: messageLengths.filter(l => l > 20 && l <= 50).length },
      { range: '51-100', count: messageLengths.filter(l => l > 50 && l <= 100).length },
      { range: '101+', count: messageLengths.filter(l => l > 100).length },
    ]

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
    // Calculate response time statistics
    const responseTimesInSeconds: number[] = [];
    const userResponseTimes: Record<string, number[]> = {};

    // Process messages to calculate response times
    for (let i = 1; i < messages.length; i++) {
      const prevMessage = messages[i - 1];
      const currMessage = messages[i];
      
      // Only calculate if different users (responses, not self-replies)
      if (prevMessage.user !== currMessage.user) {
        try {
          const prevDateTime = parse(`${prevMessage.date} ${prevMessage.time}`, 'dd/MM/yyyy HH:mm:ss', new Date());
          const currDateTime = parse(`${currMessage.date} ${currMessage.time}`, 'dd/MM/yyyy HH:mm:ss', new Date());
          
          // Calculate difference in seconds
          const diffSeconds = (currDateTime.getTime() - prevDateTime.getTime()) / 1000;
          
          // Skip unrealistically long response times (e.g., over 24 hours)
          if (diffSeconds > 0 && diffSeconds < 86400) {
            responseTimesInSeconds.push(diffSeconds);
            
            // Track by responder
            if (!userResponseTimes[currMessage.user]) {
              userResponseTimes[currMessage.user] = [];
            }
            userResponseTimes[currMessage.user].push(diffSeconds);
          }
        } catch (error) {
          console.warn('Error calculating response time:', error);
          // Continue processing other messages
        }
      }
    }

    // Calculate average response time
    const averageResponseTime = responseTimesInSeconds.length > 0 
      ? responseTimesInSeconds.reduce((sum, time) => sum + time, 0) / responseTimesInSeconds.length 
      : 0;

    // Calculate average response time per user
    const userAverageResponseTimes: Record<string, number> = {};
    Object.entries(userResponseTimes).forEach(([user, times]) => {
      userAverageResponseTimes[user] = times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    // Calculate response time distribution
    const responseTimeDistribution = [
      { range: "0-10s", count: responseTimesInSeconds.filter(t => t <= 10).length },
      { range: "10-30s", count: responseTimesInSeconds.filter(t => t > 10 && t <= 30).length },
      { range: "30s-1m", count: responseTimesInSeconds.filter(t => t > 30 && t <= 60).length },
      { range: "1-5m", count: responseTimesInSeconds.filter(t => t > 60 && t <= 300).length },
      { range: "5-30m", count: responseTimesInSeconds.filter(t => t > 300 && t <= 1800).length },
      { range: "30m-1h", count: responseTimesInSeconds.filter(t => t > 1800 && t <= 3600).length },
      { range: "1h+", count: responseTimesInSeconds.filter(t => t > 3600).length },
    ];

    // Get fastest responders (users with at least 5 responses)
    const fastestResponders = Object.entries(userResponseTimes)
      .filter(([_, times]) => times.length >= 5)
      .map(([user, times]) => ({
        user,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => a.averageTime - b.averageTime)
      .slice(0, 5);

    return {
      totalMessages,
      totalWordCount,
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
      firstMessageDate: firstMessageDate || new Date().toISOString().split('T')[0],
      uniqueWordsPerUser,
      responseTimeStats: {
        averageResponseTime,
        userResponseTimes: userAverageResponseTimes,
        responseTimeDistribution,
        fastestResponders
      }
    }
  } catch (error) {
    console.error('Error in processWhatsAppChat:', error)
    throw new Error(`Failed to process chat data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

