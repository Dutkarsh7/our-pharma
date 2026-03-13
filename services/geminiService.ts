
import { GoogleGenAI, Type } from "@google/genai";
import { PrescriptionAnalysis } from "../types";

const getGeminiApiKey = () => {
  const env = (import.meta as any).env;
  return env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
};

export const analyzePrescription = async (base64Image: string): Promise<PrescriptionAnalysis> => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Add your Gemini API key in .env as VITE_GEMINI_API_KEY and restart the app.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
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

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
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

  if (!response.text) throw new Error("Analysis failed. Please ensure the prescription is well-lit and readable.");
  return JSON.parse(response.text.trim());
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
    return { reply: fallbackReply, shouldEscalate: true };
  }
};

export const extractPrescriptionTextFromImage = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Add your Gemini API key in .env as VITE_GEMINI_API_KEY and restart the app.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `This is a prescription or medicine image.
Extract all medicine names, dosages, and instructions.
List them clearly.`;

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
};
