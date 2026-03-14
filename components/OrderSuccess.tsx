import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Theme } from '../types';

interface OrderSuccessProps {
  theme: Theme;
  orderId: string;
  totalAmount: number;
  onGoHome: () => void;
}

const ConfettiPiece: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <motion.div
    className="absolute top-0 w-2 h-3 rounded-sm"
    style={{ left: `${x}%`, background: color }}
    initial={{ y: -20, opacity: 1, rotate: 0 }}
    animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720 }}
    transition={{ duration: 3.5 + Math.random(), delay, ease: 'easeIn' }}
  />
);

const CONFETTI_COLORS = ['#00D084', '#48BB78', '#F6E05E', '#FC8181', '#9F7AEA', '#4299E1'];
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  delay: Math.random() * 1.2,
  x: Math.random() * 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, delay: 0.3, ease: 'easeOut' } },
};

const iconRingVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } },
};

const OrderSuccess: React.FC<OrderSuccessProps> = ({ theme, orderId, totalAmount, onGoHome }) => {
  const isDark = theme === 'dark';
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  return (
    <div className="relative overflow-hidden min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Confetti burst */}
      {CONFETTI.map((p) => (
        <ConfettiPiece key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 30%, rgba(0,208,132,0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle at 50% 30%, rgba(0,208,132,0.13) 0%, transparent 65%)',
        }}
      />

      <motion.div
        className="w-full max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Check icon */}
        <motion.div className="flex justify-center mb-8" variants={iconRingVariants}>
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-[40px]"
            style={{ background: isDark ? 'rgba(0,208,132,0.15)' : 'rgba(0,208,132,0.12)', border: '3px solid #00D084' }}
          >
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-[40px] border-2 border-[#00D084]"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            />
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#00D084" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 13l4 4L19 7" variants={checkVariants} />
            </svg>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className={`rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-[#0A1A17] border border-white/10' : 'bg-white border border-emerald-100'}`}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-[#00D084] via-[#5de2b6] to-[#c4f3df] px-8 py-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0B1F1C]/70">OurPharma · Order Confirmed</p>
            <h1 className="mt-1 text-3xl font-black tracking-tighter text-[#0B1F1C]">Payment Successful 🎉</h1>
          </div>

          <div className="px-8 py-8 space-y-6">
            {/* Order ID */}
            <motion.div
              className={`flex items-center justify-between rounded-2xl px-5 py-4 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}
              variants={itemVariants}
            >
              <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Order ID</span>
              <span
                className={`font-black text-sm tracking-widest select-all ${isDark ? 'text-[#00D084]' : 'text-emerald-600'}`}
              >
                #{orderId}
              </span>
            </motion.div>

            {/* Amount */}
            <motion.div
              className="rounded-2xl bg-[#00D084] px-5 py-5 text-center"
              variants={itemVariants}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#0B1F1C]/70">Total Paid</p>
              <p className="mt-1 text-4xl font-black tracking-tighter text-[#0B1F1C]">₹{totalAmount.toLocaleString('en-IN')}</p>
            </motion.div>

            {/* Delivery note */}
            <motion.div
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${isDark ? 'bg-emerald-900/20 border border-emerald-900/40' : 'bg-emerald-50 border border-emerald-100'}`}
              variants={itemVariants}
            >
              <span className="text-2xl">🚀</span>
              <div>
                <p className={`text-xs font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Your order is being prepared</p>
                <p className={`text-[10px] font-semibold ${isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>
                  Estimated delivery: <strong>within 2 hours</strong>
                </p>
              </div>
            </motion.div>

            {/* Saved items notice */}
            <motion.p
              className={`text-center text-[10px] font-semibold ${isDark ? 'text-[#A0AEC0]' : 'text-slate-400'}`}
              variants={itemVariants}
            >
              Order details saved locally. A receipt has been stored on this device.
            </motion.p>

            {/* Go Home button */}
            <motion.button
              onClick={onGoHome}
              className="w-full rounded-2xl border border-[#00D084] bg-[#00D084] py-4 text-sm font-black uppercase tracking-[0.2em] text-[#0B1F1C] shadow-lg shadow-[#00D084]/30 transition"
              variants={itemVariants}
              whileHover={{ scale: 1.03, brightness: 1.1 } as never}
              whileTap={{ scale: 0.97 }}
            >
              Back to Homepage
            </motion.button>
          </div>
        </motion.div>

        <motion.p
          className={`mt-6 text-center text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]/50' : 'text-slate-400'}`}
          variants={itemVariants}
        >
          Thank you for choosing OurPharma
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
