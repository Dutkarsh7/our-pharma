
import React, { useState } from 'react';
import { loadCashfreeScript, CASHFREE_APP_ID } from '../services/cashfree';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types';
import type { Theme } from '../types';
import OrderSuccess from './OrderSuccess';
import DoctorConsult from './DoctorConsult';
import { getSchedule } from '../src/data/drugSchedule';

interface CheckoutProps {
  cart: CartItem[];
  theme: Theme;
  onUpdateQuantity: (salt: string, delta: number) => void;
  onRemove: (salt: string) => void;
  onClose: () => void;
  onClearCart: () => void;
  onBookMedicalConsultation: (reason?: string) => void;
}

type Step = 'cart' | 'address' | 'payment';
type PaymentState = 'idle' | 'processing' | 'done';

interface CompletedOrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface CompletedOrder {
  items: CompletedOrderItem[];
  total: number;
  savings: number;
}

const STEPS: Step[] = ['cart', 'address', 'payment'];
const STEP_LABELS: Record<Step, string> = { cart: 'Cart', address: 'Delivery', payment: 'Payment' };

const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring', stiffness: 280, damping: 22 } }),
};

const Checkout: React.FC<CheckoutProps> = ({ cart, theme, onUpdateQuantity, onRemove, onClose, onClearCart, onBookMedicalConsultation }) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<Step>('cart');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState({ name: '', phone: '', line: '', pincode: '' });
  const [selectedMethod, setSelectedMethod] = useState('Instant UPI Transfer');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedRxName, setUploadedRxName] = useState('');
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.genericPrice * item.quantity, 0);
  const brandedTotal = cart.reduce((acc, item) => acc + item.brandedPrice * item.quantity, 0);
  const savings = brandedTotal - subtotal;
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + deliveryFee;
  const schedules = cart.map((item) => ({
    item,
    schedule: getSchedule(`${item.originalName} ${item.activeSalt} ${item.genericBrandName}`),
  }));
  const hasScheduleX = schedules.some(({ schedule }) => schedule === 'X');
  const hasScheduleH = schedules.some(({ schedule }) => schedule === 'H' || schedule === 'H1');
  const canProceedRestricted = !hasScheduleH || uploadedRxName.trim().length > 0;
  const isBlocked = hasScheduleX || (hasScheduleH && !canProceedRestricted);

  const printReceipt = () => {
    if (!completedOrder) return;

    const receipt = `
    ================================
    OurPharma - Order Receipt
    ================================
    Date: ${new Date().toLocaleDateString()}
    Time: ${new Date().toLocaleTimeString()}
    
    Items Ordered:
    ${completedOrder.items.map((item) => `${item.name} x${item.quantity} \n       — ₹${item.price}`).join('\n')}
    
    --------------------------------
    Total: ₹${completedOrder.total}
    Savings: ₹${completedOrder.savings} vs branded
    ================================
    AI Accuracy: ~95%
    Always verify with pharmacist
    ================================
  `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
      <html>
        <head>
          <title>OurPharma Receipt</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            h2 { color: #16a34a; }
            button {
              background: #16a34a;
              color: white;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              border-radius: 8px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h2>🏥 OurPharma Receipt</h2>
          <pre>${receipt}</pre>
          <button onclick="window.print()">
            🖨️ Print Receipt
          </button>
        </body>
      </html>
    `);
      win.document.close();
    }
  };

  // Save order to localStorage and transition to success

  // Cashfree payment handler (real backend integration)
  const handleCashfreePay = async () => {
    if (isBlocked) return;
    setPaymentState('processing');
    await loadCashfreeScript();
    const orderId = uid();
    const orderAmount = total;
    const customerName = address.name || 'Demo User';
    const customerPhone = address.phone || '9999999999';
    const customerEmail = `${customerName.replace(/\s/g, '').toLowerCase()}@ourpharma.in`;
    try {
      // Call backend to get real payment session token
      const res = await axios.post('http://localhost:5001/create-order', {
        orderId,
        orderAmount,
        customerName,
        customerPhone,
        customerEmail
      });
      const orderToken = res.data.paymentSessionId;
      const cashfree = window.Cashfree;
      if (!cashfree) {
        alert('Cashfree SDK failed to load.');
        setPaymentState('idle');
        return;
      }
      cashfree.init({
        mode: 'sandbox',
        paymentSessionId: orderToken,
        redirectTarget: '_self',
        onSuccess: function(data) {
          setPaymentState('done');
          setShowSuccess(true);
          onClearCart();
        },
        onFailure: function(data) {
          setPaymentState('idle');
          alert('Payment failed.');
        },
        onPending: function(data) {
          setPaymentState('idle');
          alert('Payment pending.');
        },
      });
      cashfree.open();
    } catch (err) {
      setPaymentState('idle');
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handlePayNow = () => {
    if (isBlocked) return;

    setPaymentState('processing');
    const id = uid();

    setTimeout(() => {
      const order = {
        id,
        date: new Date().toISOString(),
        items: cart.map((i) => ({ name: i.genericBrandName, salt: i.activeSalt, qty: i.quantity, price: i.genericPrice })),
        total,
        savings,
        address,
        paymentMethod: selectedMethod,
      };

      try {
        const stored = JSON.parse(localStorage.getItem('ourpharma_orders') ?? '[]');
        stored.unshift(order);
        localStorage.setItem('ourpharma_orders', JSON.stringify(stored.slice(0, 50)));
      } catch {
        // storage unavailable — non-fatal for a college project
      }

      setCompletedOrder({
        items: cart.map((item) => ({
          name: item.genericBrandName,
          quantity: item.quantity,
          price: item.genericPrice,
        })),
        total,
        savings,
      });
      setOrderId(id);
      setPaymentState('done');
      onClearCart();
      setShowSuccess(true);
    }, 2000);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <motion.div
        key="order-success"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mx-auto mt-10 max-w-5xl px-4 pb-20 sm:px-6"
      >
        <OrderSuccess theme={theme} orderId={orderId} totalAmount={completedOrder?.total ?? total} onGoHome={onClose} />
        <button
          onClick={printReceipt}
          className="mt-3 w-full rounded-xl border border-green-600 py-3 text-green-400 hover:bg-green-950"
        >
          🖨️ Print Receipt
        </button>
      </motion.div>
    );
  }

  // ── Field helper ─────────────────────────────────────────────────────────
  const inputCls = `min-h-11 w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-[#00D084] ${
    isDark
      ? 'border border-white/10 bg-[#0B1F1C] text-[#F7FAFC] placeholder:text-[#A0AEC0]'
      : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'
  }`;

  const labelCls = `mb-2 block ml-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`;

  return (
    <motion.div
      className="max-w-5xl mx-auto mt-10 px-4 sm:px-6 pb-32"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Back + Title + Step indicator */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <motion.button
          onClick={onClose}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
            isDark ? 'border-white/10 bg-white/5 text-[#A0AEC0] hover:border-[#00D084] hover:text-[#00D084]' : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-500 hover:text-emerald-600'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <h1 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>
          {STEP_LABELS[step]}
        </h1>

        {/* Breadcrumb stepper */}
        <div className="ml-auto flex items-center gap-2">
          {STEPS.map((s, i) => {
            const isActive = s === step;
            const isPassed = STEPS.indexOf(step) > i;
            return (
              <React.Fragment key={s}>
                <motion.div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black transition ${
                    isPassed
                      ? 'bg-[#00D084] text-[#0B1F1C]'
                      : isActive
                        ? isDark ? 'bg-[#00D084]/20 border border-[#00D084] text-[#00D084]' : 'bg-emerald-50 border border-emerald-500 text-emerald-600'
                        : isDark ? 'bg-white/5 border border-white/10 text-[#A0AEC0]' : 'bg-slate-100 border border-slate-200 text-slate-400'
                  }`}
                  animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {isPassed ? '✓' : i + 1}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${isPassed ? 'bg-[#00D084]' : isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {hasScheduleX && (
            <div className="rounded-2xl border border-red-800 bg-red-950 p-5">
              <p className="text-sm font-bold text-red-300">🚫 Cannot order online. Visit pharmacy.</p>
              <p className="mt-2 text-xs text-red-200">Schedule X medicines need offline dispensing and pharmacist verification.</p>
            </div>
          )}

          {!hasScheduleX && hasScheduleH && (
            <div className="space-y-4 rounded-2xl border border-green-900 bg-[#0f1714] p-4">
              <DoctorConsult
                onUploadRx={() => setShowUpload(true)}
                onBookConsultation={() => onBookMedicalConsultation(`Prescription consultation for ${cart.map((item) => item.genericBrandName).join(', ')}`)}
              />
              {showUpload && (
                <div className="rounded-2xl border border-green-800 bg-green-950 p-4">
                  <p className="mb-3 text-sm font-bold text-green-300">📋 Upload a valid prescription to continue checkout</p>
                  <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-green-700 bg-[#0B1F1C] p-4 text-sm text-green-200">
                    <span>Select prescription image or PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setUploadedRxName(file?.name ?? '');
                      }}
                    />
                    <span className="inline-flex w-fit rounded-lg bg-green-600 px-3 py-2 font-bold text-white">Choose File</span>
                  </label>
                  {uploadedRxName && (
                    <p className="mt-3 text-xs text-green-300">Uploaded prescription: {uploadedRxName}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1 — Cart items */}
            {step === 'cart' && (
              <motion.div key="cart" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                {cart.length === 0 ? (
                  <motion.div
                    className={`rounded-2xl p-16 text-center ${isDark ? 'border border-white/10 bg-white/5' : 'border border-slate-200 bg-white'}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    <p className={`text-sm font-bold mb-6 ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Your cart is empty.</p>
                    <button onClick={onClose} className="text-[#00D084] font-black uppercase text-xs tracking-widest hover:underline">Browse Medicines</button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, i) => (
                      <motion.div
                        key={item.activeSalt}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className={`flex items-center gap-5 rounded-2xl p-5 ${isDark ? 'border border-white/10 bg-white/5 backdrop-blur-lg' : 'border border-slate-200 bg-white shadow-sm'}`}
                      >
                        {/* Icon */}
                        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${isDark ? 'bg-[#00D084]/10 text-[#00D084]' : 'bg-emerald-50 text-emerald-600'}`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                          <h4 className={`font-black truncate ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>{item.genericBrandName}</h4>
                          <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${isDark ? 'text-[#A0AEC0]' : 'text-slate-400'}`}>{item.activeSalt}</p>
                          <p className="mt-1 text-sm font-black text-[#00D084]">
                            ₹{item.genericPrice}
                            <span className={`ml-2 text-[10px] line-through ${isDark ? 'text-[#A0AEC0]' : 'text-slate-400'}`}>₹{item.brandedPrice}</span>
                          </p>
                        </div>

                        {/* Quantity stepper */}
                        <div className={`flex items-center gap-2 rounded-xl p-1.5 ${isDark ? 'bg-[#0B1F1C]' : 'bg-slate-100'}`}>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onUpdateQuantity(item.activeSalt, -1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg font-black transition ${isDark ? 'text-[#A0AEC0] hover:text-[#00D084]' : 'text-slate-500 hover:text-emerald-600'}`}
                          >-</motion.button>
                          <span className={`w-5 text-center text-sm font-black ${isDark ? 'text-[#F7FAFC]' : 'text-slate-900'}`}>{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onUpdateQuantity(item.activeSalt, 1)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg font-black transition ${isDark ? 'text-[#A0AEC0] hover:text-[#00D084]' : 'text-slate-500 hover:text-emerald-600'}`}
                          >+</motion.button>
                        </div>

                        {/* Remove */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onRemove(item.activeSalt)}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${isDark ? 'text-[#A0AEC0] hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — Address */}
            {step === 'address' && (
              <motion.div key="address" variants={pageVariants} initial="hidden" animate="visible" exit="exit"
                className={`rounded-2xl p-8 space-y-6 ${isDark ? 'border border-white/10 bg-white/5 backdrop-blur-lg' : 'border border-slate-200 bg-white shadow-sm'}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input
                      value={address.name}
                      onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="+91 XXXXX XXXXX"
                      inputMode="tel"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Delivery Address</label>
                  <textarea
                    value={address.line}
                    onChange={(e) => setAddress((p) => ({ ...p, line: e.target.value }))}
                    placeholder="Street, Landmark, Building..."
                    className={`${inputCls} h-28 resize-none`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input
                    value={address.pincode}
                    onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="400001"
                    inputMode="numeric"
                    className={inputCls}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Payment */}
            {step === 'payment' && (
              <motion.div key="payment" variants={pageVariants} initial="hidden" animate="visible" exit="exit"
                className={`rounded-2xl p-8 space-y-4 ${isDark ? 'border border-white/10 bg-white/5 backdrop-blur-lg' : 'border border-slate-200 bg-white shadow-sm'}`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Select Payment Method</p>
                {/* Only show Cashfree for UPI/Card, keep COD as fallback */}
                {['Instant UPI Transfer', 'Debit / Credit Card (Simulated)', 'Cash on Delivery'].map((method, i) => (
                  <motion.label
                    key={method}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 4 }}
                    className={`flex cursor-pointer items-center gap-5 rounded-2xl border px-5 py-4 transition ${
                      selectedMethod === method
                        ? 'border-[#00D084] bg-[#00D084]/10'
                        : isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      className="hidden"
                      checked={selectedMethod === method}
                      onChange={() => setSelectedMethod(method)}
                    />
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === method ? 'border-[#00D084]' : isDark ? 'border-white/20' : 'border-slate-300'}`}>
                      {selectedMethod === method && <div className="h-2.5 w-2.5 rounded-full bg-[#00D084]" />}
                    </div>
                    <span className={`font-black text-sm ${isDark ? 'text-[#F7FAFC]' : 'text-slate-800'}`}>{method}</span>
                    {method.includes('UPI') && <span className="ml-auto text-[10px] font-black text-[#00D084] uppercase tracking-widest">Recommended</span>}
                  </motion.label>
                ))}

                {/* Cashfree payment button for UPI/Card */}
                {(selectedMethod === 'Instant UPI Transfer' || selectedMethod.includes('Card')) && (
                  <button
                    type="button"
                    className="mt-6 w-full rounded-xl bg-[#00D084] py-3 font-black text-white shadow-lg transition hover:bg-emerald-700"
                    disabled={paymentState === 'processing'}
                    onClick={handleCashfreePay}
                  >
                    {paymentState === 'processing' ? 'Processing...' : 'Pay with Cashfree'}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Right column — Summary + CTA ────────────────────────── */}
        <div className="space-y-6">
          <motion.div
            className={`rounded-2xl p-7 ${isDark ? 'border border-white/10 bg-white/5 backdrop-blur-lg text-[#F7FAFC]' : 'border border-slate-200 bg-white shadow-sm text-slate-900'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
          >
            <h3 className={`mb-7 text-center text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}`}>Order Summary</h3>

            <div className="space-y-4 text-sm">
              {cart.map((item) => (
                <div key={item.activeSalt} className="flex justify-between">
                  <span className={`truncate max-w-[60%] font-semibold ${isDark ? 'text-[#A0AEC0]' : 'text-slate-600'}`}>
                    {item.genericBrandName} ×{item.quantity}
                  </span>
                  <span className="font-black">₹{(item.genericPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className={`my-5 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-bold">
                <span className={isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className={isDark ? 'text-[#A0AEC0]' : 'text-slate-500'}>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-[#48BB78] font-black' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
            </div>

            <div className={`my-5 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <div className="flex items-baseline justify-between">
              <span className="text-lg font-black uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black">₹{total.toLocaleString('en-IN')}</span>
            </div>

            {savings > 0 && (
              <div className={`mt-5 rounded-2xl border p-4 text-center ${isDark ? 'border-[#48BB78]/30 bg-[#48BB78]/10' : 'border-emerald-200 bg-emerald-50'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#48BB78]">You Save</p>
                <p className="text-xl font-black text-[#48BB78]">₹{savings.toLocaleString('en-IN')}</p>
              </div>
            )}

            {hasScheduleH && !hasScheduleX && (
              <div className="mt-5 rounded-2xl border border-green-800 bg-green-950 p-4 text-sm text-green-300">
                Prescription medicines detected. Upload a valid Rx to continue.
              </div>
            )}

            {hasScheduleX && (
              <div className="mt-5 rounded-2xl border border-red-800 bg-red-950 p-4 text-sm text-red-300">
                🚫 Cannot order online. Visit pharmacy.
              </div>
            )}
          </motion.div>

          {/* CTA button */}
          <motion.button
            disabled={cart.length === 0 || paymentState === 'processing' || isBlocked}
            onClick={() => {
              if (step === 'cart') setStep('address');
              else if (step === 'address') setStep('payment');
              else handlePayNow();
            }}
            className={`relative w-full overflow-hidden rounded-2xl border py-5 text-sm font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
              step === 'payment'
                ? 'border-[#00D084] bg-[#00D084] text-[#0B1F1C] shadow-lg shadow-[#00D084]/30'
                : isDark
                  ? 'border-[#00D084] bg-[#00D084] text-[#0B1F1C]'
                  : 'border-emerald-500 bg-emerald-500 text-white'
            }`}
            whileHover={cart.length > 0 ? { scale: 1.03 } : {}}
            whileTap={cart.length > 0 ? { scale: 0.97 } : {}}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            {/* Processing shimmer */}
            {paymentState === 'processing' && (
              <motion.span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ translateX: ['−100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              />
            )}
            {paymentState === 'processing'
              ? 'Processing payment...'
              : hasScheduleX
                ? 'Blocked for Online Sale'
                : hasScheduleH && !canProceedRestricted
                  ? 'Upload Prescription to Continue'
              : step === 'cart'
                ? 'Continue to Delivery'
                : step === 'address'
                  ? 'Continue to Payment'
                  : 'Pay Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
