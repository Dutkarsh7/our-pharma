import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../src/lib/supabase';
import type { Theme } from '../types';

interface ProfileEditorProps {
  theme: Theme;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ theme, onClose }) => {
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const inputCls = `min-h-11 w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#00D084] ${
    isDark
      ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]'
      : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
  }`;
  const labelCls = `mb-1 block ml-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`;

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setEmail(data.user.email ?? '');
        setName(data.user.user_metadata?.full_name ?? '');
        setPhone(data.user.user_metadata?.phone ?? '');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Phone must be 10 digits.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), phone: phone.trim() }
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="mx-auto mt-6 w-full max-w-lg px-4 sm:mt-10 pb-16"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.button
        onClick={onClose}
        className={`mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition hover:text-[#00D084] ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}
        whileHover={{ x: -4 }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>

      <div className={`rounded-2xl p-8 transition-colors ${isDark ? 'border border-white/10 bg-white/5 backdrop-blur-xl' : 'border border-emerald-100 bg-white shadow-xl shadow-emerald-50/60'}`}>
        <div className="mb-8 flex items-center gap-5">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black ${isDark ? 'bg-[#00D084]/20 text-[#00D084]' : 'bg-emerald-50 text-emerald-600'}`}>
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>
              {name || 'Your Profile'}
            </h1>
            <p className={`text-xs font-bold ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>{email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Phone Number</label>
            <input
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
              type="email"
              value={email}
              disabled
              className={`${inputCls} cursor-not-allowed opacity-50`}
            />
            <p className={`mt-1 ml-1 text-[10px] font-semibold ${isDark ? 'text-[#A0AEC0]' : 'text-slate-400'}`}>Email cannot be changed here.</p>
          </div>

          {error && (
            <p className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          )}

          <motion.button
            onClick={handleSave}
            disabled={loading}
            className={`min-h-11 w-full rounded-xl border border-[#00D084] px-4 py-3 text-sm font-black uppercase tracking-widest text-[#0B1F1C] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              saved ? 'bg-emerald-400' : 'bg-[#00D084] hover:scale-[1.02]'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileEditor;
