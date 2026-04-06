import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>

      {/* Navbar Minimalis */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          CULTURE
        </h1>
        <button 
          onClick={() => navigate('/auth')}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold backdrop-blur-md transition-all"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-500">
          Versi Beta 1.0 Telah Rilis
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Ubah Hidupmu Menjadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">RPG Epik.</span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Tingkatkan fokus, selesaikan misi harian, naikkan level karaktermu, dan bertarung bersama teman dalam satu ekosistem produktivitas yang dirancang untuk sang pemenang.
        </p>

        <button 
          onClick={() => navigate('/auth')}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl shadow-indigo-500/30 hover:scale-105 hover:shadow-indigo-500/50 transition-all active:scale-95 animate-in fade-in zoom-in duration-700 delay-300"
        >
          Mulai Petualangan 🚀
        </button>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl text-left hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6">⏳</div>
            <h3 className="text-xl font-black mb-3">Deep Work Timer</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Fokus penuh tanpa gangguan. Selesaikan misi untuk mendapatkan EXP dan naikkan status Intelligence (INT) mu.</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl text-left hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
            <h3 className="text-xl font-black mb-3">Gamification</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Ucapkan selamat tinggal pada to-do list yang membosankan. Lacak statistik hidupmu layaknya karakter game RPG.</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl text-left hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6">⚔️</div>
            <h3 className="text-xl font-black mb-3">Tavern & Guild</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Tambahkan teman dengan Culture ID, pamerkan pencapaianmu di Feed, dan atur jadwal mabar belajar bersama.</p>
          </div>
        </div>
      </main>
    </div>
  );
}