import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

const fallbackImage = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400';

const CatalogMedicineCard: React.FC<CatalogProps> = ({ medicine, onAddCatalogToCart }) => {
  const savings = Math.max(0, medicine.brand_price - medicine.generic_price);
  const discount = medicine.brand_price > 0 ? Math.round((savings / medicine.brand_price) * 100) : 0;
  const tags = medicine.health_issues
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-green-900 bg-gray-900 shadow-[0_18px_45px_-30px_rgba(22,163,74,0.55)]"
      whileHover={{ y: -5, boxShadow: '0 24px 56px -28px rgba(22, 163, 74, 0.7)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="relative h-40 w-full overflow-hidden border-b border-green-900/60">
        <img
          src={medicine.imageUrl || fallbackImage}
          alt={medicine.brand_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#16a34a] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          {discount}% OFF
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-black text-white">{medicine.brand_name}</h3>
          <p className="text-sm font-semibold text-green-400">{medicine.generic_name}</p>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-2xl font-black text-white">₹{medicine.generic_price}</span>
          <span className="pb-1 text-sm text-gray-400 line-through">₹{medicine.brand_price}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-green-800 bg-green-950 px-2 py-1 text-[10px] font-semibold text-green-300">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddCatalogToCart(medicine, 'generic')}
            className="rounded-xl bg-[#16a34a] px-3 py-2 text-xs font-black uppercase tracking-widest text-white"
          >
            ADD GENERIC
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddCatalogToCart(medicine, 'brand')}
            className="rounded-xl border border-[#16a34a] px-3 py-2 text-xs font-black uppercase tracking-widest text-green-400"
          >
            ADD BRAND
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const LegacyPrescriptionCard: React.FC<LegacyProps> = ({ med, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    if (!onAddToCart) return;
    onAddToCart(med);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-5"
      whileHover={{ y: -5, boxShadow: '0 20px 50px -28px rgba(22, 163, 74, 0.6)' }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs font-black uppercase tracking-widest text-[#A0AEC0]">{med.activeSalt}</p>
      <h4 className="mt-2 text-lg font-black text-[#F7FAFC]">{med.originalName}</h4>
      <p className="mt-1 text-sm font-semibold text-[#00D084]">{med.genericBrandName}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-black text-[#00D084]">₹{med.genericPrice}</span>
        <span className="pb-1 text-sm text-[#A0AEC0] line-through">₹{med.brandedPrice}</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-[#48BB78]">Save ₹{med.savingsAmount}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        className="mt-4 w-full rounded-xl bg-[#16a34a] py-2.5 text-xs font-black uppercase tracking-widest text-white"
      >
        {isAdded ? 'ADDED' : 'ADD GENERIC'}
      </motion.button>
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
