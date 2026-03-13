
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Pharmacy Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring generic inventory & savings impact</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Live: 1,420 Scans today</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Scans', val: '12,842', color: 'bg-white' },
          { label: 'Avg. Savings %', val: '72%', color: 'bg-white' },
          { label: 'Inventory (Generic)', val: '852', color: 'bg-white' },
          { label: 'Revenue Saved', val: '₹12.4L', color: 'bg-emerald-600', text: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-[24px] border border-slate-100 shadow-sm`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${stat.text || 'text-slate-400'}`}>{stat.label}</p>
            <p className={`text-3xl font-black ${stat.text || 'text-slate-900'}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Recent Generic Substitutions</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline">Export CSV</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Brand</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generic Suggestion</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salt Match</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              { b: 'Glycomet 500', g: 'Generic Metformin', s: 'Metformin 500mg', st: 'Delivered' },
              { b: 'Augmentin 625', g: 'Amoxy-C 625', s: 'Amox + Clav', st: 'Pending Rx' },
              { b: 'Telma 40', g: 'Telmicheck 40', s: 'Telmisartan 40mg', st: 'Delivered' },
              { b: 'Crocin 650', g: 'Para-Pure 650', s: 'Paracetamol 650mg', st: 'Delivered' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-slate-800">{row.b}</td>
                <td className="px-8 py-5 text-sm font-bold text-emerald-600">{row.g}</td>
                <td className="px-8 py-5 text-xs text-slate-500">{row.s}</td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${row.st === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {row.st}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
