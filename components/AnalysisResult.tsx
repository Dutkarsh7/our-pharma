
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { PrescriptionAnalysis, Medicine } from '../types';
import MedicineCard from './MedicineCard';

interface AnalysisResultProps {
  data: PrescriptionAnalysis;
  onReset: () => void;
  onAddToCart: (med: Medicine) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReset, onAddToCart }) => {
  const groupedMeds = useMemo(() => {
    return data.medicines.reduce((acc: Record<string, Medicine[]>, med) => {
      const cat = med.category || 'General Care';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(med);
      return acc;
    }, {} as Record<string, Medicine[]>);
  }, [data.medicines]);

  return (
    <motion.div
      className="max-w-7xl mx-auto mt-12 px-6 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-slate-700 shadow-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <p className="text-sm font-medium leading-relaxed">
          <span className="font-semibold text-slate-900">Verified by Clinical Pharmacist.</span> This digital prescription mapping is strictly reviewed and authorized by a registered pharmacist before dispatch. Generic substitution complies with CDSCO guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition-colors lg:col-span-2">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Monthly Savings</p>
                <h2 className="text-7xl font-black tracking-tighter text-slate-900">₹{data.monthlySavingsTotal.toLocaleString('en-IN')}</h2>
              </div>
              <div className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
                One-Stop Basket
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Annual Impact</p>
                <p className="text-xl font-black text-slate-900">₹{(data.monthlySavingsTotal * 12).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Efficiency</p>
                <p className="text-xl font-black text-slate-900">{Math.round((data.totalSavings / (data.totalBrandedCost || 1)) * 100)}% Lower</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-sky-100 blur-3xl"></div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-10 text-slate-900 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Diagnosis Summary</h3>
          <p className="text-3xl font-black tracking-tight leading-none mb-6">
            {data.detectedCondition || 'General Health'}
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
             <p className="text-[11px] font-bold leading-relaxed text-slate-600">{data.patientAdvice}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-10 shadow-sm transition-colors">
          <div>
            <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fulfillment</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Mumbai Metro</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Priority Hub</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-teal-600">2 Hours Delivery</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Instant Slot</p>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onReset} className="mt-8 min-h-11 w-full rounded-xl border border-blue-600 bg-blue-600 py-3 text-[10px] font-black uppercase tracking-widest text-white transition duration-200 hover:bg-blue-700">
            Scan Another
          </button>
        </div>
      </div>

      <div className="space-y-20">
        {Object.entries(groupedMeds).map(([category, meds]: [string, Medicine[]], catIdx) => (
          <motion.div
            key={category}
            className="space-y-8"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: catIdx * 0.05, duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight capitalize">{category}</h3>
              <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-teal-600"><BadgeCheck className="h-3 w-3" />{meds.length} Matches Found</span>
            </div>
            <div className="space-y-6">
              {meds.map((med, idx) => (
                <MedicineCard key={idx} med={med} onAddToCart={onAddToCart} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnalysisResult;
