
import React, { useState, useRef, useEffect } from 'react';
import { User, Language, Theme, ViewState } from '../types';

interface HeaderProps {
  onSignInClick: () => void;
  user: User | null;
  onLogoClick: () => void;
  cartCount: number;
  onCartClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeToggle: () => void;
  onViewChange: (view: ViewState) => void;
  locationLabel: string;
  pincode: string;
  isDetectingLocation: boolean;
  onDetectLocation: () => void;
  onPincodeChange: (pincode: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSignInClick, 
  user, 
  onLogoClick, 
  cartCount, 
  onCartClick,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onViewChange,
  locationLabel,
  pincode,
  isDetectingLocation,
  onDetectLocation,
  onPincodeChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${theme === 'dark' ? 'border-white/10 bg-[#0B1F1C]/95' : 'border-slate-200 bg-white/95'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00D084] transition-transform hover:scale-105">
              <span className="mb-1 text-2xl font-black text-[#0B1F1C]">G</span>
              <div className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#F7FAFC] ring-2 ring-[#0B1F1C]">
                <svg className="h-4 w-4 text-[#00D084]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.15,20C11.33,20 14.25,18.23 15.82,15.5L13.12,13.03C15.84,11.4 17,8 17,8M8,18C5,18 2,15 2,12C2,7 5,3 12,2C11,5 11,8 8,11C5,14 5,18 8,18Z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black leading-none tracking-tighter ${theme === 'dark' ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>Our<span className="text-[#00D084]">Pharma</span></span>
              <span className={`mt-1 text-[10px] font-bold uppercase tracking-[0.28em] ${theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>One Stop Generic Pharmacy</span>
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-4">
            <div className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 backdrop-blur-lg ${theme === 'dark' ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-slate-50'}`}>
              <svg className="h-4 w-4 text-[#00D084]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-[#F7FAFC]' : 'text-slate-700'}`}>Deliver To</span>
              <input
                type="text"
                value={pincode}
                onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={locationLabel}
                className={`min-h-11 w-44 bg-transparent px-2 py-1 text-xs font-semibold outline-none ${theme === 'dark' ? 'text-[#F7FAFC] placeholder:text-[#A0AEC0]' : 'text-slate-800 placeholder:text-slate-400'}`}
              />
              <button
                onClick={onDetectLocation}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#00D084] transition duration-200 hover:scale-105 hover:bg-[#00D084]/10"
                title={isDetectingLocation ? 'Locating...' : 'Detect location'}
              >
                {isDetectingLocation ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00D084] border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m8-10h2M2 12h2m13.657-5.657l1.414-1.414M4.929 19.071l1.414-1.414m11.314 1.414l1.414 1.414M4.929 4.929l1.414 1.414M12 7a5 5 0 100 10 5 5 0 000-10z" /></svg>
                )}
              </button>
            </div>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`min-h-11 flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-[#00D084] ${theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-500'}`}
              >
                Company
                <svg className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-52 rounded-2xl py-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 ${theme === 'dark' ? 'border border-white/10 bg-[#0B1F1C]' : 'border border-slate-200 bg-white'}`}>
                  <button 
                    onClick={() => { onViewChange('about'); setIsMenuOpen(false); }}
                    className={`min-h-11 w-full px-6 py-3 text-left text-xs font-bold transition-colors hover:bg-[#00D084]/10 hover:text-[#00D084] ${theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-600'}`}
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => { onViewChange('founders'); setIsMenuOpen(false); }}
                    className={`min-h-11 w-full px-6 py-3 text-left text-xs font-bold transition-colors hover:bg-[#00D084]/10 hover:text-[#00D084] ${theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-600'}`}
                  >
                    Meet the Founders
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <select 
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className={`min-h-11 cursor-pointer appearance-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none ${theme === 'dark' ? 'border border-white/10 bg-[#0f2c27] text-[#F7FAFC]' : 'border border-slate-200 bg-white text-slate-700'}`}
              style={{ colorScheme: theme }}
              title="English + Top 5 Indian languages"
            >
              <option value="en" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>English</option>
              <option value="hi" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>हिंदी (Hindi)</option>
              <option value="bn" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>বাংলা (Bengali)</option>
              <option value="mr" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>मराठी (Marathi)</option>
              <option value="te" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>తెలుగు (Telugu)</option>
              <option value="ta" style={{ color: '#0f172a', backgroundColor: '#f8fafc' }}>தமிழ் (Tamil)</option>
            </select>

            <button 
              onClick={onThemeToggle}
              className={`min-h-11 rounded-xl p-3 transition duration-200 hover:scale-105 hover:border-[#00D084] hover:text-[#00D084] ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-[#A0AEC0]' : 'border border-slate-200 bg-white text-slate-500'}`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <button 
              onClick={onCartClick}
              className={`relative min-h-11 rounded-xl p-3 transition duration-200 hover:scale-105 hover:border-[#00D084] hover:text-[#00D084] ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-[#A0AEC0]' : 'border border-slate-200 bg-white text-slate-500'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#48BB78] text-[10px] font-black text-[#0B1F1C]">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border font-bold ${theme === 'dark' ? 'border-white/10 bg-white/5 text-[#F7FAFC]' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Patient</span>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>{user.name}</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={onSignInClick}
                className="min-h-11 rounded-full border border-[#00D084] bg-[#00D084] px-6 py-2.5 text-sm font-bold text-[#0B1F1C] transition duration-200 hover:scale-105 hover:bg-transparent hover:text-[#00D084]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
