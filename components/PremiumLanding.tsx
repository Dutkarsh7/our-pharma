import React, { useMemo, useRef } from 'react';
import { Check, ClipboardPlus, FlaskConical, ScanSearch, Stethoscope, Upload, PackageCheck } from 'lucide-react';
import { Medicine as CatalogMedicine } from '../src/data/medicines';
import { Language } from '../types';
import './PremiumLanding.css';

interface Founder {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface PremiumLandingProps {
  language: Language;
  locationLabel: string;
  featuredMedicines: CatalogMedicine[];
  founders: Founder[];
  onUpload: (base64: string) => void;
  onBrowseMedicines: () => void;
  onTalkToExpert: () => void;
  onAddCatalogToCart: (medicine: CatalogMedicine, selectedType: 'brand' | 'generic') => void;
  isAnalyzing: boolean;
}

const copy = {
  en: {
    badge: '2-Hour Delivery Active',
    titleA: 'Your Prescription.',
    titleB: 'Faster. Smarter. Cheaper.',
    subtitle:
      'Scan your prescription to find identical generic salts at a fraction of the brand price. Bio-equivalent medicine delivered to your door in under 2 hours.',
    uploadTitle: 'Upload Your Prescription',
    uploadBody: 'Our Gemini AI maps each medicine to an identical generic salt instantly.',
    uploadButton: 'Upload and Find Generics',
    browse: 'Browse Medicines',
    experts: 'Talk to an Expert',
    average: 'Average savings',
    time: 'Delivery time',
    cities: 'Cities covered',
    listed: 'Medicines listed',
    howTitle: 'Three steps to smarter healthcare.',
    howSub: 'From prescription upload to doorstep delivery, the entire process takes minutes.',
    featuredTitle: 'Top picks, big savings.',
    reviewsTitle: 'Trusted by real patients.',
    aboutTitle: 'Built by students, for every patient.',
    foundersTitle: 'The founders behind the mission.',
    footerCopy: 'Your Prescription. Faster. Smarter. Cheaper. Delivering bio-equivalent generic medicines across major hubs in India.',
  },
  hi: {
    badge: '2 घंटे में डिलीवरी सक्रिय',
    titleA: 'आपका नुस्खा।',
    titleB: 'तेज़। स्मार्ट। सस्ता।',
    subtitle:
      'अपना प्रिस्क्रिप्शन स्कैन करें और ब्रांड दवाइयों के समान जेनेरिक सॉल्ट कम कीमत में पाएं। 2 घंटे में डिलीवरी उपलब्ध।',
    uploadTitle: 'अपना प्रिस्क्रिप्शन अपलोड करें',
    uploadBody: 'Gemini AI हर दवा को तुरंत समान जेनेरिक सॉल्ट से मैप करता है।',
    uploadButton: 'अपलोड करें और जेनेरिक पाएं',
    browse: 'दवाइयां देखें',
    experts: 'विशेषज्ञ से बात करें',
    average: 'औसत बचत',
    time: 'डिलीवरी समय',
    cities: 'कवर शहर',
    listed: 'दवाइयां सूचीबद्ध',
    howTitle: 'बेहतर स्वास्थ्य के लिए 3 आसान चरण।',
    howSub: 'प्रिस्क्रिप्शन अपलोड से लेकर डिलीवरी तक पूरा प्रोसेस कुछ ही मिनटों में।',
    featuredTitle: 'टॉप दवाइयां, ज्यादा बचत।',
    reviewsTitle: 'असली मरीजों का भरोसा।',
    aboutTitle: 'स्टूडेंट्स द्वारा बनाया गया, हर मरीज के लिए।',
    foundersTitle: 'हमारे मिशन के पीछे की टीम।',
    footerCopy: 'आपका नुस्खा। तेज़। स्मार्ट। सस्ता। भारत के प्रमुख शहरों में 2 घंटे में बायो-इक्विवेलेंट जेनेरिक दवाइयों की डिलीवरी।',
  },
} as const;

const reviews = [
  {
    text: 'My family monthly medicine bill dropped from over 4000 to under 1000. The molecule-level comparison built trust instantly.',
    name: 'Rahul Agarwal',
    meta: 'Gurgaon',
  },
  {
    text: 'I uploaded a low-quality prescription image and the extraction was still accurate. Smooth UI and clear savings breakdown.',
    name: 'Sneha Gupta',
    meta: 'Mumbai',
  },
  {
    text: 'Delivery was under two hours and the package showed brand versus generic transparency. I now reorder only from here.',
    name: 'Priya Mehta',
    meta: 'Bangalore',
  },
];

const getUses = (value?: string) => {
  if (!value) return 'Clinically reviewed use cases available in app.';
  return value.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 2).join(', ');
};

const PremiumLanding: React.FC<PremiumLandingProps> = ({
  language,
  locationLabel,
  featuredMedicines,
  founders,
  onUpload,
  onBrowseMedicines,
  onTalkToExpert,
  onAddCatalogToCart,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = language === 'hi' ? copy.hi : copy.en;

  const safeFeatured = useMemo(() => featuredMedicines.slice(0, 6), [featuredMedicines]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64 = dataUrl.split(',')[1];
      if (base64) {
        onUpload(base64);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="op-landing">
      <section className="op-hero">
        <div className="op-hero-inner">
          <div className="op-hero-badge">
            <span className="op-dot" />
            {t.badge} - {locationLabel}
          </div>

          <h1 className="op-title">
            {t.titleA}
            <br />
            <em>{t.titleB}</em>
          </h1>

          <p className="op-sub">{t.subtitle}</p>

          <div className="op-upload-box">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileSelection}
              style={{ display: 'none' }}
            />
            <div className="op-upload-icon">
              <ClipboardPlus size={28} />
            </div>
            <h3>{t.uploadTitle}</h3>
            <p>{t.uploadBody}</p>
            <div className="op-upload-formats">
              <span className="op-fmt-tag">JPG</span>
              <span className="op-fmt-tag">PNG</span>
              <span className="op-fmt-tag">PDF</span>
              <span className="op-fmt-tag">Max 10MB</span>
            </div>
            <button
              className="op-btn-upload"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Upload size={16} />
              {isAnalyzing ? 'Analyzing...' : t.uploadButton}
            </button>
          </div>

          <div className="op-or">or</div>

          <div className="op-hero-actions">
            <button className="op-btn-outline" type="button" onClick={onBrowseMedicines}>
              {t.browse}
            </button>
            <button className="op-btn-outline" type="button" onClick={onTalkToExpert}>
              {t.experts}
            </button>
          </div>

          <div className="op-hero-stats">
            <div className="op-stat">
              <div className="op-stat-num">68%</div>
              <div className="op-stat-label">{t.average}</div>
            </div>
            <div className="op-stat">
              <div className="op-stat-num">2 hrs</div>
              <div className="op-stat-label">{t.time}</div>
            </div>
            <div className="op-stat">
              <div className="op-stat-num">4</div>
              <div className="op-stat-label">{t.cities}</div>
            </div>
            <div className="op-stat">
              <div className="op-stat-num">12K+</div>
              <div className="op-stat-label">{t.listed}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="op-band">
        <div className="op-trust-row">
          {['Verified Salts', 'GMP Sourced', 'Pharmacist Checked', 'Exact Salt Mapping', 'Express Delivery'].map((item) => (
            <span key={item} className="op-trust-item">
              <Check className="op-check" size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="op-section">
        <div className="op-container">
          <div className="op-label">How It Works</div>
          <h2 className="op-section-title">{t.howTitle}</h2>
          <p className="op-section-sub">{t.howSub}</p>

          <div className="op-hiw-grid">
            <div className="op-hiw-card">
              <div className="op-hiw-icon">
                <ScanSearch size={24} />
              </div>
              <h3>Upload Prescription</h3>
              <p>Drop your prescription image or PDF. AI extracts medicine names, dosage, and intent quickly.</p>
            </div>
            <div className="op-hiw-card">
              <div className="op-hiw-icon">
                <FlaskConical size={24} />
              </div>
              <h3>Match Generic Salts</h3>
              <p>We map each branded medicine to bio-equivalent generic alternatives using molecular salt matching.</p>
            </div>
            <div className="op-hiw-card">
              <div className="op-hiw-icon">
                <PackageCheck size={24} />
              </div>
              <h3>Fast Delivery</h3>
              <p>Choose brand or generic and complete checkout once. Hyperlocal fulfillment handles quick dispatch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="op-section op-medicines">
        <div className="op-container">
          <div className="op-label">Featured Medicines</div>
          <h2 className="op-section-title">
            {t.featuredTitle.split(',')[0]}, <em>{t.featuredTitle.split(',').slice(1).join(',').trim() || 'big savings.'}</em>
          </h2>
          <div className="op-meds-grid">
            {safeFeatured.map((medicine) => {
              const savings = Math.max(0, medicine.brand_price - medicine.generic_price);
              const discount = medicine.brand_price > 0 ? Math.round((savings / medicine.brand_price) * 100) : 0;
              return (
                <div key={medicine.id} className="op-med-card">
                  <span className="op-off">{discount}% OFF</span>
                  <h3 className="op-med-name">{medicine.brand_name}</h3>
                  <p className="op-med-generic">{medicine.generic_name}</p>
                  <p className="op-med-uses">{getUses(medicine.uses || medicine.health_issues)}</p>
                  <div className="op-price-row">
                    <span className="op-gen-price">INR {medicine.generic_price}</span>
                    <span className="op-brand-price">INR {medicine.brand_price}</span>
                  </div>
                  <div className="op-card-actions">
                    <button className="op-btn-gen" type="button" onClick={() => onAddCatalogToCart(medicine, 'generic')}>
                      Add Generic
                    </button>
                    <button className="op-btn-brand" type="button" onClick={() => onAddCatalogToCart(medicine, 'brand')}>
                      Add Brand
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="op-section">
        <div className="op-container">
          <div className="op-label">Customer Reviews</div>
          <h2 className="op-section-title">
            {t.reviewsTitle.split(' ').slice(0, 2).join(' ')} <em>{t.reviewsTitle.split(' ').slice(2).join(' ')}</em>
          </h2>
          <div className="op-reviews-grid">
            {reviews.map((review) => (
              <article key={review.name} className="op-review">
                <span>Verified Purchase</span>
                <p>{review.text}</p>
                <div className="op-reviewer">{review.name} - {review.meta}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="op-section op-about">
        <div className="op-container">
          <div className="op-label">About OurPharma</div>
          <h2 className="op-section-title">
            {t.aboutTitle.split(',')[0]}, <em>{t.aboutTitle.split(',').slice(1).join(',').trim() || 'for every patient.'}</em>
          </h2>
          <div className="op-about-grid">
            <div className="op-about-highlight">
              <h3>Generic-first care without losing trust.</h3>
              <p>
                OurPharma bridges branded medicines with clinically equivalent generics through transparent comparison, pharmacist checks,
                and hyperlocal fulfillment.
              </p>
              <div className="op-impact">
                <div className="op-impact-row">
                  <div>
                    <strong>INR 28L+</strong>
                    <span>Saved by users</span>
                  </div>
                  <div>
                    <strong>2400+</strong>
                    <span>Orders fulfilled</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="op-values">
              <div className="op-value">
                <h4>Science-backed substitutions</h4>
                <p>Every recommendation is based on active salt equivalence and pharmacist review workflow.</p>
              </div>
              <div className="op-value">
                <h4>AI-assisted prescription reading</h4>
                <p>Gemini extraction helps quickly capture medicine names, dosage patterns, and order intent from images.</p>
              </div>
              <div className="op-value">
                <h4>Price transparency first</h4>
                <p>Brand and generic pricing are shown together so patients can make informed decisions with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="op-section">
        <div className="op-container">
          <div className="op-label">Our Team</div>
          <h2 className="op-section-title">
            {t.foundersTitle.split(' ').slice(0, 4).join(' ')} <em>{t.foundersTitle.split(' ').slice(4).join(' ')}</em>
          </h2>
          <div className="op-founders-grid">
            {founders.map((founder) => (
              <div key={founder.name} className="op-founder-card">
                <div className="op-founder-avatar">{founder.name.charAt(0)}</div>
                <h3>{founder.name}</h3>
                <div className="op-founder-role">{founder.role}</div>
                <div className="op-founder-meta">{founder.email}</div>
                <div className="op-founder-meta">{founder.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="op-footer">
        <div className="op-footer-grid">
          <div>
            <h3>OurPharma</h3>
            <p>{t.footerCopy}</p>
            <p>+91 7827664217</p>
            <p>contact@ourpharma.in</p>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><button type="button" className="op-btn-link" onClick={onBrowseMedicines}>Browse Medicines</button></li>
              <li><button type="button" className="op-btn-link" onClick={onTalkToExpert}>Experts</button></li>
              <li>Upload Prescription</li>
              <li>Generic Alternatives</li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Our Mission</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Disclaimer</li>
            </ul>
          </div>
        </div>
        <div className="op-footer-bottom">Copyright 2026 OurPharma Private Ltd. Serviceable in Gurgaon, Bangalore, Mumbai and Gujarat hubs.</div>
      </footer>

      <button
        type="button"
        onClick={onTalkToExpert}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 92,
          zIndex: 48,
          width: 52,
          height: 52,
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, #1fa864, #127a4f)',
          color: '#ffffff',
          boxShadow: '0 18px 40px -20px rgba(10,92,59,0.55)',
          cursor: 'pointer',
        }}
        aria-label="Talk to an expert"
      >
        <Stethoscope size={22} style={{ margin: 'auto' }} />
      </button>
    </div>
  );
};

export default PremiumLanding;
