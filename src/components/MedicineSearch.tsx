import React, { useEffect, useMemo, useState } from 'react';
import { medicines, Medicine } from '../data/medicines';
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

const createMedicineImage = (brandName: string): string => {
  const initials = brandName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0])
    .join('')
    .toUpperCase() || 'RX';

  const seed = brandName.length % 7;
  const gradients = [
    ['#dbeafe', '#bfdbfe', '#1d4ed8'],
    ['#dcfce7', '#bbf7d0', '#047857'],
    ['#fef3c7', '#fde68a', '#b45309'],
    ['#fee2e2', '#fecaca', '#b91c1c'],
    ['#e0e7ff', '#c7d2fe', '#4338ca'],
    ['#f3e8ff', '#e9d5ff', '#7e22ce'],
    ['#cffafe', '#a5f3fc', '#0f766e'],
  ];
  const [start, end, accent] = gradients[seed];

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${start}' />
        <stop offset='100%' stop-color='${end}' />
      </linearGradient>
    </defs>
    <rect width='400' height='240' fill='url(#g)' rx='24' ry='24'/>
    <rect x='16' y='16' width='368' height='208' rx='18' ry='18' fill='white' fill-opacity='0.72'/>
    <circle cx='70' cy='70' r='26' fill='${accent}' fill-opacity='0.2'/>
    <rect x='120' y='56' width='220' height='16' rx='8' fill='${accent}' fill-opacity='0.18'/>
    <rect x='120' y='84' width='180' height='12' rx='6' fill='${accent}' fill-opacity='0.12'/>
    <rect x='36' y='138' width='328' height='68' rx='16' fill='${accent}' fill-opacity='0.08'/>
    <text x='200' y='178' text-anchor='middle' fill='${accent}' font-size='34' font-family='Arial, sans-serif' font-weight='700'>${initials}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

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
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-green-800 bg-green-950 p-3 text-xs text-green-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          💊 Generic alternatives have identical active ingredients. AI accuracy ~95%. Consult your doctor before switching medicines.
        </p>
        <button
          onClick={() => onBookMedicalConsultation('General medical consultation before switching medicines')}
          className="rounded-lg bg-[#16a34a] px-4 py-2 text-xs font-bold text-white transition hover:bg-green-500"
        >
          Schedule Dr. Dhingra
        </button>
      </div>

      <div className={`rounded-2xl p-6 backdrop-blur-lg ${isDark ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>{copy.title}</h2>
            <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-[#A0AEC0]' : 'text-slate-600'}`}>
              {copy.subtitle}
            </p>
          </div>
          <label className={`inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest ${isDark ? 'border border-white/10 bg-white/5 text-[#A0AEC0]' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}>
            <input
              type="checkbox"
              checked={chronicOnly}
              onChange={(event) => setChronicOnly(event.target.checked)}
              className="h-4 w-4 accent-[#00D084]"
            />
            {copy.chronicOnly}
          </label>
        </div>

        <div className="mt-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className={`min-h-11 w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-[#00D084] ${isDark ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]' : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>

        <p className={`mt-4 text-xs font-black uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>
          {copy.totalResults}: {filteredResults.length}
        </p>
      </div>

      {filteredResults.length === 0 ? (
        <div className={`mt-10 rounded-2xl p-12 text-center backdrop-blur-lg ${isDark ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white shadow-sm'}`}>
          <p className={`text-lg font-bold ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>{copy.noFoundTitle}</p>
          <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-[#A0AEC0]' : 'text-slate-600'}`}>{copy.noFoundDesc}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleResults.map((medicine) => {
            const savings = medicine.brand_price - medicine.generic_price;
            const discountPercent = Math.round((savings / medicine.brand_price) * 100);
            const issueTags = medicine.health_issues.split(',').map((value) => value.trim()).filter(Boolean);
            const shortIssues = issueTags.slice(0, 2);
            const imageSrc = createMedicineImage(medicine.brand_name);

            return (
              <article
                key={medicine.id}
                className={`overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 ${isDark ? 'border border-white/10 bg-white/5 hover:border-[#00D084]/50' : 'border border-slate-200 bg-white shadow-sm hover:shadow-md'}`}
              >
                <div className={`flex h-36 items-center justify-center border-b ${isDark ? 'border-white/10 bg-[linear-gradient(135deg,#0B1F1C,#103129)]' : 'border-slate-200 bg-[linear-gradient(135deg,#ecfeff,#dcfce7)]'}`}>
                  <img src={imageSrc} alt={medicine.brand_name} className="h-full w-full object-cover" loading="lazy" />
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className={`line-clamp-2 text-lg font-black leading-tight ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>
                      {medicine.brand_name}
                    </h3>
                    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black uppercase ${isDark ? 'bg-[#48BB78]/20 text-[#48BB78]' : 'bg-emerald-100 text-emerald-700'}`}>
                      {discountPercent}% {copy.off}
                    </span>
                  </div>

                  <p className={`line-clamp-1 text-xs font-semibold ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>
                    {medicine.generic_name}
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <p className={`text-2xl font-black ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>₹{medicine.generic_price}</p>
                    <p className={`pb-1 text-sm line-through ${isDark ? 'text-[#A0AEC0]' : 'text-slate-400'}`}>₹{medicine.brand_price}</p>
                  </div>

                  <p className="mt-1 text-xs font-bold text-[#00D084]">{copy.save} ₹{savings}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {shortIssues.map((tag) => (
                      <span
                        key={`${medicine.id}-${tag}`}
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isDark ? 'border border-white/10 bg-white/5 text-[#A0AEC0]' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <button
                      onClick={() => onAddToCart(medicine, 'generic')}
                      className="min-h-11 rounded-xl border border-[#00D084] bg-[#00D084] px-3 py-2 text-sm font-black text-[#0B1F1C] transition duration-200 hover:bg-transparent hover:text-[#00D084]"
                    >
                      {copy.addGeneric}
                    </button>
                    <button
                      onClick={() => onAddToCart(medicine, 'brand')}
                      className="min-h-11 rounded-xl border border-[#00D084] bg-transparent px-3 py-2 text-sm font-black text-[#00D084] transition duration-200 hover:bg-[#00D084] hover:text-[#0B1F1C]"
                    >
                      {copy.addBrand}
                    </button>
                    </div>
                  </div>
              </article>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}
            className="min-h-11 rounded-xl border border-[#00D084] bg-[#00D084] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#0B1F1C] transition duration-200 hover:scale-105 hover:bg-transparent hover:text-[#00D084]"
          >
            {copy.loadMore}
          </button>
        </div>
      )}
    </section>
  );
};

export default MedicineSearch;
