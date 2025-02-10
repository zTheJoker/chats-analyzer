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
  totalMessages: number;
  totalWordCount: number;
  averageMessagesPerDay: number;
  mostActiveUser: string;
  leastActiveUser: string;
  messageCountByDate: Record<string, number>;
  userMessageCountByDate: Record<string, Record<string, number>>;
  userStats: {
    [key: string]: {
      messageCount: number;
      wordCount: number;
    }
  };
  uniqueWordsPerUser: {
    [key: string]: Set<string>;
  };
  weekdayActivity: Array<{
    day: string;
    count: number;
    average: number;
  }>;
  messageLengthDistribution: Array<{
    range: string;
    count: number;
  }>;
  longestMessages: Array<{
    date: string;
    time: string;
    user: string;
    message: string;
  }>;
  emojiStats: Array<{
    emoji: string;
    count: number;
  }>;
  userEmojiStats: Array<{
    user: string;
    emojiCount: number;
  }>;
  linkStats: {
    totalLinks: number;
    domainCounts: {
      [key: string]: number;
    };
  };
  conversationStarters: {
    firstMessage: Record<string, number>;
    lastMessage: Record<string, number>;
  };
  biggestTimeStop: {
    start: string;
    end: string;
    duration: number;
  } | null;
  longestConversations: Array<{
    date: string;
    time: string;
    user: string;
    message: string;
  }>[];
  mostRepliedMessages: Array<{
    message: {
      date: string;
      time: string;
      user: string;
      message: string;
    };
    replyCount: number;
  }>;
  firstMessageDate: string;
  mostCommonWords: Array<[string, number]>;
  averageMessagesByHour: Array<{
    hour: number;
    average: number;
  }>;
  systemMessages: string[];
}

