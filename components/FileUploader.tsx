
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface FileUploaderProps {
  onUpload: (base64: string) => void;
  isAnalyzing: boolean;
  language: Language;
}

const copy = {
  en: {
    badFile: 'Please upload an image file.',
    badge: 'Identical Salt Match Engine',
    title: 'Upload Prescription',
    desc: 'Drop your prescription and we will map branded medicine to matching generic salts, compare prices, and prepare a ready-to-order pharmacy basket.',
    oneCartTitle: 'One Cart For All Repeats',
    oneCartDesc: 'Build one monthly basket for diabetes, cardiac, thyroid, and everyday care with cheaper identical-salt substitutes.',
    verifiedTitle: 'Verified Identical Molecules',
    verifiedDesc: 'Every recommendation is presented as a same-salt alternative so the customer sees why the generic and branded option are clinically aligned.',
    loadingTitle: 'Extracting Molecular Data...',
    loadingSub: 'Checking 20,000+ Generic Matches',
  },
  hi: {
    badFile: 'कृपया इमेज फाइल अपलोड करें।',
    badge: 'आइडेंटिकल साल्ट मैच इंजन',
    title: 'प्रिस्क्रिप्शन अपलोड करें',
    desc: 'अपना प्रिस्क्रिप्शन अपलोड करें, हम ब्रांडेड दवाओं को मिलते-जुलते जेनेरिक साल्ट से मैच करके कीमत तुलना और ऑर्डर बास्केट तैयार करेंगे।',
    oneCartTitle: 'हर महीने की दवाइयों के लिए एक कार्ट',
    oneCartDesc: 'डायबिटीज, कार्डियक, थायरॉइड और रोजमर्रा की दवाइयों के लिए एक ही बास्केट बनाएं।',
    verifiedTitle: 'सत्यापित समान मॉलिक्यूल',
    verifiedDesc: 'हर सुझाव में वही साल्ट दिखाया जाता है ताकि ग्राहक ब्रांड और जेनेरिक का मिलान समझ सके।',
    loadingTitle: 'मॉलिक्यूल डेटा निकाला जा रहा है...',
    loadingSub: '20,000+ जेनेरिक मैच जांचे जा रहे हैं',
  },
} as const;

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isAnalyzing, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const t = language === 'hi' ? copy.hi : copy.en;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t.badFile);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onUpload(base64.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-16 px-6"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div 
        className={`relative overflow-hidden rounded-[48px] border-[3px] border-dashed p-20 text-center transition-all ${
          dragActive 
          ? 'border-emerald-400 bg-emerald-50 scale-[1.02]' 
          : 'border-emerald-200 bg-white shadow-[0_28px_70px_-50px_rgba(22,163,74,0.35)] hover:border-emerald-400 hover:bg-emerald-50/50'
        } ${isAnalyzing ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-b-[48px] bg-gradient-to-b from-emerald-100 to-transparent"></div>
        
        <div className="flex flex-col items-center">
          <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_22px_44px_-24px_rgba(22,163,74,0.6)] transition-transform group-hover:scale-110">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <span className="mb-4 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">{t.badge}</span>
          <h2 className="mb-4 text-4xl font-black tracking-tighter text-slate-900">{t.title}</h2>
          <p className="mb-12 max-w-xl mx-auto text-sm font-medium leading-relaxed text-slate-600">
            {t.desc}
          </p>
          <div className="flex gap-4">
            <span className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">JPEG / PNG</span>
            <span className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">Max 10MB</span>
          </div>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-8 rounded-[48px] bg-white/95 backdrop-blur-md">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-[6px] border-emerald-100"></div>
              <div className="absolute inset-0 h-24 w-24 animate-spin rounded-full border-[6px] border-emerald-600 border-t-transparent"></div>
            </div>
            <div className="text-center">
              <p className="mb-2 text-2xl font-black tracking-tight text-slate-900">{t.loadingTitle}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">{t.loadingSub}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-start gap-6 rounded-2xl border border-emerald-100 bg-white p-8 shadow-[0_18px_44px_-34px_rgba(22,163,74,0.3)]"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h4 className="mb-2 text-lg font-black text-slate-900">{t.oneCartTitle}</h4>
            <p className="text-xs font-medium leading-relaxed text-slate-600">{t.oneCartDesc}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-start gap-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-8 text-slate-900 shadow-[0_18px_44px_-34px_rgba(22,163,74,0.26)]"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3a9.99 9.99 0 00-4.534 1.08l.094.053m0 0c-1.287.721-2.432 1.677-3.396 2.809m16.422 13.844A9.904 9.904 0 0112 21c-3.158 0-6.017-1.467-7.893-3.758" /></svg>
          </div>
          <div>
            <h4 className="mb-2 text-lg font-black">{t.verifiedTitle}</h4>
            <p className="text-xs font-medium leading-relaxed text-slate-600">{t.verifiedDesc}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FileUploader;
