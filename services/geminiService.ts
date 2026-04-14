
import { GoogleGenAI, Type } from "@google/genai";
import { PrescriptionAnalysis } from "../types";
import { medicines as catalogMedicines, Medicine as CatalogMedicine } from "../src/data/medicines";

type GeminiAction = 'analyze' | 'ocr' | 'chat';

interface GeminiProxyResponse<T> {
  ok?: boolean;
  data?: T;
  error?: string;
}

interface GeminiErrorPayload {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{
      message?: string;
      retryDelay?: string;
      quotaMetric?: string;
      quotaId?: string;
    }>;
  };
}

const getGeminiApiKey = () => {
  const env = (import.meta as any).env;
  return env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || '';
};

const isBrowser = typeof window !== 'undefined' && typeof fetch !== 'undefined';
const isViteDev = typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.DEV);

const callGeminiProxy = async <T>(payload: Record<string, unknown>): Promise<T> => {
  if (!isBrowser) {
    throw new Error('Gemini proxy is only available in the browser.');
  }

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as GeminiProxyResponse<T> | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || `Gemini proxy request failed (${response.status})`);
  }

  return data.data as T;
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseGeminiErrorPayload = (message: string): GeminiErrorPayload | null => {
  const trimmed = message.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as GeminiErrorPayload;
  } catch {
    return null;
  }
};

const extractNestedErrorText = (value: unknown): string => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractNestedErrorText).filter(Boolean).join(' ');
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const parts = [
      record.message,
      record.status,
      record.code,
      record.retryDelay,
      record.quotaMetric,
      record.quotaId,
      record.reason,
      record.details,
      record.error,
    ]
      .map(extractNestedErrorText)
      .filter(Boolean);

    if (parts.length) {
      return parts.join(' ');
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }

  return String(value);
};

const getErrorText = (error: unknown): string => {
  if (typeof error === 'string') {
    const payload = parseGeminiErrorPayload(error);
    return payload?.error?.message || error;
  }

  if (error instanceof Error) {
    const payload = parseGeminiErrorPayload(error.message);
    return payload?.error?.message || extractNestedErrorText(error);
  }

  return extractNestedErrorText(error) || 'Unknown error';
};

const isQuotaOrRateLimitError = (error: unknown): boolean =>
  /429|resource_exhausted|quota exceeded|rate limit|too many requests|free_tier|retry/i.test(getErrorText(error));

const isAuthOrApiKeyError = (error: unknown): boolean =>
  /401|403|unauthorized|forbidden|api key|permission denied|invalid api key/i.test(getErrorText(error));

const formatGeminiError = (error: unknown, fallbackMessage: string): string => {
  if (isQuotaOrRateLimitError(error)) {
    return 'Mitra AI is currently at usage limit. Please retry in a minute. If this continues, check your Gemini API quota and billing settings.';
  }

  if (isAuthOrApiKeyError(error)) {
    return 'Gemini API access is not configured correctly. Check your Vercel environment variables for VITE_GEMINI_API_KEY or GEMINI_API_KEY, then redeploy and retry.';
  }

  if (isTransientGeminiError(error)) {
    return 'Mitra AI is temporarily unavailable. Please retry in a minute.';
  }

  return fallbackMessage;
};

const scoreMedicineMatch = (haystack: string, candidate: CatalogMedicine): number => {
  const brand = normalizeText(candidate.brand_name);
  const generic = normalizeText(candidate.generic_name);

  if (!brand && !generic) return 0;

  if (haystack.includes(brand)) return 0.98;
  if (haystack.includes(generic)) return 0.9;

  const words = brand.split(' ').filter((word) => word.length > 2);
  if (!words.length) return 0;

  const hits = words.filter((word) => haystack.includes(word)).length;
  const ratio = hits / words.length;
  return ratio >= 0.55 ? Math.min(0.88, ratio) : 0;
};

const inferCondition = (text: string): string => {
  const normalized = normalizeText(text);

  if (/(diabetes|metformin|insulin|glimepiride|glipizide)/.test(normalized)) return 'Diabetes Care';
  if (/(blood pressure|hypertension|telmisartan|amlodipine|losartan|ramipril|metoprolol)/.test(normalized)) return 'Cardiac Care';
  if (/(fever|pain|headache|paracetamol|crocin|dolo|aspirin)/.test(normalized)) return 'Pain and Fever';
  if (/(infection|antibiotic|amoxicillin|azithromycin|augmentin)/.test(normalized)) return 'Infection Treatment';
  if (/(acidity|gastric|ulcer|pantoprazole|omeprazole|domperidone|ranitidine)/.test(normalized)) return 'Digestive Care';
  if (/(allergy|fexofenadine)/.test(normalized)) return 'Allergy Relief';

  return 'General Care';
};

const buildFallbackAnalysis = (ocrText: string): PrescriptionAnalysis => {
  const normalizedOcr = normalizeText(ocrText);

  const matches = catalogMedicines
    .map((medicine) => ({
      medicine,
      confidence: scoreMedicineMatch(normalizedOcr, medicine),
    }))
    .filter((item) => item.confidence > 0)
    .sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }

      return (b.medicine.brand_price - b.medicine.generic_price) - (a.medicine.brand_price - a.medicine.generic_price);
    })
    .slice(0, 5);

  if (!matches.length) {
    throw new Error('Could not identify medicine names from the image. Please upload a clearer prescription or try again later.');
  }

  const medicines = matches.map(({ medicine }) => {
    const savingsAmount = Math.max(0, medicine.brand_price - medicine.generic_price);
    const savingsPercentage = medicine.brand_price > 0
      ? Math.round((savingsAmount / medicine.brand_price) * 100)
      : 0;
    const condition = inferCondition(`${medicine.brand_name} ${medicine.generic_name} ${medicine.uses}`);
    const availability: 'In Stock' = 'In Stock';

    return {
      originalName: medicine.brand_name,
      activeSalt: medicine.generic_name,
      strength: medicine.generic_name,
      manufacturer: medicine.manufacturer,
      brandedPrice: medicine.brand_price,
      genericPrice: medicine.generic_price,
      genericBrandName: medicine.generic_name,
      tabletCount: 10,
      availability,
      deliveryTime: '2 Hours',
      savingsPercentage,
      savingsAmount,
      monthlySavings: savingsAmount,
      benefits: [
        'Same active ingredient as the branded medicine',
        `Estimated savings of ₹${savingsAmount.toLocaleString('en-IN')} per pack`,
        'Fast local fulfillment with pharmacist verification'
      ],
      uses: medicine.uses,
      drugClass: condition,
      sideEffects: medicine.side_effects.join(', '),
      dosage: 'Follow the prescription label and your doctor\'s directions.',
      rxRequired: true,
      isNarcotic: false,
      category: condition,
    } satisfies PrescriptionAnalysis['medicines'][number];
  });

  const totalBrandedCost = medicines.reduce((sum, item) => sum + item.brandedPrice, 0);
  const totalGenericCost = medicines.reduce((sum, item) => sum + item.genericPrice, 0);
  const totalSavings = totalBrandedCost - totalGenericCost;
  const monthlySavingsTotal = medicines.reduce((sum, item) => sum + item.monthlySavings, 0);

  return {
    medicines,
    totalBrandedCost,
    totalGenericCost,
    totalSavings,
    monthlySavingsTotal,
    patientAdvice: 'Our AI analysis service is temporarily busy, so this scan was matched locally from the catalog. Please verify the medicines against your prescription before ordering.',
    detectedCondition: inferCondition(normalizedOcr),
  };
};

const isTransientGeminiError = (error: unknown): boolean => {
  return /503|unavailable|high demand|temporarily|overloaded|try again later/i.test(getErrorText(error));
};

export const analyzePrescription = async (base64Image: string, mimeType = 'image/jpeg'): Promise<PrescriptionAnalysis> => {
  if (isBrowser) {
    try {
      return await callGeminiProxy<PrescriptionAnalysis>({
        action: 'analyze' satisfies GeminiAction,
        base64Image,
        mimeType,
      });
    } catch (proxyError) {
      console.warn('[Gemini proxy analyze fallback]', proxyError);
      if (!isViteDev) {
        throw new Error('Gemini scan endpoint failed on the server. Check that Vercel has GEMINI_API_KEY set and redeploy the app.');
      }
    }
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Add your Gemini API key in Vercel or .env as VITE_GEMINI_API_KEY or GEMINI_API_KEY, then redeploy or restart the app.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash';
  
  const prompt = `
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

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalName: { type: Type.STRING },
                  activeSalt: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  manufacturer: { type: Type.STRING },
                  brandedPrice: { type: Type.NUMBER },
                  genericPrice: { type: Type.NUMBER },
                  genericBrandName: { type: Type.STRING },
                  tabletCount: { type: Type.INTEGER },
                  availability: { type: Type.STRING },
                  deliveryTime: { type: Type.STRING },
                  savingsPercentage: { type: Type.NUMBER },
                  savingsAmount: { type: Type.NUMBER },
                  monthlySavings: { type: Type.NUMBER },
                  benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  uses: { type: Type.STRING },
                  drugClass: { type: Type.STRING },
                  category: { type: Type.STRING }
                }
              }
            },
            totalBrandedCost: { type: Type.NUMBER },
            totalGenericCost: { type: Type.NUMBER },
            totalSavings: { type: Type.NUMBER },
            monthlySavingsTotal: { type: Type.NUMBER },
            patientAdvice: { type: Type.STRING },
            detectedCondition: { type: Type.STRING }
          },
          required: ['medicines', 'totalBrandedCost', 'totalGenericCost', 'totalSavings', 'monthlySavingsTotal', 'patientAdvice']
        }
      }
    });

    if (!response.text) throw new Error('Analysis failed. Please ensure the prescription is well-lit and readable.');
    return JSON.parse(response.text.trim());
  } catch (error) {
    throw new Error(formatGeminiError(error, 'Could not analyze prescription right now. Please retry with a clearer image.'));
  }
};

export const analyzePrescriptionWithFallback = async (base64Image: string, mimeType = 'image/jpeg'): Promise<PrescriptionAnalysis> => {
  try {
    return await analyzePrescription(base64Image, mimeType);
  } catch (error) {
    try {
      const ocrText = await extractPrescriptionTextFromImage(base64Image, mimeType);
      return buildFallbackAnalysis(ocrText);
    } catch {
      throw new Error(formatGeminiError(error, 'Scan service is temporarily unavailable. Please try again in a minute with a clearer image.'));
    }
  }
};

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

export const chatWithPharmaBot = async (
  userMessage: string,
  language: string
): Promise<{ reply: string; shouldEscalate: boolean }> => {
  if (isBrowser) {
    try {
      return await callGeminiProxy<{ reply: string; shouldEscalate: boolean }>({
        action: 'chat' satisfies GeminiAction,
        userMessage,
        language,
      });
    } catch (proxyError) {
      console.warn('[Gemini proxy chat fallback]', proxyError);
      if (!isViteDev) {
        return {
          reply: FALLBACKS[language] || FALLBACKS.en,
          shouldEscalate: true,
        };
      }
    }
  }

  const apiKey = getGeminiApiKey();
  const fallbackReply = FALLBACKS[language] || FALLBACKS.en;

  if (!apiKey) {
    return { reply: fallbackReply, shouldEscalate: true };
  }

  const escalationKeywords = [
    'callback','call back','human','agent','speak to','pharmacist call',
    'not helpful','useless','escalate','complaint','refund','wrong medicine',
    'urgent','emergency','transfer me','call me',
    'कॉलबैक','फार्मासिस्ट','शिकायत','वापसी','गलत दवाई','मदद नहीं','तुरंत','इंसान'
  ];
  const shouldEscalate = escalationKeywords.some(kw =>
    userMessage.toLowerCase().includes(kw.toLowerCase())
  );

  const respondIn = LANG_NAMES[language] || 'English';

  try {
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
      contents: { parts: [{ text: prompt }] }
    });
    const reply = (response.text || '').trim()
      || (FALLBACKS[language] || FALLBACKS.en);

    const escalationFromReply = [
      'cannot help', 'not sure', 'contact support', 'support ticket', 'pharmacist callback',
      'solve this', 'unable to', 'can\'t assist',
      'मदद नहीं', 'सपोर्ट', 'टिकट', 'कॉलबैक'
    ].some((kw) => reply.toLowerCase().includes(kw.toLowerCase()));

    return { reply, shouldEscalate: shouldEscalate || escalationFromReply };
  } catch (err) {
    console.error('[ChatBot Gemini error]', err);
    const errorAwareReply = isQuotaOrRateLimitError(err)
      ? 'Mitra AI is currently busy due to usage limits. Please retry shortly, or I can connect you to support at +91 7827664217.'
      : fallbackReply;
    return { reply: errorAwareReply, shouldEscalate: true };
  }
};

export const extractPrescriptionTextFromImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  if (isBrowser) {
    try {
      return await callGeminiProxy<string>({
        action: 'ocr' satisfies GeminiAction,
        base64Image,
        mimeType,
      });
    } catch (proxyError) {
      console.warn('[Gemini proxy OCR fallback]', proxyError);
      if (!isViteDev) {
        throw new Error('Gemini OCR endpoint failed on the server. Check that Vercel has GEMINI_API_KEY set and redeploy the app.');
      }
    }
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Add your Gemini API key in Vercel or .env as VITE_GEMINI_API_KEY or GEMINI_API_KEY, then redeploy or restart the app.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `This is a prescription or medicine image.
Extract all medicine names, dosages, and instructions.
List them clearly.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    });

    const text = (response.text || '').trim();
    if (!text) {
      throw new Error('Could not extract readable text from this image.');
    }

    return text;
  } catch (error) {
    throw new Error(formatGeminiError(error, 'Could not read this prescription image. Please retry with better lighting and focus.'));
  }
};
