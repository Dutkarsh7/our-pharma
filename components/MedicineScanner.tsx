import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { extractPrescriptionTextFromImage } from '../services/geminiService';
import { Medicine as CatalogMedicine, medicines } from '../src/data/medicines';

interface ScannerMatch {
  medicine: CatalogMedicine;
  confidence: number;
}

interface MedicineScannerProps {
  onAddToCart?: (medicine: CatalogMedicine) => void;
}

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const scoreMatch = (haystack: string, candidate: CatalogMedicine): number => {
  const brand = normalizeText(candidate.brand_name);
  const generic = normalizeText(candidate.generic_name);

  if (!brand && !generic) return 0;

  if (haystack.includes(brand)) return 0.98;
  if (haystack.includes(generic)) return 0.9;

  const words = brand.split(' ').filter((word) => word.length > 2);
  if (!words.length) return 0;

  const hits = words.filter((word) => haystack.includes(word)).length;
  const ratio = hits / words.length;
  return ratio >= 0.55 ? Math.min(0.88, ratio) : 0;
};

const findBestMatches = (ocrText: string): ScannerMatch[] => {
  const normalizedOcr = normalizeText(ocrText);

  const scored = medicines
    .map((medicine) => ({
      medicine,
      confidence: scoreMatch(normalizedOcr, medicine),
    }))
    .filter((item) => item.confidence > 0)
    .sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      const savingsA = a.medicine.brand_price - a.medicine.generic_price;
      const savingsB = b.medicine.brand_price - b.medicine.generic_price;
      return savingsB - savingsA;
    })
    .slice(0, 6);

  return scored;
};

const ScannerSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl border border-violet-100 bg-white/80 p-5 shadow-sm">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-violet-100" />
          <div className="mb-3 h-6 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mb-5 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 animate-pulse rounded-xl bg-rose-100" />
            <div className="h-16 animate-pulse rounded-xl bg-emerald-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

const MedicineScanner: React.FC<MedicineScannerProps> = ({ onAddToCart }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => findBestMatches(ocrText), [ocrText]);

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setOcrText('');

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Could not process the selected image.'));
          return;
        }
        const payload = result.split(',')[1] ?? '';
        resolve(payload);
      };
      reader.onerror = () => reject(new Error('Could not read image data.'));
      reader.readAsDataURL(file);
    });
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = await toBase64(selectedFile);
      const extracted = await extractPrescriptionTextFromImage(base64, selectedFile.type || 'image/jpeg');
      setOcrText(extracted);
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : 'Unable to analyze this image. Please try again with better lighting.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setOcrText('');
    setError(null);
    setDragOver(false);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 text-white shadow-2xl shadow-indigo-500/20 sm:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100">
            AI Prescription Scan
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">MediQuick Medicine Scanner</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Upload or drag a prescription image to extract medicine names and instantly view affordable generic alternatives.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragOver(false);
              }}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed p-6 transition-all sm:p-8 ${
                dragOver
                  ? 'scale-[1.01] border-cyan-300 bg-cyan-400/10'
                  : 'border-violet-300/40 bg-white/5'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFileSelection(file);
                }}
              />

              {!previewUrl && (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-2xl font-bold">
                    Rx
                  </div>
                  <p className="text-lg font-semibold text-white">Drop your prescription image here</p>
                  <p className="mt-1 text-sm text-slate-300">JPG, PNG, WEBP up to 10 MB</p>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-5 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    type="button"
                  >
                    Choose file
                  </button>
                </div>
              )}

              {previewUrl && (
                <div>
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    className="mb-4 max-h-72 w-full rounded-2xl border border-white/20 object-contain"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-200">{selectedFile?.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-lg border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={resetScanner}
                        className="rounded-lg border border-red-300/50 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/10"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedFile || isAnalyzing}
              onClick={runAnalysis}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-4 text-sm font-bold text-white transition hover:from-violet-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing Prescription...' : 'Analyze Prescription'}
            </button>
          </div>

          <div className="rounded-3xl border border-white/15 bg-black/20 p-5">
            <h2 className="text-lg font-bold text-white">Extraction Preview</h2>
            <p className="mt-1 text-xs text-slate-300">Raw OCR output from Gemini appears here before matching.</p>
            <div className="mt-4 min-h-64 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              {isAnalyzing ? (
                <div>
                  <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-violet-300/30" />
                  <div className="mb-3 h-3 w-full animate-pulse rounded bg-slate-300/20" />
                  <div className="mb-3 h-3 w-5/6 animate-pulse rounded bg-slate-300/20" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-300/20" />
                </div>
              ) : ocrText ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{ocrText}</pre>
              ) : (
                <p className="text-sm text-slate-400">No extracted text yet. Upload and analyze a prescription to start.</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/50 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <AnimatePresence>
          {(isAnalyzing || ocrText) && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Suggested Generic Alternatives</h3>
                {!isAnalyzing && !!matches.length && (
                  <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {matches.length} matches found
                  </span>
                )}
              </div>

              {isAnalyzing && <ScannerSkeleton />}

              {!isAnalyzing && !matches.length && ocrText && (
                <div className="rounded-2xl border border-amber-200/40 bg-amber-400/10 p-4 text-sm text-amber-100">
                  No medicine names could be matched from this scan yet. We will add manual fallback input in the next step.
                </div>
              )}

              {!isAnalyzing && !!matches.length && (
                <div className="space-y-4">
                  {matches.map((item) => {
                    const savings = item.medicine.brand_price - item.medicine.generic_price;
                    return (
                      <motion.div
                        key={item.medicine.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border border-white/20 bg-white/90 p-5 text-slate-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Detected Brand</p>
                            <h4 className="text-xl font-black">{item.medicine.brand_name}</h4>
                            <p className="mt-1 text-sm text-slate-600">Generic: {item.medicine.generic_name}</p>
                          </div>
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                            Match confidence {(item.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-rose-50 p-3">
                            <p className="text-xs text-rose-600">Brand price</p>
                            <p className="text-lg font-bold">Rs {item.medicine.brand_price.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-xs text-emerald-700">Generic price</p>
                            <p className="text-lg font-bold">Rs {item.medicine.generic_price.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="rounded-xl bg-indigo-50 p-3">
                            <p className="text-xs text-indigo-700">Estimated savings</p>
                            <p className="text-lg font-bold">Rs {savings.toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-slate-600">Manufacturer: {item.medicine.manufacturer}</p>
                          <button
                            type="button"
                            onClick={() => onAddToCart?.(item.medicine)}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                          >
                            Add to cart
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MedicineScanner;
