import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function InboxTab({ userData }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch detail dari orang-orang yang mengirim request
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userData._id}/requests`);
        // Filter untuk memastikan tidak ada data 'null' atau rusak yang masuk
        const validRequests = response.data.filter(req => req && req._id && req.username);
        setRequests(validRequests);
      } catch (error) {
        console.error("Gagal memuat inbox");
      } finally {
        setIsLoading(false);
      }
    };
    if (userData?._id) fetchRequests();
  }, [userData]);

  const handleAction = async (friendId, action) => {
    try {
      await axios.post(`http://localhost:5001/api/users/handle-request`, {
        userId: userData._id,
        friendId: friendId,
        action: action // 'accept' atau 'reject'
      });
      
      toast.success(action === 'accept' ? 'Aliansi berhasil dijalin! 🤝' : 'Permintaan ditolak.');
      // Hapus dari UI langsung agar responsif
      setRequests(prev => prev.filter(req => req._id !== friendId));
    } catch (error) {
      toast.error('Gagal memproses permintaan.');
    }
  };

  if (isLoading) return <div className="text-center py-10 opacity-50 font-bold">Memeriksa Inbox...</div>;

  if (requests.length === 0) {
    return (
      <div className="h-[400px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 transition-colors shadow-sm">
        <span className="text-6xl mb-6">📭</span>
        <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Inbox Kosong</h2>
        <p className="text-slate-500 font-medium">Tidak ada permintaan aliansi baru yang perlu diverifikasi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
      {requests.map(req => {
        // Hitung level sementara untuk preview
        const reqLevel = Math.floor(Math.sqrt(req.exp || 0) / 10) + 1;
        const stats = req.stats || { int: 0, str: 0, dex: 0, vit: 0, luk: 0 };
        
        return (
          <div key={req._id} className="bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 p-1 rounded-[2rem] shadow-sm transition-all hover:shadow-md border border-slate-200 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
              
              {/* KIRI: INFO KARAKTER */}
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg border-2 border-white dark:border-slate-800">🛡️</div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700 shadow-md">Lv.{reqLevel}</div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {req.username || 'Unknown Warrior'} 
                    <span className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md border border-indigo-100 dark:border-indigo-500/20">{req.cultureId || 'CULT-????'}</span>
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1 line-clamp-2">"{req.bio || 'A mysterious warrior.'}"</p>
                  
                  {/* Preview Stats Singkat */}
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20">🧠 INT: {stats.int}</span>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-500/20">💪 STR: {stats.str}</span>
                  </div>
                </div>
              </div>

              {/* KANAN: TOMBOL AKSI */}
              <div className="flex gap-3 w-full md:w-auto justify-end shrink-0">
                <button onClick={() => handleAction(req._id, 'reject')} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl text-xs font-black uppercase transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30">IGNORE</button>
                <button onClick={() => handleAction(req._id, 'accept')} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">ACCEPT</button>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  );
}