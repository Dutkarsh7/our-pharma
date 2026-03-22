import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <section className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg border border-emerald-100">
      <h1 className="text-3xl font-bold text-emerald-700 mb-2">Contact Us</h1>
      <p className="text-xs text-gray-400 mb-6">Last updated on 22-03-2026 23:02:35</p>
      <div className="space-y-4 text-slate-800">
        <div>
          <span className="font-semibold">Merchant Legal entity name:</span> UTKARSH SHUKLA
        </div>
        <div>
          <span className="font-semibold">Registered Address:</span> T-25/9, DLF Phase-3, Gurgaon, Haryana, PIN: 122001
        </div>
        <div>
          <span className="font-semibold">Operational Address:</span> T-25/9, DLF Phase-3, Gurgaon, Haryana, PIN: 122001
        </div>
        <div>
          <span className="font-semibold">Telephone No:</span> <a href="tel:7827664217" className="text-emerald-700 underline">7827664217</a>
        </div>
        <div>
          <span className="font-semibold">E-Mail ID:</span> <a href="mailto:utkarshshukla0456@gmail.com" className="text-emerald-700 underline">utkarshshukla0456@gmail.com</a>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
