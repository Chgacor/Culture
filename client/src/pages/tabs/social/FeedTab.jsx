import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function FeedTab({ userData }) {
  const [statusInput, setStatusInput] = useState('');
  const [feedPosts, setFeedPosts] = useState([]);

  const handlePostStatus = (e) => {
    e.preventDefault();
    if (!statusInput.trim()) return;
    
    const newPost = {
      id: Date.now(),
      user: userData.username,
      avatar: "😎", // Avatar statis sementara
      action: statusInput,
      time: "Baru saja",
      isMine: true
    };

    setFeedPosts([newPost, ...feedPosts]);
    setStatusInput('');
    toast.success('Status berhasil dibagikan ke Feed!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* BAGIAN KIRI: FORM & LIST FEED */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Quick Share Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4">Quick Share Status</h3>
          <form onSubmit={handlePostStatus}>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input 
                type="text" 
                value={statusInput} 
                onChange={(e) => setStatusInput(e.target.value)} 
                placeholder="Apa pencapaian atau fokusmu saat ini?" 
                className="flex-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/50" 
              />
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all">
                SHARE
              </button>
            </div>
            
            {/* Template Status Cepat */}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStatusInput('📖 Sedang Fokus Belajar')} className="px-4 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20">📖 Belajar</button>
              <button type="button" onClick={() => setStatusInput('💪 Olahraga Pagi')} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20">💪 Olahraga</button>
              <button type="button" onClick={() => setStatusInput('🎯 Menyelesaikan Sesi Deep Work!')} className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">🎯 Deep Work</button>
            </div>
          </form>
        </div>

        {/* Live Feed List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Live Feed</h3>
          
          {feedPosts.length === 0 ? (
            <div className="text-center py-10 opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
              <span className="text-4xl mb-3 block">📭</span>
              <p className="font-bold">Belum ada aktivitas.</p>
              <p className="text-sm">Bagikan pencapaian pertamamu di atas!</p>
            </div>
          ) : (
            feedPosts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">{post.avatar}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-sm">{post.user} {post.isMine && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-1">YOU</span>}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{post.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.action}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BAGIAN KANAN: GUILD WIDGET */}
      <div className="md:col-span-1">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-500/30">
          <h3 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Guild Status</h3>
          <p className="text-2xl font-black mb-4">Solo Player</p>
          <p className="text-sm font-medium opacity-90 mb-6">Tambahkan teman di menu <b>Friends</b> untuk melihat aktivitas mereka di Feed ini.</p>
        </div>
      </div>

    </div>
  );
}