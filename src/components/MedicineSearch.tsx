import React, { useEffect, useMemo, useState } from 'react';
import { medicines, Medicine } from '../data/medicines';
import { Search, ShieldCheck } from 'lucide-react';
import MedicineCard from '../../components/MedicineCard';
import { Language, Theme } from '../../types';

interface MedicineSearchProps {
  onAddToCart: (medicine: Medicine, selectedType: 'brand' | 'generic') => void;
  onBookMedicalConsultation: (reason?: string) => void;
  theme: Theme;
  language: Language;
}

const medicineCopy = {
  en: {
    title: 'Medicine Search & Buy',
    subtitle: 'Search branded medicines and switch to lower-cost generic alternatives.',
    chronicOnly: 'Chronic conditions only',
    searchPlaceholder: 'Search by brand, generic name, or health issues',
    totalResults: 'Total results',
    noFoundTitle: 'No medicines found.',
    noFoundDesc: 'Try another name or disable the chronic filter.',
    save: 'Save',
    off: 'OFF',
    addGeneric: 'ADD GENERIC',
    addBrand: 'ADD BRAND',
    loadMore: 'Load more',
  },
  hi: {
    title: 'दवाइयां खोजें और खरीदें',
    subtitle: 'ब्रांडेड दवाइयों को खोजें और कम कीमत वाले जेनेरिक विकल्प चुनें।',
    chronicOnly: 'सिर्फ क्रॉनिक कंडीशन्स',
    searchPlaceholder: 'ब्रांड, जेनेरिक नाम या बीमारी से खोजें',
    totalResults: 'कुल परिणाम',
    noFoundTitle: 'कोई दवाई नहीं मिली।',
    noFoundDesc: 'दूसरा नाम खोजें या क्रॉनिक फ़िल्टर हटाएं।',
    save: 'बचत',
    off: 'छूट',
    addGeneric: 'जेनेरिक जोड़ें',
    addBrand: 'ब्रांड जोड़ें',
    loadMore: 'और दिखाएं',
  },
} as const;

const PAGE_SIZE = 20;

const MedicineSearch: React.FC<MedicineSearchProps> = ({ onAddToCart, onBookMedicalConsultation, theme, language }) => {
  const [query, setQuery] = useState('');
  const [chronicOnly, setChronicOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return medicines.filter((medicine) => {
      if (chronicOnly && !medicine.chronic_keywords.toLowerCase().includes('chronic')) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        medicine.brand_name.toLowerCase().includes(normalizedQuery) ||
        medicine.generic_name.toLowerCase().includes(normalizedQuery) ||
        medicine.health_issues.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, chronicOnly]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, chronicOnly]);

  const visibleResults = filteredResults.slice(0, visibleCount);
  const hasMore = visibleCount < filteredResults.length;
  const isDark = theme === 'dark';
  const copy = language === 'hi' ? medicineCopy.hi : medicineCopy.en;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-10">
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
          <p>
            Generic alternatives use the same active ingredients and are clinically reviewed before fulfillment. Consult your doctor before switching ongoing therapies.
          </p>
        </div>
        <button
          onClick={() => onBookMedicalConsultation('General medical consultation before switching medicines')}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          Schedule Dr. Dhingra
        </button>
      </div>

      <div className={`rounded-3xl p-6 ${isDark ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{copy.title}</h2>
            <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {copy.subtitle}
            </p>
          </div>
          <label className={`inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${isDark ? 'border border-slate-700 bg-slate-800 text-slate-300' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}>
            <input
              type="checkbox"
              checked={chronicOnly}
              onChange={(event) => setChronicOnly(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            {copy.chronicOnly}
          </label>
        </div>

        <div className="relative mt-5">
          <Search className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className={`min-h-11 w-full rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${isDark ? 'border border-slate-700 bg-slate-950 text-slate-50 placeholder:text-slate-500' : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>

        <p className={`mt-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
          {copy.totalResults}: {filteredResults.length}
        </p>
      </div>

      {filteredResults.length === 0 ? (
        <div className={`mt-10 rounded-3xl p-12 text-center ${isDark ? 'border border-slate-700 bg-slate-900' : 'border border-slate-200 bg-white shadow-sm'}`}>
          <p className={`text-lg font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{copy.noFoundTitle}</p>
          <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{copy.noFoundDesc}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleResults.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} onAddCatalogToCart={onAddToCart} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}
            className="min-h-11 rounded-xl border border-blue-600 bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition duration-200 hover:bg-blue-700"
          >
            {copy.loadMore}
          </button>
        </div>
      )}
    </section>
  );
};

export default MedicineSearch;
