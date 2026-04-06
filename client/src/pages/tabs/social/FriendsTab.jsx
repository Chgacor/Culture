import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FriendsTab({ userData }) {
  const [friendIdInput, setFriendIdInput] = useState('');
  const [friendsList, setFriendsList] = useState([]); // Mulai dari kosong sesuai permintaanmu
  const [isSearching, setIsSearching] = useState(false);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendIdInput.trim()) return;

    if (friendIdInput.toUpperCase() === userData.cultureId) {
      return toast.error("Kamu tidak bisa menambahkan diri sendiri!");
    }

    setIsSearching(true);
    try {
      // Menghubungkan ke API Backend yang kita buat sebelumnya
      const response = await axios.post('http://localhost:5001/api/users/add-friend', {
        userId: userData._id,
        friendCultureId: friendIdInput.toUpperCase()
      });

      // Jika berhasil, tambahkan ke list lokal
      setFriendsList([...friendsList, response.data.friend]);
      setFriendIdInput('');
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'ID tidak ditemukan atau server bermasalah');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
      
      {/* BAGIAN KIRI: KARTU IDENTITAS PLAYER */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden h-fit">
        {/* Dekoratif Latar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto rounded-[2rem] bg-indigo-600 flex items-center justify-center text-4xl text-white shadow-2xl shadow-indigo-500/40 mb-6 border-4 border-white dark:border-slate-900 mt-10 rotate-3 hover:rotate-0 transition-transform duration-300">
            😎
          </div>
          
          <h3 className="text-2xl font-black mb-1">{userData.username}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">
            Level {userData.level} • {userData.userClass}
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[1.5rem] border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">My Public Culture ID</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-mono text-2xl font-black text-indigo-500 tracking-tighter select-all">
                {userData.cultureId || 'CULT-LOADING'}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userData.cultureId);
                  toast.success('ID Tersalin!');
                }}
                className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm hover:bg-indigo-500 hover:text-white transition-all active:scale-90"
              >
                📋
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-6 font-medium">
            Berikan ID ini kepada temanmu agar mereka bisa melihat kalender publikmu.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: MANAJEMEN TEMAN */}
      <div className="space-y-6">
        
        {/* Form Cari Teman */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Add Warrior by ID
          </h3>
          <form onSubmit={handleAddFriend} className="flex gap-2">
            <input 
              type="text" 
              value={friendIdInput} 
              onChange={(e) => setFriendIdInput(e.target.value)} 
              placeholder="CULT-XXXXXX" 
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm uppercase outline-none focus:ring-2 ring-indigo-500/50 transition-all" 
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className={`bg-indigo-600 text-white px-8 rounded-xl font-black shadow-lg shadow-indigo-500/20 transition-all active:scale-95 ${isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
            >
              {isSearching ? '...' : 'ADD'}
            </button>
          </form>
        </div>

        {/* List Teman (Kondisi Kosong / Isi) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
            Guild Members ({friendsList.length})
          </h3>
          
          {friendsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <span className="text-5xl mb-4">🏜️</span>
              <p className="font-bold text-sm">Guild Masih Kosong</p>
              <p className="text-xs mt-1">Belum ada petarung yang kamu ikuti.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendsList.map(friend => (
                <div key={friend.cultureId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg">👤</div>
                    <div>
                      <p className="font-black text-sm">{friend.username}</p>
                      <p className="text-[10px] font-bold text-indigo-500">{friend.cultureId}</p>
                    </div>
                  </div>
                  <button className="p-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      
    </div>
  );
}