import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import FeedTab from './social/FeedTab';
import ChatTab from './social/ChatTab';

export default function SocialTab({ userData }) {
  const [activeSubTab, setActiveSubTab] = useState('feed');
  const [friendCultureId, setFriendCultureId] = useState('');

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendCultureId.match(/^CULT-\d{4,}$/)) {
      toast.error('Format Culture ID salah! Contoh: CULT-0001');
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/users/add-friend', {
        userId: userData._id,
        friendCultureId: friendCultureId.toUpperCase(),
      });
      toast.success('Berhasil menjalin aliansi!');
      setFriendCultureId('');
      // Nanti di sini kita harus memicu refresh daftar teman di ChatTab
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server Error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-300 pb-20">
      
      {/* HEADER: Navigasi Sub-Tab & Fitur Add Friend (BARU) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Tavern & Guild</h2>
          <p className="text-slate-500 font-bold mt-1">Sistem ID dan pertemanan real-time.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          <button onClick={() => setActiveSubTab('feed')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'feed' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Activity Feed</button>
          <button onClick={() => setActiveSubTab('chat')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>💬 Chats</button>
        </div>
      </div>

      {/* RENDER SUB-MODUL BERDASARKAN TAB AKTIF */}
      <div className="animate-in slide-in-from-right-4 duration-300">
        
        {/* MODAL/SEKSI ADD FRIEND YANG DIPINDAHKAN DARI FRIENDS PAGE */}
        {activeSubTab === 'chat' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
              👥 Add Warrior by ID
            </h3>
            <form onSubmit={handleAddFriend} className="flex-1 flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                value={friendCultureId}
                onChange={e => setFriendCultureId(e.target.value)}
                placeholder="CULT-XXXX" 
                className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none text-sm font-bold uppercase tracking-widest"
              />
              <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20">ADD</button>
            </form>
          </div>
        )}

        {activeSubTab === 'feed' && <FeedTab userData={userData} />}
        {activeSubTab === 'chat' && <ChatTab userData={userData} />}
      </div>

    </div>
  );
}