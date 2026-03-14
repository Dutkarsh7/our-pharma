
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../src/lib/supabase';
import type { Theme } from '../types';

interface AuthProps {
  onAuthSuccess: () => void;
  theme: Theme;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, theme }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const inputCls = `min-h-11 w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#00D084] ${
    isDark
      ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]'
      : 'border border-emerald-100 bg-white text-slate-900 placeholder:text-slate-400'
  }`;
  const labelCls = `mb-1 block ml-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`;

  const sendOtp = async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) { setError('Please enter a valid 10-digit phone number.'); return; }

    setLoading(true);
    setError('');

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { data: { full_name: name.trim(), phone: phone.trim() } }
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setStep('otp');
    }

    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setError('OTP must be 6 digits.'); return; }

    setLoading(true);
    setError('');

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: 'email'
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    // Update user metadata with name + phone after login
    if (data?.user) {
      await supabase.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } });
    }

    setLoading(false);
    onAuthSuccess();
  };

  return (
    <motion.div
      className="mx-auto mt-6 w-full max-w-md px-4 sm:mt-10"
      initial={{ opacity: 0, scale: 0.97, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
    >
      <motion.div
        className={`rounded-2xl p-8 text-center backdrop-blur-xl transition-colors duration-300 ${
          isDark
            ? 'border border-white/10 bg-white/5'
            : 'border border-emerald-100 bg-white shadow-xl shadow-emerald-100/40'
        }`}
        layout
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D084]/20 text-[#00D084]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div key="email" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.3 }}>
            <h2 className={`text-3xl font-black ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>Welcome to OurPharma 💊</h2>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Create your account or sign in below</p>

            <div className="mt-6 space-y-4 text-left">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                  placeholder="name@example.com"
                  className={inputCls}
                />
              </div>
              <button
                onClick={sendOtp}
                disabled={loading}
                className={`min-h-11 w-full rounded-xl border border-[#00D084] bg-[#00D084] px-4 py-3 text-sm font-black uppercase tracking-widest text-[#0B1F1C] transition duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark ? 'hover:bg-transparent hover:text-[#00D084]' : 'hover:bg-emerald-400'
                }`}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
            <h2 className={`text-3xl font-black ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>Check your email 📧</h2>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Enter the 6-digit OTP sent to {email}</p>

            <div className="mt-6 space-y-4 text-left">
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                placeholder="123456"
                className={`min-h-11 w-full rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.3em] outline-none transition focus:ring-2 focus:ring-[#00D084] ${
                  isDark
                    ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]'
                    : 'border border-emerald-100 bg-white text-slate-900 placeholder:text-slate-400'
                }`}
              />

              <button
                onClick={verifyOtp}
                disabled={loading}
                className={`min-h-11 w-full rounded-xl border border-[#00D084] bg-[#00D084] px-4 py-3 text-sm font-black uppercase tracking-widest text-[#0B1F1C] transition duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark ? 'hover:bg-transparent hover:text-[#00D084]' : 'hover:bg-emerald-400'
                }`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className={`min-h-11 w-full rounded-xl bg-transparent px-4 py-3 text-sm font-black uppercase tracking-widest transition duration-200 hover:scale-105 hover:border-[#00D084] hover:text-[#00D084] ${
                  isDark ? 'border border-white/10 text-[#A0AEC0]' : 'border border-emerald-100 text-slate-600'
                }`}
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {error && <p className={`mt-4 text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      </motion.div>
    </motion.div>
  );
};

export default Auth;

