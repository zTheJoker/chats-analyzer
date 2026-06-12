// Emoji extraction, laughter detection, word tokenizing, tiny sentiment lexicon.

export const EMOJI_RE =
  /(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}])[\u{1F3FB}-\u{1F3FF}️]*(?:‍(?:\p{Extended_Pictographic})[\u{1F3FB}-\u{1F3FF}️]*)*/gu

// things Extended_Pictographic matches that nobody thinks of as emoji
const EMOJI_BLOCKLIST = new Set(['©', '®', '™', '‼', '⁉', '〰', '〽'])

// strip skin-tone modifiers + variation selectors so 👍🏻/👍🏽/👍 count as one
const TONE_RE = /[\u{1F3FB}-\u{1F3FF}️]/gu

export function extractEmojis(text: string): string[] {
  if (!text) return []
  const out: string[] = []
  for (const m of text.matchAll(EMOJI_RE)) {
    const e = m[0].replace(TONE_RE, '')
    if (e && !EMOJI_BLOCKLIST.has(e)) out.push(e)
  }
  return out
}

// laughter, worldwide: haha/lol/lmao (en), jaja/jsjs (es), kkkk (pt-BR),
// mdr/ptdr (fr), wkwk (id), ххх/ахах (ru), ههه (ar), חחח (he), ㅋㅋ (ko),
// 哈哈 (zh), 555 (th), xD
export const LAUGH_RE =
  /(?:^|[\s.,!?])(?:a*(?:ha){2,}h?a*|lo+l+(?:o+l+)*|lm+f?a+o+|rofl|(?:ja){2,}j?a?|(?:je){2,}je?|(?:js){2,}|k{3,}|(?:wk){2,}w?k?|x[dD]{1,4}|m+d+r+|ptdr|(?:ха){2,}х?|а?х{3,}а*|ههه+|חחח+|ㅋㅋ+|哈哈+|5{3,}|😂|🤣|💀|😹)/iu

export function isLaugh(text: string): boolean {
  return LAUGH_RE.test(text)
}

// export-artifact tokens that must never appear in word stats, any language
export const ARTIFACT_WORDS = new Set(
  'omitted omitida omitido ocultada ocultado oculto omessa omesso omessi omis omise absente weggelaten weggelassen ausgeschlossen attached encrypted multimedia הושמטה הושמט media médias medien mídia'.split(' '),
)

export const HEART_RE = /[❤🧡💛💚💙💜🖤🤍🤎💕💞💓💗💖💘💝♥️🥰😍😘]|❤️/u

const URL_RE = /https?:\/\/\S+/gi
export function countLinks(text: string): number {
  return (text.match(URL_RE) ?? []).length
}

export const STOPWORDS = new Set(
  // english
  (`the a an and or but if then else of to in on at for with from by as is are was were be been being am i you he she it we they me him her us them my your his its our their this that these those there here not no so do does did done have has had having will would can could should shall may might must what when where who whom which why how all any both each few more most other some such only own same than too very just also im ive youre hes shes its were theyre dont doesnt didnt cant couldnt wont wouldnt isnt arent wasnt werent u ur r y n s t m d ll re ve ok okay yeah yes yep nah no lol haha get got go going gonna wanna come came one two like know think see say said well really still even back now out up down over after before about because want need let make made good time day today right oh hey hi hello thanks thank pls please omg btw idk tbh rn af ill hed shed thats whats heres wait actually literally ` +
  // spanish
  `el la los las de del que y a en un una es son está estoy estás por para con sí me te se lo le mi tu su nos les pero más como cuando donde quién porque muy ya o también este esta esto eso esa hay fue ser estar yo tú él ella usted al sin sobre entre hasta desde qué cómo todo nada algo bien vale bueno gracias hola jaja jajaja ahora aquí ahí eso si mucho poco hace tengo tiene vamos voy va eres soy era ` +
  // portuguese
  `o os umas uns uma em num numa não nao você voce vc eu ele ela nós nos eles elas meu minha seu sua isso isto aquilo mas mais já ja então entao aqui ali lá la tudo nada muito pouco bem tá ta tô to está esta estou foi ser estar tem tinha vou vai kkk kkkk obrigado obrigada oi olá ola agora hoje porque pra pro ` +
  // french
  `le les des du au aux et ou est sont être je tu il elle on nous vous ils elles mon ma mes ton ta tes son sa ses ce cette ces ça ca ne pas plus moins très tres avec pour dans sur sous chez quoi qui quand où ou comment pourquoi parce oui non merci salut bonjour alors donc mais aussi bien tout tous toute toutes maintenant aujourd'hui voilà voila ptdr mdr ` +
  // german
  `der die das den dem ein eine einen und oder aber wenn dann ist sind war waren sein bin bist ich du er sie es wir ihr mein dein sein ihre euer nicht kein keine ja nein doch auch noch schon mal nur sehr gut danke hallo jetzt heute hier da was wer wie wo warum weil mit für auf aus bei nach von zu zum zur über unter ` +
  // dutch
  `de het een en of maar als dan is zijn was waren ik jij je hij zij wij jullie mijn jouw zijn haar ons niet geen ja nee ook nog al maar heel erg goed bedankt hallo nu vandaag hier daar wat wie hoe waar waarom omdat met voor op uit bij naar van naar ` +
  // italian
  `il lo gli le di da in con su per tra fra e o ma se che chi cosa come dove quando perché perche non sì si no io tu lui lei noi voi loro mio tuo suo nostro questo quello qui qua lì li là la tutto molto poco bene grazie ciao adesso oggi anche ancora già gia solo ` +
  // hebrew (function words)
  `של את זה אני לא מה יש על עם הוא היא אתה אם כל גם רק אבל כי מי עוד או אז יותר ככה טוב כן אוקיי לי לך לו לה אנחנו אתם הם הן היה היתה להיות אין בסדר תודה שלום עכשיו היום פה שם איפה מתי למה איך בא צריך רוצה אפשר ` +
  // hindi (devanagari + common romanized)
  `है हैं का की के को में और से पर यह वह नहीं तो भी क्या हम तुम आप मैं था थी थे हो हूं कर रहा रही रहे लिए साथ अब आज यहां वहां कब क्यों कैसे कौन हाँ जी अच्छा ठीक धन्यवाद नमस्ते hai hain ka ki ke ko mein aur se par yeh woh nahi nahin toh bhi kya hum tum aap main tha thi the ho hoon kar raha rahi rahe liye saath ab aaj acha accha theek thik haan nahi yaar bhai ` +
  // arabic
  `في من على إلى الى عن مع هذا هذه ذلك أن ان لا نعم ما هو هي أنا انا أنت انت نحن هم كان كانت يكون قد لقد كل بعض غير بين تحت فوق أو او ثم لكن إذا اذا متى أين اين كيف لماذا شكرا مرحبا الآن الان اليوم ` +
  // turkish & indonesian (light)
  `bir bu şu ve veya ama ben sen o biz siz onlar benim senin onun değil degil evet hayır hayir çok cok az iyi teşekkürler tesekkurler merhaba şimdi simdi bugün bugun yang dan di ke dari ini itu saya kamu dia kita mereka tidak ya sudah belum banyak sedikit bagus terima kasih halo sekarang hari`).split(/\s+/),
)

export function tokenizeWords(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(URL_RE, ' ')
    .replace(EMOJI_RE, ' ')
    .replace(/[^\p{L}\p{N}'’]+/gu, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['’]+|['’]+$/g, ''))
    .filter((w) => w.length > 1)
}

export const SWEARS = new Set(
  'damn dammit hell shit shitty crap fuck fucking fucked wtf bullshit bitch ass asshole bastard piss pissed mierda joder cabron cabrón puta pendejo coño merda porra caralho merde putain scheiße scheisse verdammt cazzo stronzo kut חרא'.split(' '),
)

const POS_WORDS = new Set(
  `love loved loving amazing awesome great nice happy congrats congratulations beautiful perfect best excited yay sweet cute win won winning legendary incredible proud fun funny hilarious glad wonderful excellent fantastic enjoy enjoyed blessed grateful thankful`.split(/\s+/),
)
const NEG_WORDS = new Set(
  `hate hated angry sad sorry fight fighting annoyed annoying ugh worst terrible awful mad cry crying upset stressed stress depressed sick tired exhausted broke broken hurt pain painful disappointed disappointing fail failed failing wrong fault problem problems argue arguing embarrassed`.split(/\s+/),
)
const POS_EMOJI = /[😂🤣😍🥰😘😊😁🎉🔥💪🙌❤🧡💛💚💙💜💕💖🥳✨😄😆👏🤝]/u
const NEG_EMOJI = /[😢😭😡🤬👎💔😞😔😩😫😤🙄😒]/u

export function vibeOf(text: string, words: string[]): number {
  let v = 0
  for (const w of words) {
    if (POS_WORDS.has(w)) v++
    else if (NEG_WORDS.has(w)) v--
  }
  if (POS_EMOJI.test(text)) v++
  if (NEG_EMOJI.test(text)) v--
  return Math.max(-2, Math.min(2, v))
}

export const LOVE_RE =
  /\b(love (you|u|ya)|i love|miss (you|u)|love uu+|ily|te amo|te quiero|te extraño|ti amo|mi manchi|je t'aime|tu me manques|ich liebe dich|eu te amo|saudades?( de você)?|ik hou van je|seni seviyorum|aku cinta kamu)\b|אוהבת? אותך|מתגעגעת? אליך|أحبك|प्यार/iu
