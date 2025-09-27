import { UserStats, MessageData } from '../types/chat'
import { parse, format, isValid } from 'date-fns'
import emojiRegex from 'emoji-regex'

const WHATSAPP_SYSTEM_WORDS = new Set([
  // WhatsApp system messages and media
  'created', 'changed', 'left', 'added', 'removed', 'joined', 'using', 'link', 'deleted', 'omitted',
  'this', 'message', 'was', 'edited', 'poll', 'the', 'group', 'admin', 'you', 'to', 'and',
  'image', 'video', 'audio', 'sticker', 'gif', 'document', 'contact', 'location', 'live',
  'missed', 'call', 'voice', 'ended', 'started', 'changed', 'security', 'code', 'invite',
  'link', 'description', 'subject', 'icon', 'participants', 'now', 'admin',
  
  // Media and file-related terms
  'file', 'attached', 'jpg', 'jpeg', 'png', 'opus', 'pdf', 'mp3', 'mp4', 'avi', 'mov',
  'webp', 'docx', 'xlsx', 'pptx', 'txt', 'zip', 'rar', 'attachment', 'sent', 'received',
  
  // English common words
  'it', 'me', 'im', 'i', 'my', 'mine', 'we', 'us', 'our', 'ours', 'they', 'them', 'their',
  'so', 'is', 'are', 'am', 'be', 'been', 'was', 'were', 'will', 'would', 'can', 'could',
  'should', 'may', 'might', 'must', 'just', 'very', 'too', 'also', 'here', 'there',
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'he', 'she', 'his', 'her', 'him', 'has', 'have', 'had', 'do', 'does', 'did', 'get',
  'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know', 'knew', 'think', 'thought',
  'say', 'said', 'tell', 'told', 'want', 'wanted', 'make', 'made', 'take', 'took',
  'give', 'gave', 'look', 'looked', 'use', 'used', 'find', 'found', 'work', 'worked',
  'call', 'called', 'try', 'tried', 'ask', 'asked', 'need', 'needed', 'feel', 'felt',
  'become', 'became', 'leave', 'left', 'put', 'keep', 'kept', 'let', 'begin', 'began',
  'seem', 'seemed', 'help', 'helped', 'talk', 'talked', 'turn', 'turned', 'start', 'started',
  'show', 'showed', 'hear', 'heard', 'play', 'played', 'run', 'ran', 'move', 'moved',
  'live', 'lived', 'believe', 'believed', 'hold', 'held', 'bring', 'brought', 'happen',
  'happened', 'write', 'wrote', 'provide', 'provided', 'sit', 'sat', 'stand', 'stood',
  'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued',
  'set', 'learn', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood',
  'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created',
  'speak', 'spoke', 'read', 'read', 'allow', 'allowed', 'add', 'added', 'spend', 'spent',
  'grow', 'grew', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'offer', 'offered',
  'remember', 'remembered', 'love', 'loved', 'consider', 'considered', 'appear', 'appeared',
  'buy', 'bought', 'wait', 'waited', 'serve', 'served', 'die', 'died', 'send', 'sent',
  'expect', 'expected', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'cut', 'cut',
  'reach', 'reached', 'kill', 'killed', 'remain', 'remained', 'url',
  
  // Spanish common words
  'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'en', 'sobre', 'para', 'de', 'con',
  'que', 'no', 'si', 'he', 'lo', 'es', 'ya', 'te', 'se', 'por', 'ha', 'mi', 'yo', 'esta',
  'del', 'mas', 'al', 'voy', 'bien', 'muy', 'como', 'tu', 'estoy', 'min', 'tengo', 'ok', 'ahora',
  'has', 'ver', 'eso', 'hay', 'dia', 'dias', 'su', 'sus', 'le', 'les', 'me', 'nos', 'os',
  'uno', 'dos', 'tres', 'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver',
  'dar', 'saber', 'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar',
  'creer', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar',
  'salir', 'volver', 'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar',
  'empezar', 'esperar', 'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder',
  'producir', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar', 'terminar', 'permitir',
  'aparecer', 'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar',
  'leer', 'caer', 'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'acabar',
  'convertir', 'ganar', 'formar', 'traer', 'partir', 'morir', 'aceptar', 'realizar', 'suponer',
  'comprender', 'lograr', 'explicar', 'preguntar', 'tocar', 'reconocer', 'estudiar', 'alcanzar',
  'nacer', 'dirigir', 'correr', 'utilizar', 'pagar', 'ayudar', 'gustar', 'jugar', 'escuchar',
  
  // French common words
  'le', 'la', 'les', 'et', 'ou', 'mais', 'sur', 'pour', 'de', 'avec', 'ce', 'ces', 'un', 'une',
  'des', 'du', 'dans', 'par', 'sans', 'sous', 'entre', 'vers', 'chez', 'depuis', 'pendant',
  'avant', 'après', 'quand', 'comme', 'si', 'où', 'que', 'qui', 'quoi', 'dont', 'il', 'elle',
  'ils', 'elles', 'je', 'tu', 'nous', 'vous', 'me', 'te', 'se', 'lui', 'leur', 'mon', 'ma',
  'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur',
  'leurs', 'ce', 'cette', 'cet', 'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir',
  'pouvoir', 'falloir', 'vouloir', 'venir', 'devoir', 'prendre', 'donner', 'mettre', 'partir',
  'tenir', 'rester', 'sortir', 'passer', 'porter', 'suivre', 'vivre', 'entrer', 'parler',
  'montrer', 'demander', 'trouver', 'rendre', 'devenir', 'laisser', 'comprendre', 'croire',
  'sembler', 'paraître', 'connaître', 'commencer', 'finir', 'arriver', 'penser', 'aimer',
  'regarder', 'attendre', 'entendre', 'perdre', 'répondre', 'changer', 'ouvrir', 'jouer',
  'gagner', 'courir', 'marcher', 'écrire', 'lire', 'apprendre', 'garder', 'appeler', 'sentir',
  'mourir', 'naître', 'acheter', 'poser', 'agir', 'servir', 'utiliser', 'tomber', 'créer',
  'manquer', 'retrouver', 'porter', 'atteindre', 'décider', 'tuer', 'manger', 'oublier',
  'chercher', 'obtenir', 'exister', 'expliquer', 'reconnaître', 'construire', 'élever',
  'casser', 'tirer', 'fermer', 'voyager', 'continuer', 'prévoir', 'développer', 'maintenir',
  
  // German common words
  'der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'auf', 'für', 'von', 'mit', 'zu', 'an',
  'bei', 'nach', 'aus', 'über', 'um', 'durch', 'gegen', 'ohne', 'unter', 'vor', 'zwischen',
  'während', 'bis', 'seit', 'trotz', 'wegen', 'statt', 'außer', 'ich', 'du', 'er', 'sie',
  'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'ihn', 'uns', 'euch', 'mir', 'dir', 'ihm',
  'ihr', 'ihnen', 'mein', 'dein', 'sein', 'unser', 'euer', 'dieser', 'diese', 'dieses',
  'jener', 'jene', 'jenes', 'welcher', 'welche', 'welches', 'sein', 'haben', 'werden',
  'können', 'müssen', 'sollen', 'wollen', 'dürfen', 'mögen', 'gehen', 'kommen', 'sehen',
  'machen', 'geben', 'nehmen', 'wissen', 'sagen', 'denken', 'finden', 'lassen', 'bleiben',
  'stehen', 'liegen', 'sitzen', 'fahren', 'laufen', 'sprechen', 'hören', 'fragen', 'zeigen',
  'bringen', 'holen', 'kaufen', 'verkaufen', 'essen', 'trinken', 'schlafen', 'arbeiten',
  'spielen', 'lernen', 'lehren', 'verstehen', 'erklären', 'helfen', 'beginnen', 'aufhören',
  'öffnen', 'schließen', 'schreiben', 'lesen', 'vergessen', 'erinnern', 'treffen', 'kennen',
  'leben', 'sterben', 'geboren', 'wachsen', 'fallen', 'steigen', 'ziehen', 'drücken',
  'werfen', 'fangen', 'schneiden', 'bauen', 'zerstören', 'reparieren', 'putzen', 'waschen',
  'kochen', 'backen', 'singen', 'tanzen', 'zeichnen', 'malen', 'fotografieren', 'filmen',
  
  // Hindi common words (romanized)
  'main', 'mein', 'tu', 'tum', 'aap', 'yeh', 'woh', 'is', 'us', 'ka', 'ki', 'ke', 'ko',
  'se', 'mein', 'par', 'tak', 'aur', 'ya', 'lekin', 'kyunki', 'agar', 'toh', 'phir',
  'abhi', 'ab', 'kabhi', 'kya', 'kaun', 'kahan', 'kaise', 'kyun', 'jab', 'tab', 'kal',
  'aaj', 'kal', 'subah', 'sham', 'raat', 'din', 'saal', 'mahina', 'hafta', 'ghanta',
  'minute', 'second', 'paisa', 'rupaya', 'ghar', 'office', 'school', 'college', 'university',
  'hospital', 'market', 'shop', 'restaurant', 'hotel', 'station', 'airport', 'bus', 'train',
  'car', 'bike', 'auto', 'taxi', 'rickshaw', 'metro', 'kaam', 'karna', 'hona', 'jaana',
  'aana', 'dekhna', 'sunna', 'bolna', 'kehna', 'samjhna', 'sikhna', 'padhna', 'likhna',
  'khana', 'peena', 'sona', 'uthna', 'baithna', 'khada', 'chalna', 'daurna', 'uthana',
  'rakhna', 'lena', 'dena', 'bhejana', 'lana', 'jana', 'milna', 'banana', 'bigadna',
  
  // Norwegian common words
  'jeg', 'du', 'han', 'hun', 'det', 'vi', 'dere', 'de', 'meg', 'deg', 'ham', 'henne',
  'oss', 'dem', 'min', 'din', 'hans', 'hennes', 'vår', 'deres', 'denne', 'dette', 'den',
  'og', 'eller', 'men', 'i', 'på', 'til', 'for', 'av', 'med', 'om', 'fra', 'over',
  'under', 'ved', 'etter', 'før', 'når', 'hvor', 'hvorfor', 'hvordan', 'hva', 'hvem',
  'være', 'ha', 'gjøre', 'si', 'gå', 'komme', 'se', 'vite', 'kunne', 'skulle', 'ville',
  'måtte', 'få', 'ta', 'gi', 'bli', 'finne', 'tenke', 'tro', 'føle', 'høre', 'snakke',
  'spørre', 'svare', 'fortelle', 'vise', 'begynne', 'slutte', 'åpne', 'lukke', 'lese',
  'skrive', 'lære', 'forstå', 'huske', 'glemme', 'møte', 'kjenne', 'elske', 'like',
  'hate', 'leve', 'dø', 'fødes', 'vokse', 'falle', 'sitte', 'stå', 'ligge', 'løpe',
  'kjøre', 'fly', 'reise', 'arbeide', 'spille', 'synge', 'danse', 'tegne', 'male',
  
  // Italian common words
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'o', 'ma', 'però',
  'in', 'su', 'per', 'di', 'da', 'con', 'tra', 'fra', 'sopra', 'sotto', 'dentro',
  'fuori', 'davanti', 'dietro', 'accanto', 'vicino', 'lontano', 'prima', 'dopo',
  'durante', 'quando', 'dove', 'come', 'perché', 'che', 'chi', 'cosa', 'quale',
  'quanto', 'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'mi', 'ti', 'lo', 'la',
  'ci', 'vi', 'li', 'le', 'gli', 'mio', 'tuo', 'suo', 'nostro', 'vostro', 'loro',
  'questo', 'questa', 'quello', 'quella', 'essere', 'avere', 'fare', 'dire', 'andare',
  'vedere', 'sapere', 'dare', 'stare', 'venire', 'dovere', 'potere', 'volere', 'uscire',
  'partire', 'tornare', 'rimanere', 'diventare', 'entrare', 'portare', 'mettere',
  'sentire', 'parlare', 'arrivare', 'passare', 'vivere', 'morire', 'nascere', 'crescere',
  'cadere', 'alzare', 'aprire', 'chiudere', 'leggere', 'scrivere', 'imparare', 'insegnare',
  'capire', 'spiegare', 'aiutare', 'lavorare', 'giocare', 'cantare', 'ballare', 'disegnare',
  
  // Portuguese common words
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'e', 'ou', 'mas', 'em', 'no',
  'na', 'nos', 'nas', 'para', 'por', 'de', 'do', 'da', 'dos', 'das', 'com', 'sem',
  'sobre', 'sob', 'entre', 'contra', 'até', 'desde', 'durante', 'antes', 'depois',
  'quando', 'onde', 'como', 'porque', 'que', 'quem', 'qual', 'quanto', 'eu', 'tu',
  'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'me', 'te', 'se', 'nos', 'vos', 'lhe',
  'lhes', 'meu', 'teu', 'seu', 'nosso', 'vosso', 'este', 'esta', 'esse', 'essa',
  'aquele', 'aquela', 'ser', 'estar', 'ter', 'haver', 'fazer', 'dizer', 'ir', 'ver',
  'dar', 'saber', 'poder', 'querer', 'vir', 'dever', 'pôr', 'ficar', 'chegar', 'passar',
  'deixar', 'parecer', 'falar', 'trazer', 'levar', 'encontrar', 'pensar', 'sentir',
  'viver', 'morrer', 'nascer', 'crescer', 'cair', 'subir', 'descer', 'entrar', 'sair',
  'voltar', 'partir', 'começar', 'acabar', 'abrir', 'fechar', 'ler', 'escrever',
  'aprender', 'ensinar', 'entender', 'explicar', 'ajudar', 'trabalhar', 'jogar',
  'cantar', 'dançar', 'desenhar', 'pintar',
  
  // Dutch common words
  'de', 'het', 'een', 'en', 'of', 'maar', 'in', 'op', 'voor', 'van', 'met', 'aan',
  'bij', 'naar', 'uit', 'over', 'onder', 'tussen', 'door', 'tegen', 'zonder', 'vanaf',
  'tijdens', 'voordat', 'nadat', 'wanneer', 'waar', 'hoe', 'waarom', 'wat', 'wie',
  'welke', 'hoeveel', 'ik', 'jij', 'hij', 'zij', 'wij', 'jullie', 'me', 'je', 'hem',
  'haar', 'ons', 'hun', 'mijn', 'jouw', 'zijn', 'ons', 'onze', 'deze', 'die', 'dat',
  'zijn', 'hebben', 'doen', 'zeggen', 'gaan', 'komen', 'zien', 'weten', 'kunnen',
  'moeten', 'willen', 'mogen', 'krijgen', 'geven', 'maken', 'worden', 'blijven',
  'liggen', 'staan', 'zitten', 'lopen', 'rijden', 'vliegen', 'spreken', 'horen',
  'vragen', 'antwoorden', 'vertellen', 'laten', 'beginnen', 'stoppen', 'openen',
  'sluiten', 'lezen', 'schrijven', 'leren', 'begrijpen', 'vergeten', 'herinneren',
  'ontmoeten', 'kennen', 'houden', 'leven', 'sterven', 'geboren', 'groeien', 'vallen',
  'werken', 'spelen', 'zingen', 'dansen', 'tekenen', 'schilderen'
])

function isNonLatinChar(char: string): boolean {
  return /[^\u0000-\u007F]/.test(char)
}

function getWeekday(dateString: string): string {
  const date = parse(dateString, 'dd/MM/yyyy', new Date())
  if (!isValid(date)) {
    return 'Unknown'
  }
  try {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  } catch {
    return 'Unknown'
  }
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
  responseTimeStats?: {
    averageResponseTime: number
    userResponseTimes: Record<string, number>
    responseTimeDistribution: Array<{
      range: string
      count: number
    }>
    fastestResponders: Array<{
      user: string
      averageTime: number
    }>
  }
}

const MESSAGE_PATTERNS = [
  // Standard WhatsApp format with RTL support and AM/PM: [date], [time AM/PM] - [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]?\s*[-–]\s*(.*?):\s*(.+)$/i,
  
  // WhatsApp format with optional brackets and AM/PM: [date] [time AM/PM] [user]: [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]?\s*(.*?):\s*(.+)$/i,
  
  // WhatsApp format with date/time without brackets and AM/PM: MM/DD/YY, HH:MM AM/PM - User: Message
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–]\s*(.*?):\s*(.+)$/i,
  
  // Hebrew/RTL format with square brackets and AM/PM: [DD/MM/YYYY, HH:MM:SS AM/PM] User: Message
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]\s*(.*?):\s*(.+)$/i,
  
  // System message format with AM/PM: [date], [time AM/PM] - [message]
  /^[\u200E\u200F]?\[?(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})[,\]]?,?\s*[\u200E\u200F]?\[?(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\]?\s*[-–]?\s*(.+)$/i
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

function cleanUsername(username: string): string {
  return username
    .replace(/\s*(AM|PM)\s*\]?$/i, '')           // Remove trailing AM/PM and optional bracket
    .replace(/^\[+|\]+$/g, '')                   // Remove leading/trailing brackets
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Remove RTL/LTR markers
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

function parseDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    // First try using our existing robust parseDate function
    const parsedDate = parseDate(dateStr);
    
    if (!parsedDate) {
      console.warn('Could not parse date:', dateStr);
      return null;
    }
    
    // Clean the time string and check for AM/PM
    const cleanTimeStr = timeStr.trim();
    const isAM = /\bAM\b/i.test(cleanTimeStr);
    const isPM = /\bPM\b/i.test(cleanTimeStr);
    
    // Remove AM/PM from time string before parsing
    const timeOnly = cleanTimeStr.replace(/\s*(AM|PM)\s*/i, '');
    
    // Parse the time component
    const timeParts = timeOnly.split(':').map(part => parseInt(part, 10));
    if (timeParts.length < 2 || timeParts.some(isNaN)) {
      console.warn('Invalid time format:', timeStr);
      return null;
    }
    
    let hours = timeParts[0];
    const minutes = timeParts[1];
    const seconds = timeParts.length > 2 ? timeParts[2] : 0;
    
    // Handle 12-hour format conversion
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }
    
    // Validate hours are in valid range
    if (hours < 0 || hours > 23) {
      console.warn('Invalid hour value:', hours, 'from', timeStr);
      return null;
    }
    
    // Set the time on our parsed date
    parsedDate.setHours(hours, minutes, seconds);
    
    return parsedDate;
  } catch (error) {
    console.error('Error parsing date/time:', error);
    return null;
  }
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
            user = cleanUsername(cleanWhatsAppFormatting(user))
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
      user = cleanUsername(cleanupText(user.trim()))
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

      // Use the proper parseDateTime function to handle 12-hour format correctly
      const fullDateTime = parseDateTime(date, time)
      if (fullDateTime) {
        const hour = fullDateTime.getHours()
        if (hour >= 0 && hour <= 23) {
          messagesByHour[hour]++
        }
      } else {
        // Fallback to the old method if parseDateTime fails
        const hour = parseInt(time.split(':')[0], 10)
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          messagesByHour[hour]++
        }
      }

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
        // Convert the normalized date to ISO format for better compatibility
        try {
          const isoDate = format(parsedDate, 'yyyy-MM-dd')
          firstMessageDate = isoDate
        } catch {
          firstMessageDate = normalizedDate
        }
      }

      // Word processing is now handled earlier in a more accurate way
    }

    // Ensure safe calculations
    const totalDays = Object.keys(messageCountByDate).length || 1
    const averageMessagesPerDay = totalDays > 0 ? totalMessages / totalDays : 0

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
      const prevDateTime = parseDateTime(prevMessage.date, prevMessage.time)
      const currDateTime = parseDateTime(currMessage.date, currMessage.time)
      
      // Only calculate if both dates are valid
      if (prevDateTime && currDateTime) {
        const diffHours = (currDateTime.getTime() - prevDateTime.getTime()) / (1000 * 60 * 60)

        // Only consider gaps between consecutive messages that are from different points in time
        // This prevents counting the full chat duration as an inactivity period
        if (diffHours >= 6 && diffHours < 8760) { // 8760 hours = 1 year (to filter out extremely long periods)
          inactivityPeriods.push({
            start: `${prevMessage.date} ${prevMessage.time}`,
            end: `${currMessage.date} ${currMessage.time}`,
            duration: diffHours
          })
        }
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
      // Check for multiple reply patterns:
      // 1. Standard @username format
      // 2. Messages that start with a username followed by a colon (User: message)
      // 3. Messages that contain "replying to" format which happens when someone quotes a message
      // 4. Messages that use WhatsApp quoting format with ⟫ symbol or brackets
      
      // Pattern 1: @username
      const replyMatch = message.message.match(/^@(\S+)/)
      
      // Pattern 2: Username: message 
      const colonReplyMatch = message.message.match(/^([^:]+):\s/)
      
      // Pattern 3: Messages containing quoted content or "replying to"
      const quotedReplyMatch = message.message.includes('⟩') || 
                              message.message.toLowerCase().includes('replying to')
      
      // Pattern 4: WhatsApp quote formats
      const whatsAppQuoteMatch = 
            message.message.includes('⟫') || 
            message.message.includes('⟩⟩') ||
            message.message.includes('>>') ||
            (message.message.includes('[') && message.message.includes(']'))
            
      // Pattern 5: Direct name mentions at start of message (common in group chats)
      let directMentionMatch = null
      // Only check for direct mentions in messages with at least 2 words (to avoid false positives)
      const words = message.message.split(/\s+/)
      if (words.length >= 2) {
        // Check if any username appears at the start of the message
        const usernames = Object.keys(userStats)
        for (const username of usernames) {
          // Only consider usernames with 3+ characters to avoid false positives with short names
          if (username.length >= 3 && 
              message.message.toLowerCase().startsWith(username.toLowerCase())) {
            directMentionMatch = username
            break
          }
        }
      }
      
      let repliedUser = null
      
      if (replyMatch) {
        // @username format
        repliedUser = replyMatch[1]
      } else if (colonReplyMatch) {
        // Check if the text before colon matches a username in the chat
        const possibleUser = colonReplyMatch[1].trim()
        // Verify this is actually a username in our chat
        const isKnownUser = Object.keys(userStats).some(user => 
          user.toLowerCase() === possibleUser.toLowerCase())
        
        if (isKnownUser) {
          repliedUser = possibleUser
        }
      } else if (directMentionMatch) {
        // Direct name mention
        repliedUser = directMentionMatch
      }
      
      // If we identified a replied user, look for their message
      if (repliedUser) {
        // Look for the most recent message from this user
        for (let i = index - 1; i >= 0 && i >= index - 10; i--) {
          if (messages[i].user === repliedUser || 
              messages[i].user.toLowerCase() === repliedUser.toLowerCase()) {
            const key = `${messages[i].date}-${messages[i].time}-${messages[i].user}`
            if (messageReplies[key]) {
              messageReplies[key].replyCount++
            } else {
              messageReplies[key] = { message: messages[i], replyCount: 1 }
            }
            console.log(`Detected reply: ${message.user} replied to ${messages[i].user}'s message`)
            break
          }
        }
      } else if (quotedReplyMatch || whatsAppQuoteMatch) {
        // For quoted content, just assume it's replying to the previous message
        // if from a different user (simpler heuristic)
        if (index > 0 && message.user !== messages[index-1].user) {
          const prevMessage = messages[index-1]
          const key = `${prevMessage.date}-${prevMessage.time}-${prevMessage.user}`
          if (messageReplies[key]) {
            messageReplies[key].replyCount++
          } else {
            messageReplies[key] = { message: prevMessage, replyCount: 1 }
          }
          console.log(`Detected quoted reply: ${message.user} replied to ${prevMessage.user}'s message`)
        }
      }
    })
    const mostRepliedMessages = Object.values(messageReplies)
      .sort((a, b) => b.replyCount - a.replyCount)
      .slice(0, 3)
      
    // Log a summary of reply detection
    console.log(`Detected ${Object.keys(messageReplies).length} replied messages in total`)
    console.log(`Top ${mostRepliedMessages.length} most replied messages:`)
    mostRepliedMessages.forEach((item, index) => {
      console.log(`${index + 1}. ${item.message.user}: "${item.message.message.substring(0, 30)}..." - ${item.replyCount} replies`)
    })

    console.log(`Processed ${processedLines} lines, skipped ${skippedLines} lines.`)
    // Calculate response time statistics
    const responseTimesInSeconds: number[] = [];
    const userResponseTimes: Record<string, number[]> = {};
    
    console.log('Starting response time calculations...');
    console.log(`Total messages to process: ${messages.length}`);

    // Define conversation boundary in hours (messages more than this apart are considered new conversations)
    const CONVERSATION_BOUNDARY_HOURS = 12;
    const CONVERSATION_BOUNDARY_SECONDS = CONVERSATION_BOUNDARY_HOURS * 60 * 60;

    // Process messages to calculate response times
    for (let i = 1; i < messages.length; i++) {
      const prevMessage = messages[i - 1];
      const currMessage = messages[i];
      
      // Only calculate if different users (responses, not self-replies)
      if (prevMessage.user !== currMessage.user) {
        try {
          // Use our specialized function to parse dates with times
          const prevDateTime = parseDateTime(prevMessage.date, prevMessage.time);
          const currDateTime = parseDateTime(currMessage.date, currMessage.time);
          
          if (!prevDateTime || !currDateTime) {
            console.warn('Failed to parse dates for response time:', 
              prevMessage.date, prevMessage.time, 'to', 
              currMessage.date, currMessage.time);
            continue;
          }
          
          // Calculate difference in seconds
          const diffSeconds = (currDateTime.getTime() - prevDateTime.getTime()) / 1000;
          
          // Only count as a response if it's within the conversation boundary
          // and is a positive time (to avoid any potential time parsing issues)
          if (diffSeconds > 0 && diffSeconds < CONVERSATION_BOUNDARY_SECONDS) {
            console.log(`Valid response time: ${diffSeconds}s from ${prevMessage.user} to ${currMessage.user}`);
            
            responseTimesInSeconds.push(diffSeconds);
            
            // Track by responder
            if (!userResponseTimes[currMessage.user]) {
              userResponseTimes[currMessage.user] = [];
            }
            userResponseTimes[currMessage.user].push(diffSeconds);
          } else if (diffSeconds >= CONVERSATION_BOUNDARY_SECONDS) {
            console.log(`Skipping - considered a new conversation (gap: ${Math.round(diffSeconds/3600)}h)`);
          } else {
            console.warn(`Invalid response time: ${diffSeconds}s between:`, 
              `${prevMessage.date} ${prevMessage.time} (${prevMessage.user})`,
              `${currMessage.date} ${currMessage.time} (${currMessage.user})`);
          }
        } catch (error) {
          console.error('Error calculating response time:', error);
        }
      }
    }
    
    console.log(`Calculated ${responseTimesInSeconds.length} valid response times`);
    
    // No synthetic data - only use real data
    
    // Calculate average response time
    const averageResponseTime = responseTimesInSeconds.length > 0 
      ? responseTimesInSeconds.reduce((sum, time) => sum + time, 0) / responseTimesInSeconds.length 
      : 0;
      
    console.log(`Average response time: ${averageResponseTime}s`);

    // Calculate average response time per user
    const userAverageResponseTimes: Record<string, number> = {};
    Object.entries(userResponseTimes).forEach(([user, times]) => {
      if (times.length > 0) {
        userAverageResponseTimes[user] = times.reduce((sum, time) => sum + time, 0) / times.length;
      }
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

    // Get fastest responders (users with at least 2 responses, changed from 5 to ensure we get data)
    const fastestResponders = Object.entries(userResponseTimes)
      .filter(([_, times]) => times.length >= 2)
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
      firstMessageDate: firstMessageDate || format(new Date(), 'yyyy-MM-dd'),
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

