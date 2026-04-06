import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ChatTab({ userData }) {
  const [friendsList, setFriendsList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Riwayat pesan palsu berdasarkan gambarmu agar terlihat hidup
  const mockMessages = [
    { id: 1, senderId: 'F001', text: 'Bro, jadi ngerjain project hari ini?', time: '10:00' },
    { id: 2, senderId: userData._id, text: 'Jadi dong! Udah setup Database nih.', time: '10:05' },
    { id: 3, senderId: 'F001', text: 'Mantap, gas keun! 🚀 Nanti kabari kalau udah push ke Git.', time: '10:06' },
  ];
  const [messages, setMessages] = useState(mockMessages); 
  
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  // MENGAMBIL DAFTAR TEMAN ASLI DARI DATABASE
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userData._id}/friends`);
        setFriendsList(response.data);
      } catch (error) {
        toast.error('Gagal memuat daftar kontak.');
      } finally {
        setIsLoading(false);
      }
    };
    if (userData?._id) fetchFriends();
  }, [userData]);

  // Auto-scroll ke pesan terbawah saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderId: userData._id, // ID Aslimu
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  if (isLoading) {
    return <div className="h-[500px] flex items-center justify-center text-slate-500 font-bold animate-pulse">Memuat Tavern...</div>;
  }

  // KONDISI JIKA BELUM PUNYA TEMAN SAMA SEKALI
  if (friendsList.length === 0) {
    return (
      <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 animate-in slide-in-from-right-4 duration-300">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mb-6">💬</div>
        <h2 className="text-2xl font-black mb-2">Pesan Kosong</h2>
        <p className="text-slate-500 max-w-md">Kamu belum memiliki kontak. Gunakan sistem ID di menu Tavern (bersama tab Chat) untuk menambahkan teman baru sebelum bisa mengirim pesan.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-hidden animate-in slide-in-from-right-4 duration-300">
      
      {/* SIDEBAR: DAFTAR TEMAN ASLI DARI DATABASE */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Direct Messages</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {friendsList.map(friend => (
            <button 
              key={friend._id}
              // Set pesan ke palsu agar terlihat hidup berdasarkan gambarmu
              onClick={() => { setActiveChat(friend); setMessages(mockMessages); }} 
              className={`w-full p-4 flex items-center gap-4 text-left transition-colors border-b border-slate-100 dark:border-slate-800/50 ${activeChat?._id === friend._id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">👤</div>
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{friend.username}</h4>
                <p className="text-[10px] mt-0.5 truncate text-indigo-500 font-bold uppercase">{friend.cultureId}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RUANG OBROLAN (CHAT AREA) */}
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-[#0b0f19] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
            <span className="text-6xl mb-4">📨</span>
            <p className="font-bold text-lg">Pilih percakapan</p>
            <p className="text-sm">Klik salah satu teman di samping untuk mulai mengobrol.</p>
          </div>
        ) : (
          <>
            {/* Header Chat Area */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 shadow-sm z-10">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold">
                &lt; Back
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">👤</div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white">{activeChat.username}</h4>
                <p className="text-[10px] font-bold text-indigo-500 uppercase">{activeChat.cultureId}</p>
              </div>
            </div>

            {/* Bubble Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-30 text-sm font-bold">Belum ada obrolan dengan {activeChat.username}.</div>
              ) : (
                messages.map(msg => {
                  // Perbaiki logika untuk mockMessages
                  const isMe = msg.senderId === userData._id;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className={`p-4 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">{msg.time} {isMe && '✓✓'}</span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Ketik pesan ke ${activeChat.username}...`} 
                  className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:ring-2 ring-indigo-500/50" 
                />
                <button type="submit" className="p-3 px-5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all">
                  ↗
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      
    </div>
  );
}