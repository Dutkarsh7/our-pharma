import { GoogleGenAI, Type } from '@google/genai';

const getGeminiApiKey = () => process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isQuotaOrRateLimitError = (errorText: string): boolean =>
  /429|resource_exhausted|quota exceeded|rate limit|too many requests|free_tier|retry/i.test(errorText);

const isAuthOrApiKeyError = (errorText: string): boolean =>
  /401|403|unauthorized|forbidden|api key|permission denied|invalid api key/i.test(errorText);

const isTransientGeminiError = (errorText: string): boolean =>
  /503|unavailable|high demand|temporarily|overloaded|try again later/i.test(errorText);

const formatGeminiError = (error: unknown, fallbackMessage: string): string => {
  const text = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error || {});

  if (isQuotaOrRateLimitError(text)) {
    return 'Mitra AI is currently at usage limit. Please retry in a minute. If this continues, check your Gemini API quota and billing settings.';
  }

  if (isAuthOrApiKeyError(text)) {
    return 'Gemini API access is not configured correctly on the server. Check the Vercel GEMINI_API_KEY secret and redeploy.';
  }

  if (isTransientGeminiError(text)) {
    return 'Mitra AI is temporarily unavailable. Please retry in a minute.';
  }

  return fallbackMessage;
};

const promptForAnalyze = `
Act as a senior clinical pharmacist. Analyze this prescription image with extreme precision.

TASKS:
1. EXTRACT: Identify all medicine names, strengths, and dosage instructions.
2. CATEGORIZE: Group into 'Chronic Management' (Diabetes, Heart, etc.) or 'General Health'.
3. SALT MATCHING: For every branded drug, identify the EXACT molecular salt.
4. GENERIC SUBSTITUTION: Suggest the highest-rated generic alternative available in India.
5. EFFICACY: Explain the medical benefit of the salt and why the generic is 100% bio-equivalent.
6. LOGISTICS: Set deliveryTime to exactly "2 Hours" for all items. Calculate realistic INR prices.

RESPONSE JSON STRUCTURE:
- medicines: Array with properties: originalName, activeSalt, strength, manufacturer, brandedPrice, genericPrice, genericBrandName, tabletCount, availability, deliveryTime (Set to "2 Hours"), savingsPercentage, savingsAmount, monthlySavings, benefits (array of 3 points), uses, drugClass, category.
- totalBrandedCost, totalGenericCost, totalSavings, monthlySavingsTotal.
- patientAdvice: 2-sentence empathetic summary.
- detectedCondition: Main health issue (e.g., Hypertension, Viral Infection).
`;

const promptForOcr = `This is a prescription or medicine image.
Extract all medicine names, dosages, and instructions.
List them clearly.`;

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari script)',
  bn: 'Bengali (বাংলা script)',
  mr: 'Marathi (Devanagari script)',
  te: 'Telugu (తెలుగు script)',
  ta: 'Tamil (தமிழ் script)',
};

const FALLBACKS: Record<string, string> = {
  en: 'Sorry, I cannot connect right now. Please call us at +91 7827664217.',
  hi: 'माफ़ करें, मैं अभी कनेक्ट नहीं हो पा रहा। कृपया +91 7827664217 पर कॉल करें।',
  bn: 'দুঃখিত, এখন সংযোগ করা যাচ্ছে না। অনুগ্রহ করে +91 7827664217 এ কল করুন।',
  mr: 'क्षमस्व, आत्ता कनेक्ट होत नाही. कृपया +91 7827664217 वर कॉल करा.',
  te: 'క్షమించండి, ఇప్పుడు కనెక్ట్ అవ్వలేకున్నాను. దయచేసి +91 7827664217 కి కాల్ చేయండి.',
  ta: 'மன்னிக்கவும், தற்போது இணைக்க முடியவில்லை. +91 7827664217-ஐ அழைக்கவும்.',
};

const normalizeErrorText = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
};

const buildFallbackAnalysis = (ocrText: string) => {
  const normalizedOcr = normalizeText(ocrText);
  return {
    medicines: [],
    totalBrandedCost: 0,
    totalGenericCost: 0,
    totalSavings: 0,
    monthlySavingsTotal: 0,
    patientAdvice: normalizedOcr
      ? 'Our AI analysis service is temporarily busy, so this scan was matched locally from the catalog. Please verify the medicines against your prescription before ordering.'
      : 'Our AI analysis service is temporarily busy. Please retry with a clearer prescription image.',
    detectedCondition: 'General Care',
  };
};

const handleAnalyze = async (base64Image: string, mimeType: string) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key on server.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: promptForAnalyze },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medicines: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          totalBrandedCost: { type: Type.NUMBER },
          totalGenericCost: { type: Type.NUMBER },
          totalSavings: { type: Type.NUMBER },
          monthlySavingsTotal: { type: Type.NUMBER },
          patientAdvice: { type: Type.STRING },
          detectedCondition: { type: Type.STRING },
        },
        required: ['medicines', 'totalBrandedCost', 'totalGenericCost', 'totalSavings', 'monthlySavingsTotal', 'patientAdvice'],
      },
    },
  });

  if (!response.text) {
    throw new Error('Analysis failed. Please ensure the prescription is well-lit and readable.');
  }

  return JSON.parse(response.text.trim());
};

const handleOcr = async (base64Image: string, mimeType: string) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key on server.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: {
      parts: [
        { text: promptForOcr },
        { inlineData: { data: base64Image, mimeType } },
      ],
    },
  });

  const text = (response.text || '').trim();
  if (!text) {
    throw new Error('Could not extract readable text from this image.');
  }

  return text;
};

const handleChat = async (userMessage: string, language: string) => {
  const apiKey = getGeminiApiKey();
  const fallbackReply = FALLBACKS[language] || FALLBACKS.en;

  if (!apiKey) {
    return { reply: fallbackReply, shouldEscalate: true };
  }

  const escalationKeywords = [
    'callback', 'call back', 'human', 'agent', 'speak to', 'pharmacist call',
    'not helpful', 'useless', 'escalate', 'complaint', 'refund', 'wrong medicine',
    'urgent', 'emergency', 'transfer me', 'call me',
    'कॉलबैक', 'फार्मासिस्ट', 'शिकायत', 'वापसी', 'गलत दवाई', 'मदद नहीं', 'तुरंत', 'इंसान',
  ];
  const shouldEscalate = escalationKeywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword.toLowerCase())
  );

  const respondIn = LANG_NAMES[language] || 'English';
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are OurPharma's pharmacy assistant.
You help users with:
- Medicine information and generic alternatives
- Prescription queries
- Order status and issues
- Health advice (non-diagnostic)
- Callback requests from pharmacist
Always respond in the same language as the user message.
If user writes in Hindi, respond in Hindi.
If you cannot solve the issue, say you are creating a support ticket and scheduling a pharmacist callback.
Keep responses concise and helpful.

Additional rules:
- Respond in ${respondIn} only.
- Never provide diagnosis.
- Never fabricate prices, stock, or timelines.

User message: ${userMessage}

Reply now in ${respondIn}:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: { parts: [{ text: prompt }] },
  });

  const reply = (response.text || '').trim() || fallbackReply;
  const escalationFromReply = [
    'cannot help', 'not sure', 'contact support', 'support ticket', 'pharmacist callback',
    'solve this', 'unable to', 'can\'t assist',
    'मदद नहीं', 'सपोर्ट', 'टिकट', 'कॉलबैक',
  ].some((keyword) => reply.toLowerCase().includes(keyword));

  return { reply, shouldEscalate: shouldEscalate || escalationFromReply };
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const action = body.action as string;

    if (action === 'analyze') {
      const data = await handleAnalyze(body.base64Image, body.mimeType || 'image/jpeg');
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'ocr') {
      const data = await handleOcr(body.base64Image, body.mimeType || 'image/jpeg');
      return res.status(200).json({ ok: true, data });
    }

    if (action === 'chat') {
      const data = await handleChat(body.userMessage || '', body.language || 'en');
      return res.status(200).json({ ok: true, data });
    }

    return res.status(400).json({ ok: false, error: 'Unknown Gemini action' });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: formatGeminiError(error, normalizeErrorText(error) || 'Gemini request failed.'),
    });
  }
}
