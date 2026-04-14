import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CircleHelp, Mic, Send, ShieldCheck, TicketPlus, X } from 'lucide-react';
import { Language, Theme } from '../types';
import { extractPrescriptionTextFromImage } from '../services/geminiService';
import { medicines } from '../src/data/medicines';
import { supabase } from '../src/lib/supabase';

interface ChatBotProps {
  theme: Theme;
  language: Language;
  openSignal?: number | null;
  onClose?: () => void;
}

type MessageRole = 'user' | 'assistant' | 'system';
type MessageType = 'text' | 'image' | 'ticket';

interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  time: string;
  imagePreview?: string;
}

interface SupportTicketRecord {
  id: string;
  issue: string;
  createdAt: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onstart?: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const ts = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const copy = {
  en: {
    title: 'Mitra Assistant',
    subtitle: 'Clinical guidance and support',
    welcome: 'Hi, I am Mitra. I can help you understand medicine generics, prices, uses, prescriptions, and order support.',
    placeholder: 'Ask about a medicine or your order',
    listening: 'Listening...',
    quick: ['Generic for Augmentin', 'Use of Crocin 650', 'Order support', 'Upload prescription'],
    unsupported: 'Voice input works in Chrome or Edge.',
    noSpeech: 'I could not hear anything clearly. Please try again.',
    ticketPrompt: 'Please describe the issue with your order. I will create a support ticket for you.',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} has been created. Our support team will review it shortly.`,
    fallback: 'I can help with generic substitutions, medicine uses, price comparisons, and order support. Try asking about a medicine name.',
    analyzing: 'Reviewing your prescription image. Please wait a moment.',
    imageError: 'I could not read the prescription clearly. Please upload a sharper image.',
  },
  hi: {
    title: 'Mitra Assistant',
    subtitle: 'दवा और सहायता मार्गदर्शन',
    welcome: 'नमस्ते, मैं मित्रा हूं। मैं दवा के generic, कीमत, उपयोग, prescription और order support में मदद कर सकता हूं।',
    placeholder: 'दवा या order के बारे में पूछें',
    listening: 'सुन रहा हूं...',
    quick: ['Augmentin का generic', 'Crocin 650 किस काम आती है', 'Order support', 'Prescription upload करें'],
    unsupported: 'Voice input Chrome या Edge में बेहतर काम करता है।',
    noSpeech: 'आवाज़ साफ़ नहीं मिली। कृपया फिर से बोलें।',
    ticketPrompt: 'कृपया अपने order issue का विवरण बताइए। मैं support ticket बना दूंगा।',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} बन गया है। हमारी टीम जल्द संपर्क करेगी।`,
    fallback: 'मैं generic substitution, medicine uses, price comparison और order support में मदद कर सकता हूं। किसी medicine का नाम पूछिए।',
    analyzing: 'Prescription image की समीक्षा की जा रही है। कृपया थोड़ा प्रतीक्षा करें।',
    imageError: 'Prescription image साफ़ नहीं पढ़ी जा सकी। कृपया clearer photo upload करें।',
  },
  bn: {
    title: 'Mitra Assistant',
    subtitle: 'ওষুধ ও সহায়তা নির্দেশনা',
    welcome: 'হাই, আমি মিত্রা। ওষুধের generic, দাম, ব্যবহার, prescription এবং order support বুঝতে সাহায্য করতে পারি।',
    placeholder: 'কোন ওষুধ বা order সম্পর্কে জিজ্ঞেস করুন',
    listening: 'শুনছি...',
    quick: ['Augmentin-এর generic', 'Crocin 650 কী কাজে লাগে', 'Order support', 'Prescription upload করুন'],
    unsupported: 'Voice input Chrome বা Edge-এ কাজ করে।',
    noSpeech: 'কিছু স্পষ্ট শোনা যায়নি। আবার চেষ্টা করুন।',
    ticketPrompt: 'অনুগ্রহ করে আপনার order সমস্যাটি জানান। আমি support ticket তৈরি করব।',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} তৈরি হয়েছে। আমাদের support team শিগগিরই দেখবে।`,
    fallback: 'আমি generic substitution, medicine uses, price comparison এবং order support-এ সাহায্য করতে পারি। কোনো medicine-এর নাম জিজ্ঞেস করুন।',
    analyzing: 'আপনার prescription image পর্যালোচনা করা হচ্ছে। অনুগ্রহ করে একটু অপেক্ষা করুন।',
    imageError: 'Prescription image পরিষ্কারভাবে পড়া যায়নি। অনুগ্রহ করে আরও পরিষ্কার ছবি আপলোড করুন।',
  },
  mr: {
    title: 'Mitra Assistant',
    subtitle: 'औषध आणि मदत मार्गदर्शन',
    welcome: 'नमस्कार, मी मित्रा आहे. औषधांचे generic, किंमत, वापर, prescription आणि order support समजून घेण्यास मदत करू शकतो.',
    placeholder: 'औषध किंवा order बद्दल विचारा',
    listening: 'ऐकत आहे...',
    quick: ['Augmentin चा generic', 'Crocin 650 कशासाठी वापरतात', 'Order support', 'Prescription upload करा'],
    unsupported: 'Voice input Chrome किंवा Edge मध्ये चालते.',
    noSpeech: 'काही स्पष्ट ऐकू आले नाही. कृपया पुन्हा बोला.',
    ticketPrompt: 'कृपया तुमच्या order समस्येचे वर्णन करा. मी support ticket तयार करतो.',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} तयार झाला आहे. आमची support team लवकरच पाहील.`,
    fallback: 'मी generic substitution, medicine uses, price comparison आणि order support मध्ये मदत करू शकतो. औषधाचे नाव विचारा.',
    analyzing: 'तुमचे prescription image तपासले जात आहे. कृपया थोडा वेळ द्या.',
    imageError: 'Prescription image स्पष्ट वाचता आली नाही. कृपया अधिक स्पष्ट फोटो अपलोड करा.',
  },
  te: {
    title: 'Mitra Assistant',
    subtitle: 'మందులు మరియు సహాయం మార్గదర్శనం',
    welcome: 'హాయ్, నేను మిత్రా. మందుల generic, ధర, ఉపయోగం, prescription మరియు order support అర్థం చేసుకోవడంలో సహాయం చేస్తాను.',
    placeholder: 'ఒక మందు లేదా మీ order గురించి అడగండి',
    listening: 'వింటున్నాను...',
    quick: ['Augmentin generic', 'Crocin 650 ఉపయోగం', 'Order support', 'Prescription upload చేయండి'],
    unsupported: 'Voice input Chrome లేదా Edge లో పనిచేస్తుంది.',
    noSpeech: 'స్పష్టంగా వినబడలేదు. మళ్లీ ప్రయత్నించండి.',
    ticketPrompt: 'దయచేసి మీ order సమస్యను వివరించండి. నేను support ticket తయారు చేస్తాను.',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} రూపొందింది. మా support team త్వరలో చూస్తుంది.`,
    fallback: 'నేను generic substitution, medicine uses, price comparison మరియు order support లో సహాయం చేయగలను. మందు పేరు అడగండి.',
    analyzing: 'మీ prescription image ను పరిశీలిస్తున్నాం. దయచేసి కొంచెం వేచివుండండి.',
    imageError: 'Prescription image స్పష్టంగా చదవలేకపోయాం. మరింత స్పష్టమైన ఫోటోను upload చేయండి.',
  },
  ta: {
    title: 'Mitra Assistant',
    subtitle: 'மருந்து மற்றும் உதவி வழிகாட்டுதல்',
    welcome: 'வணக்கம், நான் மித்ரா. மருந்து generic, விலை, பயன்பாடு, prescription மற்றும் order support புரிய உதவுவேன்.',
    placeholder: 'ஒரு மருந்து அல்லது உங்கள் order பற்றி கேளுங்கள்',
    listening: 'கேட்கிறேன்...',
    quick: ['Augmentin generic', 'Crocin 650 பயன்பாடு', 'Order support', 'Prescription upload செய்யவும்'],
    unsupported: 'Voice input Chrome அல்லது Edge-இல் வேலை செய்கிறது.',
    noSpeech: 'தெளிவாக எதுவும் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    ticketPrompt: 'தயவுசெய்து உங்கள் order பிரச்சினையை விவரிக்கவும். நான் support ticket உருவாக்குகிறேன்.',
    ticketCreated: (ticketId: string) => `Support ticket ${ticketId} உருவாக்கப்பட்டது. எங்கள் support team விரைவில் பார்க்கும்.`,
    fallback: 'நான் generic substitution, medicine uses, price comparison மற்றும் order support-இல் உதவ முடியும். ஒரு மருந்தின் பெயரை கேளுங்கள்.',
    analyzing: 'உங்கள் prescription image பரிசீலிக்கப்படுகிறது. சிறிது நேரம் காத்திருக்கவும்.',
    imageError: 'Prescription image தெளிவாக படிக்க முடியவில்லை. மேலும் தெளிவான photo upload செய்யவும்.',
  },
} as const;

const supportIntentPattern = /(issue with my order|order issue|order problem|problem with my order|support ticket|मेरे ऑर्डर में समस्या|ऑर्डर में दिक्कत|ऑर्डर issue)/i;
const genericIntentPattern = /(generic|substitute|alternative|salt|equivalent|generic for|का generic|कौन सा generic)/i;
const useIntentPattern = /(use|used for|works for|indication|kis kam|किस काम|किस लिए|use of|काम आती है)/i;
const priceIntentPattern = /(price|cost|kitne ka|कितने का|rate|savings)/i;
const medicineQueryStopWords = new Set([
  'about',
  'any',
  'can',
  'for',
  'give',
  'hello',
  'help',
  'i',
  'is',
  'know',
  'medicine',
  'me',
  'my',
  'of',
  'on',
  'please',
  'support',
  'tell',
  'the',
  'to',
  'want',
  'what',
]);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+ ]/gi, ' ').replace(/\s+/g, ' ').trim();

const tokenizeQuery = (value: string): string[] =>
  normalize(value)
    .split(' ')
    .filter((token) => token.length > 1 && !medicineQueryStopWords.has(token));

const levenshteinDistance = (left: string, right: string): number => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let prevDiagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const temp = row[j];
      const substitutionCost = left[i - 1] === right[j - 1] ? 0 : 1;
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prevDiagonal + substitutionCost
      );
      prevDiagonal = temp;
    }
  }

  return row[right.length];
};

const tokenSimilarity = (queryToken: string, candidateToken: string): number => {
  if (!queryToken || !candidateToken) return 0;
  if (queryToken === candidateToken) return 1;

  const minLength = Math.min(queryToken.length, candidateToken.length);
  if (minLength >= 4 && (queryToken.startsWith(candidateToken) || candidateToken.startsWith(queryToken))) {
    return 0.9;
  }

  if (queryToken.length >= 5 && candidateToken.length >= 5 && (queryToken.includes(candidateToken) || candidateToken.includes(queryToken))) {
    return 0.84;
  }

  const distance = levenshteinDistance(queryToken, candidateToken);
  const maxLength = Math.max(queryToken.length, candidateToken.length);
  const similarity = 1 - distance / maxLength;
  return similarity >= 0.5 ? similarity : 0;
};

interface MedicineMatch {
  medicine: (typeof medicines)[number] & { searchText: string; tokens: string[] };
  score: number;
  isFuzzy: boolean;
};

const getSpeechLocale = (language: Language): string => {
  switch (language) {
    case 'hi':
      return 'hi-IN';
    case 'bn':
      return 'bn-IN';
    case 'mr':
      return 'mr-IN';
    case 'te':
      return 'te-IN';
    case 'ta':
      return 'ta-IN';
    default:
      return 'en-IN';
  }
};

const ChatBot: React.FC<ChatBotProps> = ({ theme, language, openSignal, onClose }) => {
  const isDark = theme === 'dark';
  const localeCopy = copy[language];
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [awaitingTicketDetails, setAwaitingTicketDetails] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const lastOpenSignalRef = useRef<number | null>(null);

  const catalog = useMemo(
    () => medicines.map((medicine) => ({
      ...medicine,
      searchText: normalize(`${medicine.brand_name} ${medicine.generic_name} ${medicine.uses || medicine.health_issues || ''}`),
      tokens: Array.from(new Set(tokenizeQuery(`${medicine.brand_name} ${medicine.generic_name}`))),
    })),
    []
  );

  useEffect(() => {
    setMessages([{ id: uid(), role: 'assistant', type: 'text', content: localeCopy.welcome, time: ts() }]);
    setAwaitingTicketDetails(false);
    setInputText('');
    setVoiceError('');
  }, [localeCopy.welcome]);

  useEffect(() => {
    if (openSignal == null || openSignal === lastOpenSignalRef.current) {
      return;
    }

    lastOpenSignalRef.current = openSignal;
      setIsOpen(true);
      setHasUnread(false);
  }, [openSignal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, uploadBusy]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const pushMessage = (message: Omit<Message, 'id' | 'time'>) => {
    const next = { ...message, id: uid(), time: ts() };
    setMessages((prev) => [...prev, next]);
    if (!isOpen && message.role !== 'user') {
      setHasUnread(true);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setHasUnread(false);
    onClose?.();
  };

  const rankMedicineMatches = (query: string): MedicineMatch[] => {
    const normalized = normalize(query);
    const queryTokens = tokenizeQuery(query);

    if (!normalized || queryTokens.length === 0) {
      return [];
    }

    const ranked = catalog
      .map((medicine) => {
        let score = 0;
        let matchedTokens = 0;

        if (medicine.searchText.includes(normalized) && normalized.length >= 4) {
          score = Math.max(score, 0.98);
        }

        const tokenScores = queryTokens.map((queryToken) => {
          const bestTokenScore = medicine.tokens.reduce((best, token) => Math.max(best, tokenSimilarity(queryToken, token)), 0);
          if (bestTokenScore > 0) {
            matchedTokens += 1;
          }
          return bestTokenScore;
        });

        const tokenAverage = tokenScores.reduce((sum, value) => sum + value, 0) / queryTokens.length;
        score = Math.max(score, tokenAverage);

        const coverage = matchedTokens / queryTokens.length;
        if (coverage >= 0.75 && score >= 0.55) {
          score += 0.08;
        }
        if (coverage === 1 && score >= 0.6) {
          score += 0.05;
        }

        return {
          medicine,
          score: Math.min(1, score),
          isFuzzy: tokenAverage < 0.95,
        };
      })
      .sort((left, right) => right.score - left.score);

    return ranked;
  };

  const findMedicine = (query: string): MedicineMatch | null => {
    const queryTokens = tokenizeQuery(query);
    const ranked = rankMedicineMatches(query);
    if (!ranked.length) return null;

    const strictThreshold = queryTokens.length <= 1 ? 0.74 : 0.64;
    return ranked[0].score >= strictThreshold ? ranked[0] : null;
  };

  const findClosestMedicine = (query: string): MedicineMatch | null => {
    const ranked = rankMedicineMatches(query);
    if (!ranked.length) return null;
    return ranked[0].score >= 0.5 ? ranked[0] : null;
  };

  const createSupportTicket = async (issue: string): Promise<SupportTicketRecord> => {
    const ticketId = `OP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const { data } = await supabase.auth.getSession();
    const userEmail = data.session?.user?.email ?? 'guest@ourpharma.local';

    const payload = {
      user_email: userEmail,
      issue,
      chat_history: JSON.stringify(messages.map((message) => ({ role: message.role, content: message.content, time: message.time }))),
      status: 'open',
      created_at: createdAt,
    };

    const { error } = await supabase.from('tickets').insert(payload);
    if (error) {
      const stored = JSON.parse(window.localStorage.getItem('ourpharma_support_tickets') ?? '[]') as SupportTicketRecord[];
      window.localStorage.setItem('ourpharma_support_tickets', JSON.stringify([{ id: ticketId, issue, createdAt }, ...stored].slice(0, 50)));
    }

    return { id: ticketId, issue, createdAt };
  };

  const buildMedicineReply = (question: string): string | null => {
    const match = findMedicine(question) ?? findClosestMedicine(question);
    if (!match) return null;

    const medicine = match.medicine;
    const assumptionPrefix = match.isFuzzy ? `Assuming you meant ${medicine.brand_name}: ` : '';

    const savings = Math.max(0, medicine.brand_price - medicine.generic_price);
    const discount = medicine.brand_price > 0 ? Math.round((savings / medicine.brand_price) * 100) : 0;

    if (genericIntentPattern.test(question)) {
      return `${assumptionPrefix}${medicine.brand_name} uses the generic composition ${medicine.generic_name}. Generic price is ₹${medicine.generic_price}, compared with brand price ₹${medicine.brand_price}.`;
    }

    if (useIntentPattern.test(question)) {
      return `${assumptionPrefix}${medicine.brand_name} is commonly used for ${medicine.uses || medicine.health_issues || 'its listed indications'}. The active composition is ${medicine.generic_name}.`;
    }

    if (priceIntentPattern.test(question)) {
      return `${assumptionPrefix}${medicine.brand_name}: brand ₹${medicine.brand_price}, generic ₹${medicine.generic_price}. Estimated savings are ₹${savings} which is about ${discount}% lower.`;
    }

    return `${assumptionPrefix}${medicine.brand_name} contains ${medicine.generic_name}. It is commonly used for ${medicine.uses || medicine.health_issues || 'its listed indications'}. Generic option is ₹${medicine.generic_price}.`;
  };

  const generateReply = async (message: string): Promise<void> => {
    const trimmed = message.trim();
    if (!trimmed) return;

    pushMessage({ role: 'user', type: 'text', content: trimmed });
    setInputText('');
    setIsTyping(true);

    try {
      if (awaitingTicketDetails) {
        const ticket = await createSupportTicket(trimmed);
        pushMessage({ role: 'system', type: 'ticket', content: localeCopy.ticketCreated(ticket.id) });
        setAwaitingTicketDetails(false);
        return;
      }

      if (supportIntentPattern.test(trimmed)) {
        pushMessage({ role: 'assistant', type: 'text', content: localeCopy.ticketPrompt });
        setAwaitingTicketDetails(true);
        return;
      }

      const medicineReply = buildMedicineReply(trimmed);
      if (medicineReply) {
        pushMessage({ role: 'assistant', type: 'text', content: medicineReply });
        return;
      }

      if (/prescription|rx|upload/i.test(trimmed)) {
        pushMessage({ role: 'assistant', type: 'text', content: 'You can upload a prescription image using the camera button inside this chat window.' });
        return;
      }

      pushMessage({ role: 'assistant', type: 'text', content: localeCopy.fallback });
    } finally {
      setIsTyping(false);
    }
  };

  // Web Speech API voice input logic
  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError(localeCopy.unsupported);
      return;
    }

    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = getSpeechLocale(language);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError('');
      setIsRecording(true);
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript?.trim() || '';

      if (transcript) {
        setInputText(transcript);
        setVoiceError('');
      } else {
        setVoiceError(localeCopy.noSpeech);
      }

      setIsRecording(false);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      const errorName = event?.error || 'unknown';

      if (errorName === 'not-allowed' || errorName === 'service-not-allowed') {
        setVoiceError('Microphone permission is blocked. Allow microphone access and try again.');
      } else if (errorName === 'audio-capture') {
        setVoiceError('No microphone was detected. Check your device microphone and try again.');
      } else if (errorName === 'no-speech') {
        setVoiceError(localeCopy.noSpeech);
      } else {
        setVoiceError(`Voice input failed (${errorName}). Please try again.`);
      }

      setIsRecording(false);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setVoiceError('Voice input could not start in this browser. Please try Chrome on desktop.');
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };
  // ...existing code...
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const dataUrl = typeof event.target?.result === 'string' ? event.target.result : '';
      if (!dataUrl) return;

      const base64 = dataUrl.split(',')[1];
      if (!base64) return;

      pushMessage({ role: 'user', type: 'image', content: 'Prescription uploaded for review.', imagePreview: dataUrl });
      pushMessage({ role: 'assistant', type: 'text', content: localeCopy.analyzing });
      setUploadBusy(true);
      try {
        const extracted = await extractPrescriptionTextFromImage(base64, file.type || 'image/jpeg');
        pushMessage({ role: 'assistant', type: 'text', content: `Prescription notes extracted:\n${extracted}` });
      } catch {
        pushMessage({ role: 'assistant', type: 'text', content: localeCopy.imageError });
      }
      setUploadBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await generateReply(inputText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeChat}
          />

          <motion.section
            className={`fixed bottom-4 right-4 z-[70] flex h-[min(84vh,760px)] w-[min(92vw,420px)] flex-col overflow-hidden rounded-[32px] border shadow-[0_30px_90px_-30px_rgba(15,118,110,0.45)] ${isDark ? 'border-white/10 bg-slate-950 text-slate-50' : 'border-emerald-100 bg-white text-slate-900'}`}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
          >
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-emerald-50/60'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-emerald-600">{localeCopy.title}</p>
                <h3 className="mt-1 text-lg font-black tracking-tight">{localeCopy.subtitle}</h3>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-105 ${isDark ? 'bg-white/10 text-slate-100' : 'bg-white text-slate-600 shadow-sm'}`}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {localeCopy.quick.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => void generateReply(item)}
                    className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${isDark ? 'bg-white/8 text-slate-200 hover:bg-white/12' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'bg-emerald-600 text-white' : message.type === 'ticket' ? 'border border-emerald-200 bg-emerald-50 text-emerald-900' : isDark ? 'bg-white/8 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
                      {message.imagePreview && (
                        <img src={message.imagePreview} alt="Uploaded prescription" className="mb-3 max-h-40 w-full rounded-2xl object-cover" />
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>{message.time}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-3xl px-4 py-3 text-sm ${isDark ? 'bg-white/8 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                      {localeCopy.listening}
                    </div>
                  </div>
                )}

                {uploadBusy && (
                  <div className="flex justify-start">
                    <div className={`rounded-3xl px-4 py-3 text-sm ${isDark ? 'bg-white/8 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                      {localeCopy.analyzing}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className={`border-t px-4 py-3 ${isDark ? 'border-white/10 bg-slate-950' : 'border-emerald-100 bg-white'}`}>
              {voiceError && <p className="mb-2 text-[11px] font-semibold text-amber-500">{voiceError}</p>}
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageFile(file);
                    }
                    event.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105 ${isDark ? 'bg-white/10 text-slate-100' : 'bg-emerald-50 text-emerald-700'}`}
                  aria-label="Upload prescription"
                >
                  <Camera size={18} />
                </button>

                <button
                  type="button"
                  onClick={isRecording ? stopVoice : startVoice}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105 ${isRecording ? 'bg-rose-500 text-white' : isDark ? 'bg-white/10 text-slate-100' : 'bg-emerald-50 text-emerald-700'}`}
                  aria-label="Voice input"
                >
                  <Mic size={18} />
                </button>

                <div className="flex-1">
                  <input
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void generateReply(inputText);
                      }
                    }}
                    placeholder={isRecording ? localeCopy.listening : localeCopy.placeholder}
                    className={`min-h-11 w-full rounded-2xl px-4 py-3 text-sm outline-none transition ${isDark ? 'border border-white/10 bg-white/5 text-slate-50 placeholder:text-slate-500' : 'border border-emerald-100 bg-slate-50 text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>

                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-700 hover:scale-105 disabled:opacity-50"
                  disabled={!inputText.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;
