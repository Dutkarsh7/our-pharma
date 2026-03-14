
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Medicine } from '../types';

interface MedicineCardProps {
  med: Medicine;
  onAddToCart?: (med: Medicine) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ med, onAddToCart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(med);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <motion.div
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
    >
      <div className="p-10 flex flex-col xl:flex-row gap-12">
        <div className="xl:w-1/4 flex flex-col justify-center border-b border-emerald-100 pb-8 xl:border-b-0 xl:border-r xl:pb-0 dark:border-emerald-950/40">
          <div className="inline-flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Active Molecule
          </div>
          <h4 className="text-2xl font-black text-[#F7FAFC] tracking-tight mb-2">{med.activeSalt}</h4>
          <p className="text-xs text-[#A0AEC0] font-bold uppercase tracking-widest mb-6">{med.strength}</p>
          
          <div className="space-y-3">
             {med.benefits.slice(0, 2).map((benefit, i) => (
               <div key={i} className="flex items-start gap-2">
                 <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                 <span className="text-[10px] font-bold text-[#A0AEC0] leading-tight">{benefit}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors">
            <span className="absolute -top-3 left-6 rounded-full border border-white/10 bg-[#0B1F1C] px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#A0AEC0] transition-colors">Branded Price</span>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-[#F7FAFC] mb-1">{med.originalName}</h3>
                <p className="text-[10px] text-[#A0AEC0] font-bold uppercase leading-none">{med.manufacturer || 'Original Lab'}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#A0AEC0] line-through">₹{med.brandedPrice}</span>
              <span className="text-[10px] text-[#A0AEC0] font-bold uppercase">Standard</span>
            </div>
            <p className="mt-2 text-[9px] text-[#A0AEC0] font-bold opacity-70 uppercase tracking-widest">₹{(med.brandedPrice / (med.tabletCount || 10)).toFixed(1)} / Unit</p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors">
            <div className="absolute -top-3 left-6 rounded-full bg-[#00D084] px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#0B1F1C]">Identical Salt Match</div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-[#00D084] mb-1">{med.genericBrandName}</h3>
                <p className="text-[10px] text-[#A0AEC0] font-bold uppercase leading-none">Generic Alternative</p>
              </div>
              <div className="rounded-lg bg-[#48BB78]/20 px-2 py-1 text-[9px] font-black uppercase text-[#48BB78]">-{med.savingsPercentage}%</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#00D084]">₹{med.genericPrice}</span>
              <span className="text-xs font-black text-[#48BB78] bg-[#48BB78]/10 px-2 py-1 rounded-lg border border-[#48BB78]/30">Save ₹{med.savingsAmount}</span>
            </div>
            <p className="mt-2 text-[9px] text-[#A0AEC0] font-bold uppercase tracking-widest">₹{(med.genericPrice / (med.tabletCount || 10)).toFixed(1)} / Unit</p>
          </div>
        </div>

          <div className="xl:w-1/5 flex flex-col justify-center border-t border-emerald-100 pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0 dark:border-emerald-950/40">
           <div className="mb-6 text-center xl:text-left">
              <div className="flex items-center justify-center xl:justify-start gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black text-[#F7FAFC] uppercase tracking-widest">In Stock</span>
              </div>
              <p className="text-[11px] text-[#A0AEC0] font-bold uppercase tracking-widest">Express: <span className="text-[#48BB78]">2 Hours Delivery</span></p>
           </div>
           
          <motion.button 
             onClick={handleAdd}
             disabled={med.isNarcotic}
             className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
               isAdded 
                  ? 'bg-[#00D084] text-[#0B1F1C]' 
               : med.isNarcotic 
                    ? 'bg-white/10 text-[#A0AEC0] cursor-not-allowed shadow-none' 
                  : 'border border-[#00D084] bg-[#00D084] text-[#0B1F1C]'
             }`}
             whileHover={!med.isNarcotic ? { scale: 1.05 } : {}}
             whileTap={!med.isNarcotic ? { scale: 0.95 } : {}}
           >
              {isAdded ? 'Added ✓' : med.isNarcotic ? 'Restricted' : 'Add To Pharmacy Cart'}
           </motion.button>
           
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="mt-4 text-[9px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] hover:text-[#00D084] transition text-center"
           >
              {isExpanded ? 'Hide Details' : 'Salt Efficacy'}
           </button>
        </div>
      </div>

      {isExpanded && (
        <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
          className="overflow-hidden px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-10"
        >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h5 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#A0AEC0]">How it works</h5>
              <p className="text-sm leading-relaxed font-medium text-[#A0AEC0]">{med.uses}</p>
           </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
              <h5 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#00D084]">Bio-Equivalent Proof</h5>
              <p className="text-sm leading-relaxed font-medium text-[#A0AEC0]">
               The active molecule <span className="font-bold text-[#00D084]">{med.activeSalt}</span> in {med.genericBrandName} matches the pharmacopoeia standards of {med.originalName}. It undergoes the same dissolution and metabolic path in the human body.
              </p>
           </div>
        </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default MedicineCard;
