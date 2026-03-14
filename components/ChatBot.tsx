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

  const catalog = useMemo(
    () => medicines.map((medicine) => ({
      ...medicine,
      searchText: normalize(`${medicine.brand_name} ${medicine.generic_name} ${medicine.health_issues}`),
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

  const findMedicine = (query: string) => {
    const normalized = normalize(query);
    return catalog.find((medicine) => normalized.includes(normalize(medicine.brand_name)) || normalized.includes(normalize(medicine.generic_name)))
      ?? catalog.find((medicine) => medicine.searchText.includes(normalized));
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
      return `${medicine.brand_name} is commonly used for ${medicine.health_issues}. The active composition is ${medicine.generic_name}.`;
    }

    if (priceIntentPattern.test(question)) {
      return `${medicine.brand_name}: brand ₹${medicine.brand_price}, generic ₹${medicine.generic_price}. Estimated savings are ₹${savings} which is about ${discount}% lower.`;
    }

    return `${medicine.brand_name} contains ${medicine.generic_name}. It is commonly used for ${medicine.health_issues}. Generic option is ₹${medicine.generic_price}.`;
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
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? '';
      setInputText(transcript);
      if (transcript) {
        void generateReply(transcript);
      }
    };
    recognition.onerror = () => {
      setVoiceError(localeCopy.noSpeech);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setVoiceError('');
    setIsListening(true);
    recognition.start();
  };

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
      } finally {
        setUploadBusy(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const shellClass = isDark
    ? 'border border-slate-800 bg-slate-950 text-slate-50'
    : 'border border-slate-200 bg-white text-slate-900';

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-stretch gap-3 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className={`flex h-[78dvh] max-h-[700px] w-full max-w-full flex-col overflow-hidden rounded-[28px] shadow-2xl sm:h-[620px] sm:w-[420px] ${shellClass}`}
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 px-4 py-4 text-white dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-teal-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black tracking-tight">{localeCopy.title}</p>
                  <p className="text-xs text-slate-300">{localeCopy.subtitle}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-xl bg-white/10 p-2 text-slate-200 transition hover:bg-white/15">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950">
              <div className="mb-4 flex flex-wrap gap-2">
                {localeCopy.quick.map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (label.toLowerCase().includes('upload') || label.includes('upload')) {
                        fileInputRef.current?.click();
                        return;
                      }
                      void generateReply(label);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-blue-600 text-white' : message.role === 'system' ? 'border border-teal-200 bg-teal-50 text-teal-800' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'}`}>
                      {message.imagePreview && (
                        <img src={message.imagePreview} alt="Prescription preview" className="mb-3 max-h-32 w-full rounded-xl object-cover" />
                      )}
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className={`mt-2 text-right text-[10px] ${message.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>{message.time}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      {[0, 1, 2].map((index) => (
                        <span key={index} className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${index * 120}ms` }} />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
              {voiceError && <p className="mb-2 text-xs font-medium text-rose-500">{voiceError}</p>}
              <div className="flex items-end gap-2">
                <button
                  onClick={startVoice}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${isListening ? 'border-teal-400 bg-teal-500 text-white shadow-[0_0_0_8px_rgba(20,184,166,0.15)] animate-pulse' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
                  title={localeCopy.listening}
                >
                  <Mic className="h-5 w-5" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-teal-300 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  title="Upload prescription"
                >
                  <Camera className="h-5 w-5" />
                </button>

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
                  }}
                />

                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <textarea
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void generateReply(inputText);
                      }
                    }}
                    placeholder={isListening ? localeCopy.listening : localeCopy.placeholder}
                    className="min-h-[42px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-500"
                    rows={1}
                    disabled={uploadBusy}
                  />
                </div>

                <button
                  onClick={() => void generateReply(inputText)}
                  disabled={!inputText.trim() || uploadBusy}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1"><CircleHelp className="h-3.5 w-3.5" /> Ask about generic substitutions or uses</span>
                <span className="inline-flex items-center gap-1"><TicketPlus className="h-3.5 w-3.5" /> Order support available</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setIsOpen((value) => !value);
          setHasUnread(false);
        }}
        className="relative ml-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_20px_45px_-20px_rgba(37,99,235,0.65)] transition hover:bg-blue-700"
        aria-label="Open chat assistant"
      >
        <ShieldCheck className="h-6 w-6" />
        {hasUnread && !isOpen && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-rose-500" />}
      </button>
    </div>
  );
};

export default ChatBot;
