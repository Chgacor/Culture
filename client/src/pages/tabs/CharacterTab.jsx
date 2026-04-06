import React from 'react';

export default function CharacterTab({ userData, setActiveMenu }) {
  const exp = userData?.exp || 0; 
  const stats = userData?.stats || { int: 0, str: 0, dex: 0, vit: 0, luk: 0 };

  const currentLevel = Math.floor(Math.sqrt(exp) / 10) + 1;
  const expForCurrentLevel = Math.pow((currentLevel - 1) * 10, 2);
  const expForNextLevel = Math.pow(currentLevel * 10, 2);
  
  const expGainedInThisLevel = exp - expForCurrentLevel;
  const expNeededForNextLevel = expForNextLevel - expForCurrentLevel;
  const progressPercent = Math.min((expGainedInThisLevel / expNeededForNextLevel) * 100, 100);

  let title = 'Peasant'; let avatarIcon = '🧑‍🌾'; let frameColor = 'from-stone-400 to-stone-600'; let aura = 'shadow-stone-500/20';
  if (currentLevel >= 50) { title = 'King'; avatarIcon = '👑'; frameColor = 'from-amber-400 to-yellow-600'; aura = 'shadow-amber-500/40 ring-amber-500'; } 
  else if (currentLevel >= 15) { title = 'Knight'; avatarIcon = '⚔️'; frameColor = 'from-slate-300 to-slate-500'; aura = 'shadow-slate-400/30'; }

  const statOptions = [
    { key: 'int', name: 'INT', icon: '🧠', color: 'bg-indigo-500', text: 'text-indigo-500', desc: 'Meningkat saat belajar/coding. Syarat membuka badge "Scholar".', unlock: 20 },
    { key: 'str', name: 'STR', icon: '💪', color: 'bg-rose-500', text: 'text-rose-500', desc: 'Meningkat dari tugas fisik/rumah. Membuka visualisasi senjata.', unlock: 15 },
    { key: 'luk', name: 'LUK', icon: '🍀', color: 'bg-teal-500', text: 'text-teal-500', desc: 'Meningkat dari menabung. Memberikan diskon skin dan item langka.', unlock: 25 },
    { key: 'vit', name: 'VIT', icon: '❤️', color: 'bg-emerald-500', text: 'text-emerald-500', desc: 'Meningkat dengan rutinitas konsisten. Menjaga energi avatar harian.', unlock: 30 },
    { key: 'dex', name: 'DEX', icon: '⚡', color: 'bg-amber-500', text: 'text-amber-500', desc: 'Meningkat dari sesi Deep Work fokus. Mempercepat EXP.', unlock: 18 }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-300 pb-20">
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-[#0b0f19] rounded-[3rem] p-8 md:p-12 text-slate-900 dark:text-white shadow-xl relative overflow-hidden border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left transition-colors">
        <div className={`absolute top-[-50%] right-[-10%] w-96 h-96 bg-gradient-to-br ${frameColor} rounded-full blur-[120px] opacity-20`}></div>
        <div className="relative shrink-0">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br ${frameColor} p-1 shadow-2xl ${aura} transition-all duration-500`}>
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[2.3rem] flex items-center justify-center text-6xl md:text-7xl transition-colors">{avatarIcon}</div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg transition-colors">Lv. {currentLevel}</div>
        </div>
        <div className="flex-1 z-10 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mb-2">
            <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em]">{title} Class</h2>
            <div className="text-[10px] font-bold text-slate-500 uppercase flex gap-3">
              <span>EXP: {exp} / {expForNextLevel}</span>
              <span>•</span>
              <button onClick={() => setActiveMenu('social')} className="hover:text-amber-500 hover:underline">Guild: master</button>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{userData?.username || 'Player One'}</h1>
          <div className="w-full bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/50 backdrop-blur-sm shadow-inner transition-colors">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>EXP Progress</span>
              <span className="text-slate-900 dark:text-white">{exp - expForCurrentLevel} / {expForNextLevel - expForCurrentLevel} XP</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">📊 Attributes</h3>
          <div className="space-y-5">
            {statOptions.map(stat => (
              <div key={stat.key} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">{stat.icon} {stat.name}</span>
                  <span className={`font-black ${stat.text}`}>{stats[stat.key]}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{stat.desc}</p>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${Math.min(stats[stat.key], 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">🏆 Achievements & Perks</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className={`p-4 rounded-2xl border ${stats.int >= 20 ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'}`}>
              <div className="text-3xl mb-2">{stats.int >= 20 ? '📖' : '🔒'}</div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Scholar</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Syarat: INT 20. Menambahkan buku di avatar.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${stats.str >= 15 ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'}`}>
              <div className="text-3xl mb-2">{stats.str >= 15 ? '🗡️' : '🔒'}</div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Iron Sword</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Syarat: STR 15. Senjata dasar equip.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${stats.luk >= 25 ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'}`}>
              <div className="text-3xl mb-2">{stats.luk >= 25 ? '🎟️' : '🔒'}</div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Merchant</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Syarat: LUK 25. Diskon 10% rare skin.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${stats.vit >= 30 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 grayscale'}`}>
              <div className="text-3xl mb-2">{stats.vit >= 30 ? '🛡️' : '🔒'}</div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Stout Heart</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Syarat: VIT 30. Avatar tidak pernah kelelahan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}