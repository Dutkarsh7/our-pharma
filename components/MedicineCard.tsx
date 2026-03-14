import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Building2, Pill, CircleAlert, IndianRupee, ShieldCheck, X } from 'lucide-react';
import type { Medicine as PrescriptionMedicine } from '../types';
import type { Medicine as CatalogMedicine } from '../src/data/medicines';

type LegacyProps = {
  med: PrescriptionMedicine;
  onAddToCart?: (med: PrescriptionMedicine) => void;
  medicine?: never;
  onAddCatalogToCart?: never;
};

type CatalogProps = {
  medicine: CatalogMedicine;
  onAddCatalogToCart: (medicine: CatalogMedicine, selectedType: 'brand' | 'generic') => void;
  med?: never;
  onAddToCart?: never;
};

type MedicineCardProps = LegacyProps | CatalogProps;

const fallbackImage = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"%3E%3Crect width="640" height="420" rx="32" fill="%23eff6ff"/%3E%3Cg fill="none" stroke="%230f766e" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M225 162c0-28 23-51 51-51h34c28 0 51 23 51 51v96c0 28-23 51-51 51h-34c-28 0-51-23-51-51z"/%3E%3Cpath d="M320 111v198"/%3E%3Cpath d="M245 210h150"/%3E%3C/g%3E%3C/svg%3E';

const getUses = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getSideEffects = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return (value ?? 'Nausea, mild dizziness, stomach discomfort')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const CatalogMedicineCard: React.FC<CatalogProps> = ({ medicine, onAddCatalogToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(medicine.imageUrl || fallbackImage);
  const uses = useMemo(() => getUses(medicine.uses || medicine.health_issues), [medicine.uses, medicine.health_issues]);
  const sideEffects = useMemo(() => getSideEffects(medicine.side_effects || medicine.sideEffects), [medicine.side_effects, medicine.sideEffects]);
  const savings = Math.max(0, medicine.brand_price - medicine.generic_price);
  const discount = medicine.brand_price > 0 ? Math.round((savings / medicine.brand_price) * 100) : 0;
  const manufacturer = medicine.manufacturer || 'Our Pharma Verified Partner';

  return (
    <>
      <motion.div
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_-26px_rgba(15,23,42,0.22)]"
        whileHover={{ y: -5, boxShadow: '0 22px 52px -24px rgba(15, 23, 42, 0.28)' }}
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
      >
        <button type="button" onClick={() => setIsOpen(true)} className="block w-full text-left">
          <div className="relative h-44 overflow-hidden border-b border-slate-200 bg-slate-50">
            <img
              src={imageSrc}
              alt={medicine.brand_name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageSrc(fallbackImage)}
            />
            <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
              {discount}% OFF
            </span>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-lg font-black text-slate-900">{medicine.brand_name}</h3>
              <p className="text-sm font-semibold text-teal-700">{medicine.generic_name}</p>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-900">₹{medicine.generic_price}</span>
              <span className="pb-1 text-sm text-slate-400 line-through">₹{medicine.brand_price}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {uses.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddCatalogToCart(medicine, 'generic');
                }}
                className="rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-white"
              >
                ADD GENERIC
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddCatalogToCart(medicine, 'brand');
                }}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700"
              >
                ADD BRAND
              </motion.button>
            </div>
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-teal-600">Medicine details</p>
                  <h3 className="text-xl font-black text-slate-900">{medicine.brand_name}</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                    <img src={imageSrc} alt={medicine.brand_name} className="h-64 w-full object-cover" onError={() => setImageSrc(fallbackImage)} />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ShieldCheck className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-semibold">Reviewed in a pharmacist-led substitution workflow before dispatch.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-5">
                      <div className="mb-3 flex items-center gap-2 text-slate-500"><Pill className="h-4 w-4 text-teal-600" /><span className="text-[11px] font-black uppercase tracking-[0.24em]">Composition</span></div>
                      <p className="text-lg font-black text-slate-900">{medicine.generic_name}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-5">
                      <div className="mb-3 flex items-center gap-2 text-slate-500"><Building2 className="h-4 w-4 text-teal-600" /><span className="text-[11px] font-black uppercase tracking-[0.24em]">Manufacturer</span></div>
                      <p className="text-lg font-black text-slate-900">{manufacturer}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-500"><BadgeCheck className="h-4 w-4 text-blue-600" /><span className="text-[11px] font-black uppercase tracking-[0.24em]">Primary indications</span></div>
                    <div className="flex flex-wrap gap-2">
                      {uses.map((use) => (
                        <span key={use} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{use}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-500"><CircleAlert className="h-4 w-4 text-amber-500" /><span className="text-[11px] font-black uppercase tracking-[0.24em]">Common side effects</span></div>
                    <div className="flex flex-wrap gap-2">
                      {sideEffects.map((effect) => (
                        <span key={effect} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{effect}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-500"><IndianRupee className="h-4 w-4 text-teal-600" /><span className="text-[11px] font-black uppercase tracking-[0.24em]">Brand vs generic comparison</span></div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ethical / Brand Alternative</p>
                        <p className="mt-2 text-lg font-black text-slate-900">{medicine.brand_name}</p>
                        <p className="mt-2 text-3xl font-black text-slate-900">₹{medicine.brand_price}</p>
                      </div>
                      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600">Generic Alternative</p>
                        <p className="mt-2 text-lg font-black text-slate-900">{medicine.generic_name}</p>
                        <p className="mt-2 text-3xl font-black text-teal-700">₹{medicine.generic_price}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Exact savings</p>
                        <p className="text-2xl font-black">₹{savings}</p>
                      </div>
                      <div className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black">{discount}% saved</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAddCatalogToCart(medicine, 'generic')} className="rounded-2xl bg-teal-600 py-3 text-sm font-black uppercase tracking-widest text-white">
                      ADD GENERIC
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAddCatalogToCart(medicine, 'brand')} className="rounded-2xl border border-slate-300 py-3 text-sm font-black uppercase tracking-widest text-slate-700">
                      ADD BRAND
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const LegacyPrescriptionCard: React.FC<LegacyProps> = ({ med, onAddToCart }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" whileHover={{ y: -4, boxShadow: '0 18px 48px -28px rgba(15, 23, 42, 0.24)' }} transition={{ type: 'spring', stiffness: 220, damping: 28 }}>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr_auto]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Active salt</p>
          <h4 className="mt-2 text-xl font-black text-slate-900">{med.activeSalt}</h4>
          <p className="mt-1 text-sm font-medium text-slate-500">{med.uses}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Brand</p>
            <p className="mt-2 font-black text-slate-900">{med.originalName}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">₹{med.brandedPrice}</p>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600">Generic</p>
            <p className="mt-2 font-black text-slate-900">{med.genericBrandName}</p>
            <p className="mt-2 text-2xl font-black text-teal-700">₹{med.genericPrice}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAddToCart?.(med)} className="rounded-2xl bg-teal-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
            Add Generic
          </motion.button>
          <button onClick={() => setIsExpanded((value) => !value)} className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600">
            {isExpanded ? 'Hide details' : 'View details'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Manufacturer</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{med.manufacturer}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Common side effects</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{med.sideEffects}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Price difference</p>
                <p className="mt-2 text-sm font-semibold text-teal-700">Save ₹{med.savingsAmount} ({med.savingsPercentage}%)</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  if ('medicine' in props && props.medicine) {
    return <CatalogMedicineCard medicine={props.medicine} onAddCatalogToCart={props.onAddCatalogToCart} />;
  }

  return <LegacyPrescriptionCard med={props.med} onAddToCart={props.onAddToCart} />;
};

export default MedicineCard;
