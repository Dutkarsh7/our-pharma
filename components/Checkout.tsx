
import React, { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  onUpdateQuantity: (salt: string, delta: number) => void;
  onRemove: (salt: string) => void;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, onUpdateQuantity, onRemove, onClose }) => {
  const [step, setStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  const [address, setAddress] = useState({ name: '', phone: '', line: '', pincode: '400001' });

  const subtotal = cart.reduce((acc, item) => acc + (item.genericPrice * item.quantity), 0);
  const brandedTotal = cart.reduce((acc, item) => acc + (item.brandedPrice * item.quantity), 0);
  const savings = brandedTotal - subtotal;
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + deliveryFee;

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto mt-24 rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-lg animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-emerald-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-[#F7FAFC] mb-4 tracking-tighter">Order Placed!</h2>
        <p className="text-[#A0AEC0] mb-4 font-medium leading-relaxed">Your delivery partner is at the pharmacy. Expect arrival within <span className="text-[#48BB78] font-black">2 Hours</span>.</p>
        <div className="bg-emerald-50 p-6 rounded-[32px] mb-12 border border-emerald-100">
          <p className="text-emerald-700 font-black text-sm uppercase tracking-widest">Daily Savings: ₹{savings.toLocaleString('en-IN')}</p>
        </div>
        <button 
          onClick={onClose}
          className="min-h-11 rounded-[24px] border border-[#00D084] bg-[#00D084] px-16 py-5 font-black uppercase tracking-widest text-[#0B1F1C] transition duration-200 hover:scale-105 hover:bg-transparent hover:text-[#00D084]"
        >
          Finish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={onClose} className="min-h-11 rounded-2xl border border-white/10 bg-white/5 p-3 text-[#A0AEC0] transition duration-200 hover:scale-105 hover:border-[#00D084] hover:text-[#00D084]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          {step === 'cart' ? 'My Cart' : step === 'address' ? 'Delivery' : 'Payment'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-lg">
                  <p className="text-[#A0AEC0] font-bold mb-8">Cart is empty.</p>
                  <button onClick={onClose} className="text-[#00D084] font-black uppercase text-xs tracking-widest hover:underline">Go Back</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.activeSalt} className="group flex items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.641.32a2 2 0 01-1.615.111l-2.073-.78c-1.29-.485-2.733-.312-3.864.482l-.634.444a2 2 0 00-.73 2.18l1.45 5.074a2 2 0 002.347 1.393l5.362-1.072a2 2 0 001.298-3.007L13.5 12.5" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-black text-[#F7FAFC]">{item.genericBrandName}</h4>
                      <p className="text-xs text-[#A0AEC0] font-bold uppercase tracking-widest">{item.activeSalt}</p>
                      <p className="text-sm font-black text-[#00D084] mt-2">₹{item.genericPrice} <span className="text-[10px] text-[#A0AEC0] line-through ml-2">₹{item.brandedPrice}</span></p>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl bg-[#0B1F1C] p-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.activeSalt, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#A0AEC0] hover:text-[#00D084] font-black transition"
                      >-</button>
                      <span className="text-sm font-black text-[#F7FAFC] w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.activeSalt, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#A0AEC0] hover:text-[#00D084] font-black transition"
                      >+</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {step === 'address' && (
            <div className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-lg">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Name</label>
                  <input type="text" className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1F1C] px-6 py-4 font-medium text-[#F7FAFC] outline-none transition focus:border-[#00D084]" placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Phone</label>
                  <input type="text" className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1F1C] px-6 py-4 font-medium text-[#F7FAFC] outline-none transition focus:border-[#00D084]" placeholder="+91" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Address</label>
                <textarea className="h-32 w-full rounded-xl border border-white/10 bg-[#0B1F1C] px-6 py-4 font-medium text-[#F7FAFC] outline-none transition focus:border-[#00D084]" placeholder="Street, Building..."></textarea>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-lg">
               <div className="space-y-6">
                 {['Cash on Delivery', 'Instant UPI Transfer', 'Saved Cards'].map((method) => (
                   <label key={method} className="group flex min-h-11 cursor-pointer items-center gap-6 rounded-2xl border border-white/10 p-6 transition hover:bg-white/5">
                     <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/20 group-hover:border-[#00D084]">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                     <span className="text-lg font-black text-[#F7FAFC] tracking-tight">{method}</span>
                   </label>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-[#F7FAFC] backdrop-blur-lg">
            <h3 className="mb-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-[#A0AEC0]">Checkout Summary</h3>
            <div className="space-y-6">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-[#A0AEC0]">Generic Total</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-[#A0AEC0]">2hr Priority Delivery</span>
                <span className={deliveryFee === 0 ? 'text-[#48BB78]' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="my-6 h-px bg-white/10"></div>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black uppercase tracking-widest">Pay</span>
                <span className="text-4xl font-black">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-8 rounded-2xl border border-[#48BB78]/30 bg-[#48BB78]/10 p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#48BB78]">Total Saving</p>
                <p className="text-xl font-black">₹{savings.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => {
              if (step === 'cart') setStep('address');
              else if (step === 'address') setStep('payment');
              else if (step === 'payment') setStep('success');
            }}
            className="min-h-11 w-full rounded-[32px] border border-[#00D084] bg-[#00D084] py-6 text-sm font-black uppercase tracking-[0.2em] text-[#0B1F1C] transition duration-200 hover:scale-105 hover:bg-transparent hover:text-[#00D084] active:scale-95 disabled:border-white/10 disabled:bg-white/10 disabled:text-[#A0AEC0]"
          >
            {step === 'cart' ? 'Delivery Address' : step === 'address' ? 'Payment Mode' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
