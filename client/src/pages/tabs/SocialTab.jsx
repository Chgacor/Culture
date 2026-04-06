import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import FeedTab from './social/FeedTab';
import ChatTab from './social/ChatTab';
import InboxTab from './social/InboxTab';

export default function SocialTab({ userData }) {
  const [activeSubTab, setActiveSubTab] = useState('chat');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // STATE UNTUK FITUR SEARCH & INSPECT
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // 1. FUNGSI MENCARI PROFIL
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const response = await axios.get(`http://localhost:5001/api/users/search/${searchQuery}`);
      if (response.data._id === userData._id) {
        toast.error('Tidak bisa mencari diri sendiri!', { icon: '🪞' });
      } else {
        setSearchResult(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ksatria tidak ditemukan.');
    } finally {
      setIsSearching(false);
    }
  };

  // 2. FUNGSI MENGIRIM REQUEST SETELAH INSPECT
  const handleSendInvite = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/users/send-request', {
        userId: userData._id,
        friendCultureId: searchResult.cultureId,
      });
      toast.success(response.data.message || 'Permintaan aliansi telah dikirim!', { icon: '📨' });
      setSearchResult(null);
      setSearchQuery('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim permintaan.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-300 pb-20">
      
      {/* HEADER NAVIGASI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 transition-colors">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors">Tavern & Guild</h2>
          <p className="text-slate-500 font-bold mt-1">Cari ksatria, bentuk aliansi, dan mulai petualangan.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto transition-colors overflow-x-auto">
          <button onClick={() => setActiveSubTab('feed')} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'feed' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Feed</button>
          <button onClick={() => setActiveSubTab('chat')} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>💬 Chats</button>
          <button onClick={() => setActiveSubTab('inbox')} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeSubTab === 'inbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
            📥 Inbox 
            {userData?.pendingRequests?.length > 0 && (
              <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{userData.pendingRequests.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="animate-in slide-in-from-right-4 duration-300">
        
        {/* FITUR SEARCH & INSPECT BARU */}
        {(activeSubTab === 'chat' || activeSubTab === 'inbox') && (
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 shadow-sm transition-colors relative z-20">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 shrink-0">
                🔍 Cari Ksatria
              </h3>
              <form onSubmit={handleSearch} className="flex-1 flex gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchResult(null); }}
                  placeholder="Ketik Culture ID (Contoh: CULT-0001)..." 
                  className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white transition-colors focus:ring-2 ring-indigo-500"
                />
                <button type="submit" disabled={isSearching} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50">
                  {isSearching ? '...' : 'SEARCH'}
                </button>
              </form>
            </div>

            {/* KARTU PREVIEW HASIL PENCARIAN */}
            {searchResult && (
              <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-[2rem] shadow-xl animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
                  
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-200 dark:border-slate-700">🛡️</div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        {searchResult.username}
                        <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-md uppercase tracking-widest">
                          Lv. {Math.floor(Math.sqrt(searchResult.exp || 0) / 10) + 1}
                        </span>
                      </h4>
                      <p className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-widest">{searchResult.cultureId}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{searchResult.bio || 'A mysterious warrior.'}"</p>
                      
                      <div className="flex gap-4 mt-4">
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1"><span className="text-indigo-500">🧠</span> INT: {searchResult.stats?.int || 0}</span>
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1"><span className="text-rose-500">💪</span> STR: {searchResult.stats?.str || 0}</span>
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1"><span className="text-emerald-500">❤️</span> VIT: {searchResult.stats?.vit || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSendInvite} className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 active:scale-95 transition-all whitespace-nowrap">
                    📩 Send Invite
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'feed' && <FeedTab userData={userData} />}
        {activeSubTab === 'chat' && <ChatTab userData={userData} refreshTrigger={refreshTrigger} />}
        {activeSubTab === 'inbox' && <InboxTab userData={userData} />}
      </div>
    </div>
  );
}