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
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
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
    welcome: 'Hello. I can help you understand medicine generics, prices, uses, prescriptions, and order support.',
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
    welcome: 'नमस्ते। मैं दवा के generic, कीमत, उपयोग, prescription और order support में मदद कर सकता हूं।',
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
} as const;

const supportIntentPattern = /(issue with my order|order issue|order problem|problem with my order|support ticket|मेरे ऑर्डर में समस्या|ऑर्डर में दिक्कत|ऑर्डर issue)/i;
const genericIntentPattern = /(generic|substitute|alternative|salt|equivalent|generic for|का generic|कौन सा generic)/i;
const useIntentPattern = /(use|used for|works for|indication|kis kam|किस काम|किस लिए|use of|काम आती है)/i;
const priceIntentPattern = /(price|cost|kitne ka|कितने का|rate|savings)/i;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+ ]/gi, ' ').replace(/\s+/g, ' ').trim();

const ChatBot: React.FC<ChatBotProps> = ({ theme, language }) => {
  const isDark = theme === 'dark';
  const localeCopy = copy[language === 'hi' ? 'hi' : 'en'];
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

  const catalog = useMemo(
    () => medicines.map((medicine) => ({
      ...medicine,
      searchText: normalize(`${medicine.brand_name} ${medicine.generic_name} ${medicine.uses || medicine.health_issues || ''}`),
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

  // Fuzzy/lenient medicine matching logic
  const findMedicine = (query: string) => {
    const normalized = normalize(query);
    // Fuzzy: match if input is included anywhere in brand or generic name
    return (
      catalog.find(
        (medicine) =>
          medicine.brand_name.toLowerCase().includes(normalized) ||
          medicine.generic_name.toLowerCase().includes(normalized)
      ) ||
      // fallback: searchText includes input (for uses/indications)
      catalog.find((medicine) => medicine.searchText.includes(normalized))
    );
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
    const medicine = findMedicine(question);
    if (!medicine) return null;

    const savings = Math.max(0, medicine.brand_price - medicine.generic_price);
    const discount = medicine.brand_price > 0 ? Math.round((savings / medicine.brand_price) * 100) : 0;

    if (genericIntentPattern.test(question)) {
      return `${medicine.brand_name} uses the generic composition ${medicine.generic_name}. Generic price is ₹${medicine.generic_price}, compared with brand price ₹${medicine.brand_price}.`;
    }

    if (useIntentPattern.test(question)) {
      return `${medicine.brand_name} is commonly used for ${medicine.uses || medicine.health_issues || 'its listed indications'}. The active composition is ${medicine.generic_name}.`;
    }

    if (priceIntentPattern.test(question)) {
      return `${medicine.brand_name}: brand ₹${medicine.brand_price}, generic ₹${medicine.generic_price}. Estimated savings are ₹${savings} which is about ${discount}% lower.`;
    }

    return `${medicine.brand_name} contains ${medicine.generic_name}. It is commonly used for ${medicine.uses || medicine.health_issues || 'its listed indications'}. Generic option is ₹${medicine.generic_price}.`;
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
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      // Take the first final result
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setVoiceError(localeCopy.noSpeech);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setVoiceError('');
    setIsRecording(true);
    recognition.start();
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

  // Main return for ChatBot component
  return (
    <div>
      {/* ...existing UI code, including AnimatePresence, quick buttons, chat messages, input, etc. ... */}
    </div>
  );
};

export default ChatBot;
