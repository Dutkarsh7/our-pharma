import React, { useEffect, useRef, useState } from 'react';
import { Language, Theme } from '../types';
import { extractPrescriptionTextFromImage } from '../services/geminiService';
import { supabase } from '../src/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  type: 'text' | 'image-result' | 'ticket' | 'callback-confirm';
  imagePreview?: string;
  ticketId?: string;
  time: string;
}

interface CallbackForm {
  name: string;
  phone: string;
  issue: string;
}

interface TicketForm {
  issue: string;
}

interface ChatBotProps {
  theme: Theme;
  language: Language;
}

const uid = () => Math.random().toString(36).slice(2, 11);
const ts = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const random4Digit = () => String(Math.floor(1000 + Math.random() * 9000));

const COPY = {
  en: {
    title: 'OurPharma Assistant',
    subtitle: 'Mitra Assistant · Usually instant',
    welcome:
      "Hi, I'm Mitra Assistant. I can help with medicine info, prescription questions, order issues, and pharmacist callbacks.",
    placeholder: 'Ask anything...',
    listening: 'Listening...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'Could not extract text from this image. Please upload a clearer photo.',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
  hi: {
    title: 'OurPharma सहायक',
    subtitle: 'Mitra Assistant · तुरंत जवाब',
    welcome: 'नमस्ते! मैं Mitra Assistant हूं। दवा, प्रिस्क्रिप्शन, ऑर्डर और कॉलबैक में मदद कर सकता हूं।',
    placeholder: 'कुछ पूछें...',
    listening: 'सुन रहा हूं...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'Image से text extract नहीं हो पाया। कृपया clearer photo upload करें।',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
  bn: {
    title: 'OurPharma Assistant',
    subtitle: 'Mitra Assistant · তাৎক্ষণিক সাড়া',
    welcome: 'আমি Mitra Assistant. Medicine info, prescription, order help এবং callback-এ সাহায্য করতে পারি।',
    placeholder: 'প্রশ্ন করুন...',
    listening: 'শুনছি...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'Image থেকে text extract করা যায়নি। পরিষ্কার ছবি দিন।',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
  mr: {
    title: 'OurPharma Assistant',
    subtitle: 'Mitra Assistant · त्वरित प्रतिसाद',
    welcome: 'मी Mitra Assistant आहे. औषध माहिती, प्रिस्क्रिप्शन, ऑर्डर आणि कॉलबॅकमध्ये मदत करेन.',
    placeholder: 'प्रश्न विचारा...',
    listening: 'ऐकत आहे...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'Image मधून मजकूर काढता आला नाही. स्पष्ट फोटो द्या.',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
  te: {
    title: 'OurPharma Assistant',
    subtitle: 'Mitra Assistant · తక్షణ సమాధానం',
    welcome: 'నేను Mitra Assistant. మందులు, ప్రిస్క్రిప్షన్, ఆర్డర్ సమస్యలు, callback requests లో సహాయం చేస్తాను.',
    placeholder: 'ఏదైనా అడగండి...',
    listening: 'వింటున్నాను...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'ఈ image నుండి text తీసుకోలేకపోయాం. స్పష్టమైన ఫోటో ఇవ్వండి.',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
  ta: {
    title: 'OurPharma Assistant',
    subtitle: 'Mitra Assistant · உடனடி பதில்',
    welcome: 'நான் Mitra Assistant. மருந்து தகவல், prescription, order help மற்றும் callback requests-ல் உதவுவேன்.',
    placeholder: 'ஏதேனும் கேளுங்கள்...',
    listening: 'கேட்கிறேன்...',
    listeningActive: 'Listening... 🎤',
    quickLabels: ['Medicine Info', 'Scan Rx', 'Order Help', 'Callback', 'Report Issue'],
    callbackTitle: 'Request Pharmacist Callback',
    ticketTitle: 'Create Support Ticket',
    nameLabel: 'Name',
    phoneLabel: 'Phone number',
    callbackIssueLabel: 'Issue description',
    ticketIssueLabel: 'Issue description',
    submitCallback: 'Request Callback',
    submitTicket: 'Create Ticket',
    callbackSuccess: '✅ Callback requested! Our pharmacist will call you within 30 minutes.',
    ticketSuccess: (id: string) => `🎫 Support ticket #${id} created. We'll resolve this within 24 hours.`,
    analyzing: 'Analyzing image with Mitra AI...',
    voiceUnsupported: 'Voice input works in Chrome/Edge only.',
    voiceInsecureContext: 'Voice input requires HTTPS or localhost.',
    voicePermissionDenied: 'Microphone access was blocked. Please allow mic permission and try again.',
    voiceNoSpeech: 'No speech detected. Please speak a bit louder and try again.',
    imageError: 'இந்த image-இல் இருந்து text எடுக்க முடியவில்லை. தெளிவான புகைப்படம் தரவும்.',
    uploadHint: 'Attach prescription image',
    newConversation: 'New conversation',
  },
};

type CopyLang = keyof typeof COPY;

const renderBold = (text: string): React.ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );

const ChatBot: React.FC<ChatBotProps> = ({ theme, language }) => {
  const isDark = theme === 'dark';
  const copy = COPY[language as CopyLang] ?? COPY.en;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [callbackForm, setCallbackForm] = useState<CallbackForm>({ name: '', phone: '', issue: '' });
  const [ticketForm, setTicketForm] = useState<TicketForm>({ issue: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    setMessages([{ id: uid(), role: 'bot', content: copy.welcome, type: 'text', time: ts() }]);
    setShowCallbackForm(false);
    setShowTicketForm(false);
    setInputText('');
  }, [language, copy.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, uploadBusy]);

  const pushMessage = (msg: Omit<Message, 'id' | 'time'>) => {
    const newMsg: Message = { ...msg, id: uid(), time: ts() };
    setMessages((prev) => [...prev, newMsg]);
    if (!isOpenRef.current && (msg.role === 'bot' || msg.role === 'system')) {
      setHasUnread(true);
    }
  };

  const latestUserIssue = (): string => {
    const lastUser = [...messages].reverse().find((msg) => msg.role === 'user');
    return inputText.trim() || lastUser?.content || '';
  };

  const saveTicket = async (issue: string, botReply: string): Promise<string> => {
    const ticketId = random4Digit();
    const { data } = await supabase.auth.getSession();
    const userEmail = data.session?.user?.email ?? 'guest@ourpharma.local';

    const chatHistory = JSON.stringify(
      [...messages, { id: uid(), role: 'user', content: issue, type: 'text', time: ts() }, { id: uid(), role: 'bot', content: botReply, type: 'text', time: ts() }]
        .map((msg) => ({ role: msg.role, content: msg.content, time: msg.time }))
    );

    const { error } = await supabase.from('tickets').insert({
      user_email: userEmail,
      issue,
      chat_history: chatHistory,
      status: 'open',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Ticket insert failed:', error.message);
    }

    return ticketId;
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Please use Chrome for voice input'); return; }
    const recognition = new SR();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.onresult = (e: any) => {
      setInputText(e.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { id: uid(), time: ts(), role: 'user', type: 'text', content: msg }]);
    setInputText('');
    setIsTyping(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const ai = new GoogleGenerativeAI((import.meta as any).env.VITE_GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `You are OurPharma pharmacy assistant.
       Rules:
       - Reply in SAME language as user
       - Hindi message = Hindi reply
       - English message = English reply  
       - Max 3-4 lines per reply
       - Help with medicines, orders, prescriptions
       - If cannot help, say pharmacist will call back
       User message: ${msg}`
      );
      setMessages((prev) => [...prev, { id: uid(), time: ts(), role: 'bot', type: 'text', content: result.response.text() }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: uid(), time: ts(), role: 'bot', type: 'text', content: 'Sorry, please try again.' }]);
    }
    setIsTyping(false);
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const dataUrl = typeof event.target?.result === 'string' ? event.target.result : '';
      if (!dataUrl) return;

      const base64 = dataUrl.split(',')[1];
      if (!base64) return;

      pushMessage({ role: 'user', content: copy.uploadHint, type: 'text', imagePreview: dataUrl });
      pushMessage({ role: 'bot', content: copy.analyzing, type: 'text' });

      setUploadBusy(true);
      try {
        const extracted = await extractPrescriptionTextFromImage(base64, file.type || 'image/jpeg');
        setMessages((prev) => {
          const next = [...prev];
          const index = next.map((msg) => msg.content).lastIndexOf(copy.analyzing);
          if (index >= 0) {
            next[index] = {
              ...next[index],
              type: 'image-result',
              content: `Extracted details:\n${extracted}`,
            };
          }
          return next;
        });
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          const index = next.map((msg) => msg.content).lastIndexOf(copy.analyzing);
          if (index >= 0) {
            next[index] = { ...next[index], content: copy.imageError };
          }
          return next;
        });
      } finally {
        setUploadBusy(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const submitCallback = async () => {
    if (!callbackForm.name.trim() || !callbackForm.phone.trim() || !callbackForm.issue.trim()) return;

    const { error } = await supabase.from('callbacks').insert({
      name: callbackForm.name.trim(),
      phone: callbackForm.phone.trim(),
      issue: callbackForm.issue.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      pushMessage({ role: 'bot', content: `Unable to submit callback right now: ${error.message}`, type: 'text' });
      return;
    }

    pushMessage({ role: 'system', content: copy.callbackSuccess, type: 'callback-confirm' });
    setShowCallbackForm(false);
    setCallbackForm({ name: '', phone: '', issue: '' });
  };

  const submitTicket = async () => {
    if (!ticketForm.issue.trim()) return;
    const ticketId = await saveTicket(ticketForm.issue.trim(), 'User raised issue from Report Issue form');
    pushMessage({ role: 'system', content: copy.ticketSuccess(ticketId), type: 'ticket', ticketId });
    setShowTicketForm(false);
    setTicketForm({ issue: '' });
  };

  const openCallbackForm = () => {
    setShowTicketForm(false);
    setShowCallbackForm(true);
    setCallbackForm((prev) => ({ ...prev, issue: prev.issue || latestUserIssue() }));
  };

  const openTicketForm = () => {
    setShowCallbackForm(false);
    setShowTicketForm(true);
    setTicketForm((prev) => ({ issue: prev.issue || latestUserIssue() }));
  };

  const handleQuickAction = (index: number) => {
    if (index === 0) {
      setInputText('Tell me about [medicine name]');
      inputRef.current?.focus();
      return;
    }

    if (index === 1) {
      fileInputRef.current?.click();
      return;
    }

    if (index === 2) {
      setInputText('I need help with my order');
      inputRef.current?.focus();
      return;
    }

    if (index === 3) {
      openCallbackForm();
      return;
    }

    openTicketForm();
  };

  const startNewConversation = () => {
    setMessages([{ id: uid(), role: 'bot', content: copy.welcome, type: 'text', time: ts() }]);
    setShowCallbackForm(false);
    setShowTicketForm(false);
    setInputText('');
  };

  const smallInputClass = `min-h-10 w-full rounded-xl px-3 py-2 text-xs outline-none transition focus:ring-1 focus:ring-[#00D084] ${
    isDark
      ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-white/30'
      : 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'
  }`;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col items-stretch gap-3 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end">
      {isOpen && (
        <div
          className={`flex h-[78dvh] max-h-[680px] w-full max-w-full flex-col overflow-hidden rounded-2xl shadow-2xl backdrop-blur-sm sm:h-[600px] sm:w-[390px] sm:rounded-3xl ${
            isDark ? 'border border-white/10 bg-[#081B18]' : 'border border-slate-200 bg-[#f6fbff]'
          }`}
        >
          <div className="relative flex shrink-0 items-center gap-2.5 bg-gradient-to-r from-[#00D084] via-[#5de2b6] to-[#c4f3df] px-3 py-3.5 sm:gap-3 sm:px-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_45%)]" />
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1F1C]/20 text-[#0B1F1C] font-black text-base select-none">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#0B1F1C] leading-tight">{copy.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#0B1F1C]/70">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#0B1F1C]/60" />
                {copy.subtitle}
              </p>
            </div>

            <label
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#0B1F1C]/15 text-[#0B1F1C] transition hover:bg-[#0B1F1C]/25"
              title={copy.uploadHint}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
            </label>

            <button
              onClick={startNewConversation}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F1C]/15 text-[#0B1F1C] transition hover:bg-[#0B1F1C]/25"
              title={copy.newConversation}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F1C]/15 text-[#0B1F1C] transition hover:bg-[#0B1F1C]/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 px-3 py-3 sm:px-4 sm:py-4" style={{ background: isDark ? 'linear-gradient(180deg, rgba(11,31,28,0.7) 0%, rgba(7,18,16,0.9) 100%)' : 'linear-gradient(180deg, #f8fbff 0%, #eff9f2 100%)' }}>
            {messages.map((msg, idx) => (
              <div key={msg.id}>
                {idx === 0 && msg.role === 'bot' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {copy.quickLabels.map((label, qi) => (
                      <button
                        key={label}
                        onClick={() => handleQuickAction(qi)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#00D084] hover:text-[#0B1F1C] hover:border-[#00D084] ${
                          isDark ? 'border-white/20 text-[#A0AEC0]' : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {msg.role === 'system' ? (
                  <div
                    className={`mx-auto max-w-[290px] rounded-2xl p-3 text-center text-xs font-semibold leading-relaxed ${
                      msg.type === 'ticket'
                        ? isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{renderBold(msg.content)}</p>
                    {msg.ticketId && (
                      <p className={`mt-1 text-[9px] font-black tracking-widest uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        {msg.ticketId}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {msg.role === 'bot' && (
                      <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#00D084] text-[#0B1F1C] text-xs font-black select-none">
                        M
                      </div>
                    )}
                    <div
                      className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-[#00D084] text-[#0B1F1C] font-semibold'
                          : isDark
                            ? 'rounded-bl-sm border border-white/10 bg-[#1a3530] text-[#F7FAFC]'
                            : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm'
                      }`}
                    >
                      {msg.imagePreview && (
                        <img src={msg.imagePreview} alt="prescription" className="mb-2 max-h-28 w-full rounded-xl object-cover" />
                      )}
                      <p className="whitespace-pre-line">{renderBold(msg.content)}</p>
                      <p className={`mt-1 text-right text-[9px] ${msg.role === 'user' ? 'text-[#0B1F1C]/50' : isDark ? 'text-white/25' : 'text-slate-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-1 p-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {uploadBusy && (
              <div className="flex justify-start items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 mb-1 items-center justify-center rounded-xl bg-[#00D084] text-[#0B1F1C] text-xs font-black select-none">
                  M
                </div>
                <div className={`flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3 ${isDark ? 'border border-white/10 bg-[#1a3530]' : 'border border-slate-200 bg-white shadow-sm'}`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-[#00D084] animate-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showCallbackForm && (
            <div className={`shrink-0 border-t px-3 py-3 space-y-2 sm:px-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00D084]">{copy.callbackTitle}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={callbackForm.name}
                  onChange={(event) => setCallbackForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder={copy.nameLabel}
                  className={smallInputClass}
                />
                <input
                  value={callbackForm.phone}
                  onChange={(event) => setCallbackForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder={copy.phoneLabel}
                  inputMode="tel"
                  className={smallInputClass}
                />
              </div>
              <textarea
                value={callbackForm.issue}
                onChange={(event) => setCallbackForm((prev) => ({ ...prev, issue: event.target.value }))}
                placeholder={copy.callbackIssueLabel}
                className={`${smallInputClass} min-h-20 resize-none`}
              />
              <button
                onClick={submitCallback}
                disabled={!callbackForm.name.trim() || !callbackForm.phone.trim() || !callbackForm.issue.trim()}
                className="w-full rounded-xl border border-[#00D084] bg-[#00D084] py-2.5 text-xs font-black uppercase tracking-widest text-[#0B1F1C] transition hover:bg-transparent hover:text-[#00D084] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.submitCallback}
              </button>
            </div>
          )}

          {showTicketForm && (
            <div className={`shrink-0 border-t px-3 py-3 space-y-2 sm:px-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00D084]">{copy.ticketTitle}</p>
              <textarea
                value={ticketForm.issue}
                onChange={(event) => setTicketForm({ issue: event.target.value })}
                placeholder={copy.ticketIssueLabel}
                className={`${smallInputClass} min-h-24 resize-none`}
              />
              <button
                onClick={submitTicket}
                disabled={!ticketForm.issue.trim()}
                className="w-full rounded-xl border border-[#00D084] bg-[#00D084] py-2.5 text-xs font-black uppercase tracking-widest text-[#0B1F1C] transition hover:bg-transparent hover:text-[#00D084] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.submitTicket}
              </button>
            </div>
          )}

          <div className={`flex shrink-0 items-center gap-2 border-t px-3 py-3 sm:px-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <button
              onClick={startVoice}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                isListening
                  ? 'animate-pulse bg-red-500 text-white'
                  : isDark
                    ? 'border border-white/10 bg-white/5 text-[#A0AEC0] hover:border-[#00D084] hover:text-[#00D084]'
                    : 'border border-slate-200 bg-white text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              <svg className="w-4 h-4" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <div className="flex-1">
              <input
                ref={inputRef}
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                placeholder={isListening ? copy.listening : copy.placeholder}
                disabled={isTyping || uploadBusy}
                className={`w-full min-h-10 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-1 focus:ring-[#00D084] ${
                  isDark
                    ? 'border border-white/10 bg-white/5 text-[#F7FAFC] placeholder:text-white/30'
                    : 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'
                }`}
              />
                {isListening && (
                  <p className={`mt-1 text-[10px] font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                    {copy.listeningActive}
                  </p>
                )}
            </div>

            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || isTyping || uploadBusy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00D084] text-[#0B1F1C] transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen((open) => !open);
          setHasUnread(false);
        }}
        className="relative ml-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D084] text-[#0B1F1C] shadow-2xl shadow-[#00D084]/40 transition duration-300 hover:scale-110 hover:brightness-110"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {hasUnread && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-400" />
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
