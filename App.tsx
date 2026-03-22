
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { Analytics } from '@vercel/analytics/react';
import { AppState, ViewState, User, Medicine as PrescriptionMedicine, CartItem, Language, Theme } from './types';
import { analyzePrescription } from './services/geminiService';
import Header from './components/Header';
import AnalysisResult from './components/AnalysisResult';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import Checkout from './components/Checkout';
import ProfileEditor from './components/ProfileEditor';
import ExpertConsult from './components/ExpertConsult';
import ConsultationBooking from './components/ConsultationBooking';
import PremiumLanding from './components/PremiumLanding';
import MedicineSearch from './src/components/MedicineSearch';
import ChatBot from './components/ChatBot.tsx';
import { medicines, Medicine as CatalogMedicine } from './src/data/medicines';
import { supabase } from './src/lib/supabase';

const MOST_USED_INDIAN_LANGUAGES: Language[] = ['hi', 'bn', 'mr', 'te', 'ta'];

const detectInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('ourpharma-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
};

const detectInitialLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const saved = window.localStorage.getItem('ourpharma-language') as Language | null;
  if (saved && ['en', ...MOST_USED_INDIAN_LANGUAGES].includes(saved)) return saved;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('hi')) return 'hi';
  if (browserLang.startsWith('bn')) return 'bn';
  if (browserLang.startsWith('mr')) return 'mr';
  if (browserLang.startsWith('te')) return 'te';
  if (browserLang.startsWith('ta')) return 'ta';
  return 'en';
};

const translations = {
  en: {
    delivery: "2 Hour Delivery Active",
    tagline1: "Your Prescription.",
    tagline2: "Faster. Smarter. Cheaper.",
    description: "Scan your prescription to find identical generic salts. We deliver bio-equivalent medicine in 2 hours across all major hubs.",
    scans: "Verified Salts",
    gmp: "GMP Sourced",
    pharma: "Pharmacist Checked",
    home: 'Home',
    medicines: 'Medicines',
    experts: 'Experts',
    login: 'Login',
    logout: 'Logout',
    serviceability: '2-hour doorstep delivery is currently serviceable only in Gurgaon, Bangalore, Mumbai, and Gujarat hubs.',
  },
  hi: {
    delivery: "2 घंटे में डिलीवरी सक्रिय",
    tagline1: "आपका नुस्खा।",
    tagline2: "तेज़। स्मार्ट। सस्ता।",
    description: "समान जेनेरिक सॉल्ट खोजने के लिए अपना नुस्खा स्कैन करें। हम सभी प्रमुख केंद्रों में 2 घंटे में बायो-इक्विवेलेंट दवाएं वितरित करते हैं।",
    scans: "सत्यापित सॉल्ट",
    gmp: "GMP स्रोत",
    pharma: "फार्मासिस्ट द्वारा जाँचा गया",
    home: 'होम',
    medicines: 'दवाइयां',
    experts: 'विशेषज्ञ',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    serviceability: '2 घंटे की डिलीवरी फिलहाल केवल गुड़गांव, बैंगलोर, मुंबई और गुजरात हब में उपलब्ध है।',
  },
  bn: {
    delivery: "২ ঘন্টার ডেলিভারি সক্রিয়",
    tagline1: "আপনার প্রেসক্রিপশন।",
    tagline2: "দ্রুত। স্মার্ট। সস্তা।",
    description: "একই জেনেরিক সল্ট খুঁজতে আপনার প্রেসক্রিপশন স্ক্যান করুন। আমরা সমস্ত প্রধান কেন্দ্রে ২ ঘন্টার মধ্যে বায়ো-ইকুইভ্যালেন্ট ওষুধ সরবরাহ করি।",
    scans: "যাচাইকৃত সল্ট",
    gmp: "GMP উত্স",
    pharma: "ফার্মাসিস্ট দ্বারা চেক করা",
    home: 'Home',
    medicines: 'Medicines',
    experts: 'Experts',
    login: 'Login',
    logout: 'Logout',
    serviceability: '2-hour doorstep delivery is currently serviceable only in Gurgaon, Bangalore, Mumbai, and Gujarat hubs.',
  },
  mr: {
    delivery: "२ तास डिलिव्हरी सक्रिय",
    tagline1: "तुमचे प्रिस्क्रिप्शन।",
    tagline2: "वेगवान. स्मार्ट. स्वस्त.",
    description: "समान जेनेरिक सॉल्ट शोधण्यासाठी तुमचे प्रिस्क्रिप्शन स्कॅन करा. आम्ही सर्व प्रमुख केंद्रांमध्ये २ तासांत बायो-इक्विव्हॅलेंट औषधे वितरीत करतो.",
    scans: "सत्यापित सॉल्ट",
    gmp: "GMP स्त्रोत",
    pharma: "फार्मसिस्टद्वारे तपासलेले",
    home: 'Home',
    medicines: 'Medicines',
    experts: 'Experts',
    login: 'Login',
    logout: 'Logout',
    serviceability: '2-hour doorstep delivery is currently serviceable only in Gurgaon, Bangalore, Mumbai, and Gujarat hubs.',
  },
  te: {
    delivery: "2 గంటల డెలివరీ యాక్టివ్",
    tagline1: "మీ ప్రిస్క్రిప్షన్.",
    tagline2: "వేగంగా. తెలివిగా. చౌకగా.",
    description: "ఒకేలాంటి జెనరిక్ లవణాలను కనుగొనడానికి మీ ప్రిస్క్రిప్షన్‌ను స్కాన్ చేయండి. మేము అన్ని ప్రధాన కేంద్రాలలో 2 గంటలలోపు బయో-ఈక్వివలెంట్ ఔషధాలను అందిస్తాము.",
    scans: "ధృవీకరించబడిన లవణాలు",
    gmp: "GMP మూలాలు",
    pharma: "ఫార్మసిస్ట్ తనిఖీ చేశారు",
    home: 'Home',
    medicines: 'Medicines',
    experts: 'Experts',
    login: 'Login',
    logout: 'Logout',
    serviceability: '2-hour doorstep delivery is currently serviceable only in Gurgaon, Bangalore, Mumbai, and Gujarat hubs.',
  },
  ta: {
    delivery: "2 மணிநேர டெலிவரி செயலில் உள்ளது",
    tagline1: "உங்கள் மருந்துச் சீட்டு.",
    tagline2: "வேகமாக. புத்திசாலித்தனமாக. மலிவாக.",
    description: "ஒரே மாதிரியான ஜெனரிக் உப்புகளைக் கண்டறிய உங்கள் மருந்துச் சீட்டை ஸ்கேன் ���ெய்யுங்கள். அனைத்து முக்கிய மையங்களிலும் 2 மணிநேரத்தில் பயோ-சமமான மருந்துகளை வழங்குகிறோம்.",
    scans: "சரிபார்க்கப்பட்ட உப்புகள்",
    gmp: "GMP மூலம் பெறப்பட்டது",
    pharma: "மருந்தாளர் சரிபார்க்கப்பட்டது",
    home: 'Home',
    medicines: 'Medicines',
    experts: 'Experts',
    login: 'Login',
    logout: 'Logout',
    serviceability: '2-hour doorstep delivery is currently serviceable only in Gurgaon, Bangalore, Mumbai, and Gujarat hubs.',
  }
};

const founders = [
  {
    name: "Utkarsh Shukla",
    role: "Co-Founder & COA",
    email: "utkarsh@ourpharma.in",
    phone: "+91 7827664217",
    image: ''
  },
  {
    name: "Nishant Singh",
    role: "Co-Founder , CTO & CEO",
    email: "nishant@ourpharma.in",
    phone: "+91 7827664217",
    image: ''
  },
  {
    name: "Uditanshu Singh",
    role: "Co-Founder & Product Lead",
    email: "uditanshu@ourpharma.in",
    phone: "+91 7827664217",
    image: ''
  },
  {
    name: "Nikhil Verma",
    role: "Co-Founder & Operations Lead",
    email: "nikhil@ourpharma.in",
    phone: "+91 7827664217",
    image: ''
  }
];

const FEATURED_MEDICINE_NAMES = [
  'Crocin 650',
  'Augmentin 625',
  'Glycomet 500',
  'Lantus Solostar',
  'Human Mixtard 70/30',
  'Telma 40',
];

const FounderAvatar: React.FC<{ name: string; image?: string; className?: string }> = ({ name, image, className = '' }) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (image && !hasImageError) {
    return (
      <img
        src={image}
        alt={name}
        onError={() => setHasImageError(true)}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {name.charAt(0)}
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    isAnalyzing: false,
    error: null,
    result: null,
    imagePreview: null,
    pincode: '400001',
    user: null,
    cart: [],
    language: detectInitialLanguage(),
    theme: detectInitialTheme(),
  });
  const [locationLabel, setLocationLabel] = useState('Mumbai 400001');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [authPrompt, setAuthPrompt] = useState('');
  const [consultationReason, setConsultationReason] = useState('General medical consultation');
  const featuredMedicines = medicines.filter((medicine) => FEATURED_MEDICINE_NAMES.includes(medicine.brand_name));

  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsSessionLoading(false);
    };

    initializeSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.email) {
      setState(prev => ({ ...prev, user: null }));
      return;
    }

    const metaName = session.user.user_metadata?.full_name;
    const nameFromEmail = session.user.email.split('@')[0];
    setState(prev => ({
      ...prev,
      user: {
        email: session.user.email ?? '',
        name: metaName || nameFromEmail
      }
    }));
  }, [session]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    window.localStorage.setItem('ourpharma-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    window.localStorage.setItem('ourpharma-language', state.language);
  }, [state.language]);

  const detectLocation = () => {
    if (!navigator.geolocation || isDetectingLocation) return;

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: 'application/json'
              }
            }
          );
          const data = await response.json();
          const address = data?.address || {};

          // Pick the most specific locality first (suburb/neighbourhood etc.)
          const locality =
            address.neighbourhood ||
            address.quarter ||
            address.suburb ||
            address.road ||
            address.village ||
            address.town ||
            address.city_district ||
            address.city ||
            address.state_district ||
            'Your Area';

          const pincode = address.postcode || state.pincode;

          setLocationLabel(`${locality} ${pincode}`.trim());
          setState(prev => ({ ...prev, pincode }));
        } catch (error) {
          console.error(error);
          setLocationLabel(`Detected Area ${state.pincode}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleUpload = async (base64: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, imagePreview: base64 }));
    
    try {
      const result = await analyzePrescription(base64);
      setState(prev => ({ ...prev, isAnalyzing: false, result, view: 'analysis' }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not read prescription. Please use a clearer photo.';
      console.error(err);
      setState(prev => ({ ...prev, isAnalyzing: false, view: 'error', error: message }));
    }
  };

  const addToCart = (med: PrescriptionMedicine) => {
    if (!session) {
      setAuthPrompt('Please login to place orders. You can continue exploring the website without login.');
      setState(prev => ({ ...prev, view: 'login' }));
      return;
    }

    setState(prev => {
      const existing = prev.cart.find(item => item.activeSalt === med.activeSalt);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(item => 
            item.activeSalt === med.activeSalt 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
          )
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { ...med, quantity: 1 } as CartItem]
      };
    });
  };

  const mapCatalogMedicineToPrescription = (
    medicine: CatalogMedicine,
    selectedType: 'brand' | 'generic'
  ): PrescriptionMedicine => {
    const drugClass = medicine.chronic_keywords || 'General care';
    const uses = medicine.uses || medicine.health_issues || medicine.generic_name;
    const selectedPrice = selectedType === 'brand' ? medicine.brand_price : medicine.generic_price;
    const savingsAmount = Math.max(0, medicine.brand_price - medicine.generic_price);
    const savingsPercentage = medicine.brand_price > 0
      ? Math.round((savingsAmount / medicine.brand_price) * 100)
      : 0;

    return {
      originalName: medicine.brand_name,
      activeSalt: medicine.generic_name,
      strength: medicine.generic_name,
      manufacturer: medicine.manufacturer || 'OurPharma Partner',
      brandedPrice: medicine.brand_price,
      genericPrice: selectedPrice,
      genericBrandName: selectedType === 'brand' ? `${medicine.brand_name} (Brand)` : medicine.generic_name,
      tabletCount: 10,
      availability: 'In Stock',
      deliveryTime: '2 Hours',
      savingsPercentage,
      savingsAmount,
      monthlySavings: savingsAmount,
      benefits: ['Verified molecular match', 'Lower out-of-pocket cost', 'Fast local fulfillment'],
      rxRequired: true,
      isNarcotic: false,
      drugClass,
      uses,
      sideEffects: 'Use only as advised by a qualified clinician.',
      dosage: 'Follow your doctor\'s prescription and label directions.',
      category: drugClass.toLowerCase().includes('chronic') ? 'Chronic Care' : 'General Care'
    };
  };

  const handleAddCatalogToCart = (medicine: CatalogMedicine, selectedType: 'brand' | 'generic') => {
    addToCart(mapCatalogMedicineToPrescription(medicine, selectedType));
  };

  const updateQuantity = (salt: string, delta: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item => {
        if (item.activeSalt === salt) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  };

  const removeFromCart = (salt: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.activeSalt !== salt)
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setState(prev => ({ ...prev, user: null, view: 'landing' }));
  };

  const openMedicalConsultation = (reason?: string) => {
    setConsultationReason(reason?.trim() || 'General medical consultation');
    setState((prev) => ({ ...prev, view: 'consultation' }));
  };

  const setView = (v: ViewState) => setState(prev => ({ ...prev, view: v }));

  const reset = () => {
    setState(prev => ({
      ...prev,
      view: 'landing',
      isAnalyzing: false,
      error: null,
      result: null,
      imagePreview: null,
    }));
  };

  const t = translations[state.language];

  if (isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4fbf5] text-slate-900">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-700">Loading Session...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${state.theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-[#f4fbf5] text-slate-900'}`}>
      <Header 
        onSignInClick={() => setView('login')} 
        user={state.user} 
        onLogoClick={reset}
        cartCount={state.cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => {
          if (!session) {
            setAuthPrompt('Please login to place orders. You can continue exploring the website without login.');
            setState(prev => ({ ...prev, view: 'login' }));
            return;
          }

          setView('checkout');
        }}
        language={state.language}
        onLanguageChange={(lang) => setState(prev => ({ ...prev, language: lang }))}
        theme={state.theme}
        onThemeToggle={() => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
        onViewChange={setView}
        locationLabel={locationLabel}
        pincode={state.pincode}
        isDetectingLocation={isDetectingLocation}
        onDetectLocation={detectLocation}
        onPincodeChange={(pincode) => setState(prev => ({ ...prev, pincode }))}
      />
      
      <main className="flex-grow">
        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <div className={`grid min-h-11 grid-cols-3 rounded-full p-1 backdrop-blur-lg ${state.theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-emerald-100 bg-white/95 shadow-[0_16px_34px_-24px_rgba(22,163,74,0.35)]'}`}>
            <button
              onClick={() => setView('landing')}
              className={`min-h-11 min-w-28 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                state.view === 'landing'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : (state.theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-600')
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => setView('medicines')}
              className={`min-h-11 min-w-28 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                state.view === 'medicines'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : (state.theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-600')
              }`}
            >
              {t.medicines}
            </button>
            <button
              onClick={() => setView('experts')}
              className={`min-h-11 min-w-28 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                state.view === 'experts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : (state.theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-600')
              }`}
            >
              {t.experts}
            </button>
          </div>
          {session ? (
            <button
              onClick={handleLogout}
              className="min-h-11 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition duration-200 hover:bg-emerald-700"
            >
              {t.logout}
            </button>
          ) : (
            <button
              onClick={() => setView('login')}
              className="min-h-11 rounded-full border border-emerald-600 bg-transparent px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 transition duration-200 hover:bg-emerald-600 hover:text-white"
            >
              {t.login}
            </button>
          )}
        </div>

        <AnimatePresence mode="sync">
        {(state.view === 'login' || state.view === 'forgot-password') && (
          <motion.div key="login" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.38 }} className="relative mx-auto mt-4 w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
            <div className={`absolute inset-x-0 top-0 -z-10 h-72 rounded-3xl ${state.theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(0,208,132,0.2),_transparent_65%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_65%)]'}`}></div>
            {authPrompt && (
              <div className="mb-4 rounded-xl border border-[#48BB78]/30 bg-[#48BB78]/10 px-4 py-3 text-sm font-semibold text-[#48BB78]">
                {authPrompt}
              </div>
            )}
            <Auth
              theme={state.theme}
              onAuthSuccess={() => {
                setAuthPrompt('');
                setState(prev => ({ ...prev, view: 'landing' }));
              }}
            />
          </motion.div>
        )}

        {state.view === 'medicines' && (
          <motion.div key="medicines" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.38 }}>
            <MedicineSearch onAddToCart={handleAddCatalogToCart} onBookMedicalConsultation={openMedicalConsultation} theme={state.theme} language={state.language} />
          </motion.div>
        )}

        {state.view === 'experts' && (
          <motion.div key="experts" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.38 }}>
            <ExpertConsult onBookMedicalConsultation={() => openMedicalConsultation('Direct medical consultation with Dr. Anil Dhingra')} />
          </motion.div>
        )}

        {state.view === 'consultation' && (
          <motion.div key="consultation" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.38 }}>
            <ConsultationBooking theme={state.theme} onClose={() => setView('experts')} reason={consultationReason} />
          </motion.div>
        )}

        {state.view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <PremiumLanding
              language={state.language}
              locationLabel={locationLabel}
              featuredMedicines={featuredMedicines}
              founders={founders}
              onUpload={handleUpload}
              onBrowseMedicines={() => setView('medicines')}
              onTalkToExpert={() => setView('experts')}
              onAddCatalogToCart={handleAddCatalogToCart}
              isAnalyzing={state.isAnalyzing}
            />
          </motion.div>
        )}

        {state.view === 'about' && (
          <motion.div key="about" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">About Our Pharma</h1>
              <p className="text-[#48BB9F] font-black uppercase tracking-widest text-xs">Hyperlocal • Intelligent • Transparent</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-12 shadow-2xl shadow-slate-200 dark:shadow-slate-950/50 space-y-12">
              <section>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong>Our Pharma</strong> is a Hyperlocal Medicine Delivery System with Intelligent Substitute Mapping. Approved for excellence, we solve the struggle of medication unavailability and rising healthcare costs.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[#48BB9F] font-black uppercase text-[10px] tracking-widest">Problem Description</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Patients often struggle with the unavailability of specific medicine brands in local pharmacies and the rising costs of healthcare. Our Pharma provides real-time visibility into local pharmacy stock.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[#48BB9F] font-black uppercase text-[10px] tracking-widest">Intelligent Solution</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Our platform includes an intelligent recommendation engine that suggests cheaper, chemically equivalent substitutes (generics), potentially saving users up to 50% on medical bills.
                  </p>
                </div>
              </div>

              <section className="bg-emerald-50/70 dark:bg-slate-800/50 rounded-[32px] p-8 border border-emerald-100 dark:border-emerald-950/40">
                <h4 className="text-slate-900 dark:text-white font-black text-lg mb-6 tracking-tight">Key Objectives</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#48BB9F] flex items-center justify-center text-white text-xs font-black shrink-0">1</div>
                    <div>
                      <h5 className="text-slate-900 dark:text-white font-black text-xs uppercase mb-1">Availability</h5>
                      <p className="text-[10px] text-slate-500 leading-tight">Map local pharmacy inventories for instant location.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#48BB9F] flex items-center justify-center text-white text-xs font-black shrink-0">2</div>
                    <div>
                      <h5 className="text-slate-900 dark:text-white font-black text-xs uppercase mb-1">Affordability</h5>
                      <p className="text-[10px] text-slate-500 leading-tight">Identify low-cost substitutes with identical salts.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#48BB9F] flex items-center justify-center text-white text-xs font-black shrink-0">3</div>
                    <div>
                      <h5 className="text-slate-900 dark:text-white font-black text-xs uppercase mb-1">Efficiency</h5>
                      <p className="text-[10px] text-slate-500 leading-tight">Facilitate 2-hour delivery via hyperlocal logistics.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#48BB9F] flex items-center justify-center text-white text-xs font-black shrink-0">4</div>
                    <div>
                      <h5 className="text-slate-900 dark:text-white font-black text-xs uppercase mb-1">Security</h5>
                      <p className="text-[10px] text-slate-500 leading-tight">Secure portal for digital Rx verification.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-[#48BB9F]/5 dark:bg-[#48BB9F]/10 rounded-[32px] p-8 border border-[#48BB9F]/20">
                <h4 className="text-[#48BB9F] font-black text-lg mb-4 tracking-tight">Proposed Solution Architecture</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Built on a high-performance web architecture, Our Pharma allows seamless searches, nearby availability mapping, and instant generic matching. It includes a secure prescription management system and a integrated logistics interface for rapid fulfillment.
                </p>
              </section>
            </div>
            
            <div className="mt-12 text-center">
              <motion.button onClick={() => setView('landing')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="bg-[#48BB9F] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition shadow-lg shadow-emerald-900/20">
                Back to Scanner
              </motion.button>
            </div>
          </motion.div>
        )}

        {state.view === 'founders' && (
          <motion.div key="founders" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-20">
              <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">The Minds Behind Our Pharma</h1>
              <p className="text-slate-400 dark:text-slate-500 max-w-xl mx-auto font-medium">A diverse team committed to democratizing healthcare access in India.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {founders.map((founder, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08, type: 'spring', stiffness: 240, damping: 22 }} whileHover={{ y: -6, transition: { duration: 0.22 } }} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-10 text-center shadow-2xl shadow-slate-100 dark:shadow-slate-950/30 group hover:border-[#48BB9F] transition-colors duration-300">
                  <FounderAvatar
                    name={founder.name}
                    image={founder.image}
                    className="mx-auto mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[32px] bg-[#48BB9F]/10 text-3xl font-black text-[#48BB9F] object-cover group-hover:bg-[#48BB9F] group-hover:text-white transition-all"
                  />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{founder.name}</h3>
                  <p className="text-[#48BB9F] text-[10px] font-black uppercase tracking-widest mb-8">{founder.role}</p>
                  
                  <div className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <a href={`mailto:${founder.email}`} className="block text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-[#48BB9F] transition">
                      {founder.email}
                    </a>
                    <a href={`tel:${founder.phone}`} className="block text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-[#48BB9F] transition">
                      {founder.phone}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-[60px] bg-gradient-to-br from-emerald-600 to-emerald-700 p-16 text-center text-white">
               <div className="relative z-10">
                 <h2 className="text-4xl font-black tracking-tighter mb-6">Building for a Healthier India</h2>
                 <p className="mx-auto mb-12 max-w-2xl font-medium text-emerald-50/85">Established in 2024 with a vision of radical price transparency in the pharmaceutical sector. We are hyperlocal, bio-equivalent focused, and patient-first.</p>
                 <motion.button onClick={() => setView('landing')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="rounded-3xl bg-white px-12 py-5 text-sm font-black uppercase tracking-widest text-emerald-700 shadow-2xl shadow-emerald-900/30 transition hover:brightness-110">
                   Back to Home
                 </motion.button>
               </div>
               <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
          </motion.div>
        )}

        {state.view === 'admin' && <AdminDashboard />}

        {state.view === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="max-w-2xl mx-auto mt-24 p-16 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/40 rounded-[60px] text-center shadow-[0_40px_110px_-70px_rgba(16,185,129,0.55)] transition-colors">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-rose-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Scan Failed</h2>
            <p className="text-slate-400 dark:text-slate-500 mb-12 font-medium leading-relaxed">{state.error}</p>
            <motion.button 
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-emerald-600 text-white px-16 py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {state.view === 'analysis' && state.result && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <AnalysisResult 
              data={state.result} 
              onReset={reset} 
              onAddToCart={addToCart}
            />
          </motion.div>
        )}

        {state.view === 'checkout' && (
          <motion.div key="checkout" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <Checkout 
              cart={state.cart}
              theme={state.theme}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClose={() => setView(state.result ? 'analysis' : 'landing')}
              onClearCart={() => setState(prev => ({ ...prev, cart: [] }))}
              onBookMedicalConsultation={openMedicalConsultation}
            />
          </motion.div>
        )}

        {state.view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            <ProfileEditor theme={state.theme} onClose={() => setView('landing')} />
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-emerald-100 bg-white/80 py-24 text-slate-500 backdrop-blur dark:border-emerald-950/40 dark:bg-slate-950 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-black text-lg text-white">G</div>
                <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Our<span className="text-emerald-600">Pharma</span></span>
              </div>
              <p className="mb-10 text-xs font-medium leading-relaxed opacity-80">
                Your Prescription. Faster. Smarter. Cheaper. Generic medicine transparency for a healthier India. We deliver bio-equivalent medicines within 2 hours.
              </p>
              <div className="space-y-4">
                <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Official Contact</h4>
                <a href="tel:7827664217" className="flex items-center gap-2 text-xs font-bold transition hover:text-emerald-600">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  +91 7827664217
                </a>
                <a href="mailto:contact@ourpharma.in" className="flex items-center gap-2 text-xs font-bold transition hover:text-emerald-600">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  contact@ourpharma.in
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <h4 className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Our Founders</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {founders.map((founder, idx) => (
                  <div key={idx} className="group cursor-pointer rounded-[32px] border border-emerald-100 bg-emerald-50/60 p-6 transition hover:border-emerald-300" onClick={() => setView('founders')}>
                    <FounderAvatar
                      name={founder.name}
                      image={founder.image}
                      className="mb-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white font-black text-emerald-600 object-cover transition group-hover:bg-emerald-600 group-hover:text-white"
                    />
                    <h5 className="mb-1 text-sm font-black text-slate-900 dark:text-white">{founder.name}</h5>
                    <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-600">{founder.role}</p>
                    <div className="space-y-1 opacity-40 group-hover:opacity-100 transition">
                      <p className="text-[9px] font-bold truncate">{founder.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-between gap-6 border-t border-emerald-100 pt-12 md:flex-row dark:border-emerald-950/40">
            <div className="flex items-center gap-6">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">© 2024 Our Pharma Pvt Ltd. Hyperlocal Medicine Delivery System.</p>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Express Delivery Priority
               </div>
            </div>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest opacity-50">
              <button onClick={() => setView('about')} className="hover:opacity-100 transition">About Us</button>
              <button onClick={() => setView('founders')} className="hover:opacity-100 transition">Meet Founders</button>
              <a href="#" className="hover:opacity-100 transition">Privacy</a>
              <a href="#" className="hover:opacity-100 transition">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating chat assistant – always visible */}
      <ChatBot theme={state.theme} language={state.language} />
      <Analytics />
    </div>
  );
};

export default App;
