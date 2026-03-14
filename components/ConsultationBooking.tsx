import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Theme } from '../types';

interface ConsultationBookingProps {
  theme: Theme;
  onClose: () => void;
  reason?: string;
}

type BookingStep = 'details' | 'payment' | 'confirmed';
type PaymentMethod = 'UPI' | 'Card' | 'Wallet';

const doctor = {
  name: 'Dr. Anil Dhingra',
  clinic: 'Dr. Anil Dhingra Clinic',
  location: 'DLF City Phase 3, Gurgaon',
  experience: '48 Years in Healthcare',
  qualification: 'MBBS, General Physician',
  rating: 4.2,
  reviews: 91,
  bookingFee: 99,
  consultFee: 1000,
  availability: 'Today · Opens at 05:30 PM',
  image: '/doctor.jpg'
};

const uid = () => `CONS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const ConsultationBooking: React.FC<ConsultationBookingProps> = ({ theme, onClose, reason }) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<BookingStep>('details');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [bookingId, setBookingId] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    city: '',
    concern: reason ?? 'General medical consultation',
    preferredSlot: 'Today 06:00 PM',
  });

  const payableAmount = doctor.bookingFee;
  const canContinue = form.name.trim() && form.phone.trim().length === 10 && form.email.trim() && form.concern.trim();

  const summary = useMemo(
    () => [
      { label: 'Doctor', value: doctor.name },
      { label: 'Clinic', value: doctor.clinic },
      { label: 'Slot', value: form.preferredSlot },
      { label: 'Concern', value: form.concern },
    ],
    [form.concern, form.preferredSlot]
  );

  const handlePayment = () => {
    setIsPaying(true);
    const nextBookingId = uid();

    window.setTimeout(() => {
      const booking = {
        id: nextBookingId,
        createdAt: new Date().toISOString(),
        doctor: doctor.name,
        bookingFee: payableAmount,
        consultFee: doctor.consultFee,
        paymentMethod,
        ...form,
      };

      try {
        const stored = JSON.parse(window.localStorage.getItem('ourpharma_consultations') ?? '[]') as unknown[];
        window.localStorage.setItem('ourpharma_consultations', JSON.stringify([booking, ...stored].slice(0, 50)));
      } catch {
        // Non-fatal for local demo flow.
      }

      setBookingId(nextBookingId);
      setIsPaying(false);
      setStep('confirmed');
    }, 1600);
  };

  const shellClass = isDark
    ? 'border border-white/10 bg-white/5 text-[#F7FAFC]'
    : 'border border-slate-200 bg-white text-slate-900 shadow-sm';
  const inputClass = isDark
    ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]'
    : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400';

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <div className={`rounded-[28px] p-6 sm:p-8 ${shellClass}`}>
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onClose}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${isDark ? 'border border-white/10 bg-[#0B1F1C] text-[#A0AEC0] hover:border-[#16a34a] hover:text-[#16a34a]' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#16a34a] hover:text-[#16a34a]'}`}
          >
            ←
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#16a34a]">Doctor Booking</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Book Dr. Anil Dhingra</h1>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-green-800 bg-[#052916] p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <img src={doctor.image} alt={doctor.name} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
              <p className="text-sm font-semibold text-green-400">{doctor.qualification}</p>
              <p className="text-sm text-gray-300">{doctor.experience}</p>
              <p className="text-sm text-gray-400">📍 {doctor.location}</p>
              <p className="mt-1 text-xs text-green-300">{doctor.availability}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-yellow-400">★ {doctor.rating}</span>
                <span className="text-xs text-gray-400">({doctor.reviews} ratings)</span>
              </div>
            </div>
            <div className="rounded-2xl border border-green-700 bg-green-950 p-4 text-right">
              <p className="text-xs text-green-300">Booking Gateway Charge</p>
              <p className="text-3xl font-black text-white">₹{payableAmount}</p>
              <p className="text-xs text-gray-400">Doctor consult fee ₹{doctor.consultFee} collected during confirmation</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Full name" className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
                  <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="Phone number" inputMode="tel" className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email address" className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
                  <input value={form.age} onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="Age" inputMode="numeric" className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="City" className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
                  <select value={form.preferredSlot} onChange={(event) => setForm((prev) => ({ ...prev, preferredSlot: event.target.value }))} className={`min-h-12 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`}>
                    <option>Today 06:00 PM</option>
                    <option>Today 06:30 PM</option>
                    <option>Today 07:00 PM</option>
                    <option>Tomorrow 11:00 AM</option>
                  </select>
                </div>
                <textarea value={form.concern} onChange={(event) => setForm((prev) => ({ ...prev, concern: event.target.value }))} placeholder="Describe your medical concern" className={`min-h-32 w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#16a34a] ${inputClass}`} />
              </div>

              <div className="rounded-2xl border border-green-900 bg-[#0d1712] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-green-400">Booking Summary</p>
                <div className="mt-5 space-y-4">
                  {summary.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="max-w-[60%] text-right font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="my-5 h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Gateway payment</span>
                  <span className="text-2xl font-black text-white">₹{payableAmount}</span>
                </div>
                <p className="mt-4 text-xs text-gray-400">Consultation happens on the OurPharma platform only. Contact details are never shared directly.</p>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!canContinue}
                  className="mt-6 w-full rounded-xl bg-[#16a34a] py-3 font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4 rounded-2xl border border-green-900 bg-[#0d1712] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-green-400">Payment Gateway</p>
                {(['UPI', 'Card', 'Wallet'] as PaymentMethod[]).map((method) => (
                  <label key={method} className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 ${paymentMethod === method ? 'border-[#16a34a] bg-green-950' : 'border-white/10 bg-transparent'}`}>
                    <span className="font-semibold text-white">{method}</span>
                    <input type="radio" name="consultPayment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="h-4 w-4 accent-[#16a34a]" />
                  </label>
                ))}
                <div className="rounded-xl border border-white/10 bg-[#08130e] p-4 text-sm text-gray-300">
                  Secure gateway charge: ₹{payableAmount}. The remaining consultation fee is payable as part of the confirmed doctor session.
                </div>
              </div>

              <div className="rounded-2xl border border-green-900 bg-[#0d1712] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-green-400">Review</p>
                <div className="mt-5 space-y-4 text-sm text-white">
                  <div className="flex justify-between"><span className="text-gray-400">Patient</span><span>{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Slot</span><span>{form.preferredSlot}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Method</span><span>{paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-black text-green-400">₹{payableAmount}</span></div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep('details')} className="flex-1 rounded-xl border border-gray-700 py-3 text-gray-300">Back</button>
                  <button onClick={handlePayment} disabled={isPaying} className="flex-1 rounded-xl bg-[#16a34a] py-3 font-bold text-white hover:bg-green-500 disabled:opacity-60">
                    {isPaying ? 'Processing...' : `Pay ₹${payableAmount}`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirmed' && (
            <motion.div key="confirmed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-auto max-w-2xl rounded-2xl border border-green-800 bg-[#052916] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16a34a] text-3xl">✓</div>
              <h2 className="mt-5 text-3xl font-black text-white">Consultation Booked</h2>
              <p className="mt-3 text-sm text-green-200">Your request has been submitted successfully. OurPharma will connect you with Dr. Dhingra through the platform.</p>
              <div className="mt-6 rounded-2xl border border-green-700 bg-green-950 p-5 text-left text-sm text-white">
                <div className="flex justify-between"><span className="text-green-300">Booking ID</span><span className="font-black">{bookingId}</span></div>
                <div className="mt-3 flex justify-between"><span className="text-green-300">Patient</span><span>{form.name}</span></div>
                <div className="mt-3 flex justify-between"><span className="text-green-300">Slot</span><span>{form.preferredSlot}</span></div>
                <div className="mt-3 flex justify-between"><span className="text-green-300">Paid Now</span><span>₹{payableAmount}</span></div>
              </div>
              <button onClick={onClose} className="mt-6 rounded-xl bg-[#16a34a] px-6 py-3 font-bold text-white hover:bg-green-500">Back to App</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ConsultationBooking;