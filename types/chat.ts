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
    user: string;
    message: string;
    timestamp: Date;
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
  conversationStarters: Array<{
    user: string;
    count: number;
  }>;
  biggestTimeStop: {
    start: Date;
    end: Date;
    duration: number;
  };
  longestConversations: Array<{
    messages: Array<{
      user: string;
      message: string;
      timestamp: Date;
    }>;
    duration: number;
  }>;
  mostRepliedMessages: Array<{
    originalMessage: {
      user: string;
      message: string;
      timestamp: Date;
    };
    replies: number;
  }>;
}

