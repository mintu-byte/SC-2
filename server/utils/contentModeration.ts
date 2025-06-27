// Enhanced content moderation with multilingual support
const badWordsMultilingual = {
  english: [
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'piss',
    'hell', 'stupid', 'idiot', 'moron', 'retard', 'gay', 'fag', 'nigger',
    'whore', 'slut', 'pussy', 'dick', 'cock', 'penis', 'vagina', 'sex'
  ],
  spanish: [
    'mierda', 'joder', 'puta', 'cabrón', 'pendejo', 'idiota', 'estúpido',
    'coño', 'carajo', 'hijo de puta', 'maricón', 'gilipollas'
  ],
  french: [
    'merde', 'putain', 'connard', 'salope', 'con', 'bite', 'chatte',
    'enculé', 'fils de pute', 'bordel', 'crétin', 'imbécile'
  ],
  german: [
    'scheiße', 'fick', 'arschloch', 'hurensohn', 'fotze', 'schwanz',
    'muschi', 'blödmann', 'idiot', 'dummkopf', 'verdammt'
  ],
  italian: [
    'merda', 'cazzo', 'figa', 'stronzo', 'puttana', 'bastardo',
    'idiota', 'coglione', 'figlio di puttana', 'vaffanculo'
  ],
  portuguese: [
    'merda', 'caralho', 'puta', 'filho da puta', 'idiota', 'burro',
    'estúpido', 'babaca', 'otário', 'desgraçado'
  ],
  hindi: [
    'बकवास', 'गधा', 'कुत्ता', 'रंडी', 'भोसड़ी', 'मादरचोद', 'भेनचोद',
    'गांडू', 'चूतिया', 'हरामी', 'साला', 'कमीना'
  ],
  arabic: [
    'خرا', 'كلب', 'حمار', 'غبي', 'أحمق', 'لعين', 'ابن كلب',
    'قحبة', 'عاهرة', 'منيك', 'زبي', 'كس'
  ],
  chinese: [
    '操', '妈的', '傻逼', '白痴', '混蛋', '王八蛋', '狗屎',
    '他妈的', '草泥马', '卧槽', '靠', '艹'
  ],
  japanese: [
    'くそ', 'ばか', 'あほ', 'しね', 'きちく', 'やろう',
    'ちくしょう', 'ふざけるな', 'うざい', 'むかつく'
  ],
  korean: [
    '씨발', '개새끼', '병신', '바보', '멍청이', '미친',
    '죽어', '꺼져', '닥쳐', '시발', '좆'
  ],
  russian: [
    'блядь', 'сука', 'пизда', 'хуй', 'говно', 'дерьмо',
    'идиот', 'дурак', 'мудак', 'козёл', 'сволочь'
  ]
};

// Contact sharing patterns
const contactPatterns = {
  phone: [
    /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\d{10,15}\b/g
  ],
  email: [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    /\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}\b/g
  ],
  socialMedia: [
    /@[a-zA-Z0-9._]+/g,
    /instagram\.com\/[a-zA-Z0-9._]+/gi,
    /facebook\.com\/[a-zA-Z0-9._]+/gi,
    /twitter\.com\/[a-zA-Z0-9._]+/gi,
    /tiktok\.com\/@[a-zA-Z0-9._]+/gi,
    /snapchat\.com\/add\/[a-zA-Z0-9._]+/gi,
    /t\.me\/[a-zA-Z0-9._]+/gi,
    /wa\.me\/[0-9]+/gi,
    /whatsapp\.com\/[a-zA-Z0-9._]+/gi
  ],
  socialKeywords: [
    'whatsapp', 'telegram', 'instagram', 'facebook', 'snapchat', 'discord',
    'tiktok', 'twitter', 'linkedin', 'skype', 'viber', 'wechat', 'line',
    'kik', 'signal', 'wickr', 'threema', 'wire', 'element', 'riot',
    'watsapp', 'insta', 'fb', 'snap', 'disc', 'tele', 'gram'
  ],
  contactRequests: [
    'dm me', 'message me', 'text me', 'call me', 'add me', 'contact me',
    'reach out', 'get in touch', 'my number', 'my email', 'my insta',
    'my snap', 'my whatsapp', 'my telegram', 'my discord', 'my skype',
    'hit me up', 'ping me', 'buzz me', 'drop me', 'shoot me',
    'send me', 'give me your', 'share your', 'exchange numbers',
    'exchange contacts', 'personal message', 'private message',
    'outside chat', 'off platform', 'meet offline', 'real life'
  ]
};

// Normalize text for better detection
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s@.]/g, ' ') // Keep alphanumeric, spaces, @ and .
    .replace(/\s+/g, ' ')
    .trim();
};

// Check for bad words in multiple languages
const containsBadWords = (text: string): { found: boolean; language: string; words: string[] } => {
  const normalizedText = normalizeText(text);
  const foundWords: string[] = [];
  let detectedLanguage = '';

  for (const [language, words] of Object.entries(badWordsMultilingual)) {
    for (const word of words) {
      const normalizedWord = normalizeText(word);
      if (normalizedText.includes(normalizedWord)) {
        foundWords.push(word);
        detectedLanguage = language;
      }
    }
  }

  return {
    found: foundWords.length > 0,
    language: detectedLanguage,
    words: foundWords
  };
};

// Check for contact sharing
const containsContactInfo = (text: string): { found: boolean; types: string[]; matches: string[] } => {
  const types: string[] = [];
  const matches: string[] = [];

  // Check phone patterns
  for (const pattern of contactPatterns.phone) {
    const phoneMatches = text.match(pattern);
    if (phoneMatches) {
      types.push('phone');
      matches.push(...phoneMatches);
    }
  }

  // Check email patterns
  for (const pattern of contactPatterns.email) {
    const emailMatches = text.match(pattern);
    if (emailMatches) {
      types.push('email');
      matches.push(...emailMatches);
    }
  }

  // Check social media patterns
  for (const pattern of contactPatterns.socialMedia) {
    const socialMatches = text.match(pattern);
    if (socialMatches) {
      types.push('social_media');
      matches.push(...socialMatches);
    }
  }

  // Check social media keywords
  const normalizedText = normalizeText(text);
  for (const keyword of contactPatterns.socialKeywords) {
    if (normalizedText.includes(keyword)) {
      types.push('social_keyword');
      matches.push(keyword);
    }
  }

  // Check contact request phrases
  for (const phrase of contactPatterns.contactRequests) {
    if (normalizedText.includes(phrase)) {
      types.push('contact_request');
      matches.push(phrase);
    }
  }

  return {
    found: types.length > 0,
    types: [...new Set(types)], // Remove duplicates
    matches: [...new Set(matches)]
  };
};

// Main moderation function
export const moderateMessage = (message: string): { 
  isClean: boolean; 
  cleanMessage: string; 
  violations: string[];
  details: any;
} => {
  const violations: string[] = [];
  let cleanMessage = message;
  const details: any = {};

  // Check for bad words
  const badWordsCheck = containsBadWords(message);
  if (badWordsCheck.found) {
    violations.push('inappropriate_language');
    details.badWords = {
      language: badWordsCheck.language,
      words: badWordsCheck.words
    };
    
    // Replace bad words with asterisks
    for (const word of badWordsCheck.words) {
      const regex = new RegExp(word, 'gi');
      cleanMessage = cleanMessage.replace(regex, '*'.repeat(word.length));
    }
  }

  // Check for contact sharing
  const contactCheck = containsContactInfo(message);
  if (contactCheck.found) {
    violations.push('contact_sharing');
    details.contactSharing = {
      types: contactCheck.types,
      matches: contactCheck.matches
    };

    // Replace contact info with placeholders
    for (const match of contactCheck.matches) {
      cleanMessage = cleanMessage.replace(new RegExp(match, 'gi'), '[CONTACT REMOVED]');
    }

    // Replace patterns
    for (const pattern of contactPatterns.phone) {
      cleanMessage = cleanMessage.replace(pattern, '[PHONE REMOVED]');
    }
    for (const pattern of contactPatterns.email) {
      cleanMessage = cleanMessage.replace(pattern, '[EMAIL REMOVED]');
    }
    for (const pattern of contactPatterns.socialMedia) {
      cleanMessage = cleanMessage.replace(pattern, '[SOCIAL REMOVED]');
    }
  }

  // Additional spam detection
  const spamPatterns = [
    /(.)\1{4,}/g, // Repeated characters (5 or more)
    /[A-Z]{5,}/g, // All caps (5 or more characters)
    /(.{1,3})\1{3,}/g // Repeated patterns
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(message)) {
      violations.push('spam_pattern');
      break;
    }
  }

  return {
    isClean: violations.length === 0,
    cleanMessage: cleanMessage.trim(),
    violations: [...new Set(violations)], // Remove duplicates
    details
  };
};

// Generate user-friendly violation messages
export const generateViolationMessage = (violations: string[], details: any): string => {
  const messages: string[] = [];

  if (violations.includes('inappropriate_language')) {
    const language = details.badWords?.language || 'unknown';
    messages.push(`Inappropriate language detected (${language})`);
  }

  if (violations.includes('contact_sharing')) {
    const types = details.contactSharing?.types || [];
    if (types.includes('phone')) messages.push('Phone number sharing is not allowed');
    if (types.includes('email')) messages.push('Email sharing is not allowed');
    if (types.includes('social_media') || types.includes('social_keyword')) {
      messages.push('Social media sharing is not allowed');
    }
    if (types.includes('contact_request')) {
      messages.push('Requesting personal contact is not allowed');
    }
  }

  if (violations.includes('spam_pattern')) {
    messages.push('Spam-like content detected');
  }

  return messages.join('. ');
};