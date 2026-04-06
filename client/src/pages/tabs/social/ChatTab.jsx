import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Hubungkan ke Portal Socket Backend
const socket = io('http://localhost:5001');

export default function ChatTab({ userData, refreshTrigger }) {
  const [friendsList, setFriendsList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef(null);

  // 1. FETCH DAFTAR TEMAN
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userData._id}/friends`);
        setFriendsList(response.data);
      } catch (error) { toast.error('Gagal memuat daftar kontak.'); } 
      finally { setIsLoading(false); }
    };
    if (userData?._id) fetchFriends();
  }, [userData, refreshTrigger]);

  // 2. SOCKET: MENDENGARKAN PESAN MASUK
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Tambahkan pesan yang masuk ke layar secara live!
      setMessages((prev) => [...prev, data]);
    });
    // Bersihkan listener agar tidak menumpuk ganda
    return () => socket.off("receive_message");
  }, []);

  // 3. FETCH RIWAYAT CHAT & JOIN ROOM SAAT KLIK TEMAN
  useEffect(() => {
    if (activeChat && userData) {
      // A. Fetch riwayat chat dari Database
      axios.get(`http://localhost:5001/api/users/chat/${userData._id}/${activeChat._id}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error("Gagal memuat riwayat"));

      // B. Buat kode rahasia ruang obrolan (Room ID unik untuk 2 orang ini)
      const room = [userData._id, activeChat._id].sort().join('-');
      socket.emit("join_room", room);
    }
  }, [activeChat, userData]);

  // 4. AUTO-SCROLL KE BAWAH
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // 5. FUNGSI KIRIM PESAN REAL-TIME
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const messageData = {
      senderId: userData._id,
      receiverId: activeChat._id,
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // A. Tampilkan di layar sendiri
    setMessages((prev) => [...prev, messageData]);
    setMessageInput('');

    // B. Tembakkan ke Socket (Teman)
    const room = [userData._id, activeChat._id].sort().join('-');
    socket.emit("send_message", { room, messageData });

    // C. Simpan ke Database agar abadi
    try {
      await axios.post('http://localhost:5001/api/users/chat/save', messageData);
    } catch (error) { toast.error("Koneksi Database bermasalah."); }
  };

  // ==========================================
  // FUNGSI REMOVE FRIEND
  // ==========================================
  const handleRemoveFriend = async (e, friendId, friendName) => {
    e.stopPropagation(); 
    if (!window.confirm(`Apakah kamu yakin ingin menendang ${friendName} dari aliansimu?`)) return;
    try {
      await axios.post('http://localhost:5001/api/users/remove-friend', { userId: userData._id, friendId: friendId });
      toast.success(`${friendName} dihapus.`, { icon: '🚪' });
      setFriendsList(prev => prev.filter(f => f._id !== friendId));
      if (activeChat?._id === friendId) { setActiveChat(null); setMessages([]); }
    } catch (error) { toast.error('Gagal memutus aliansi.'); }
  };

  // ... (SISA KODE RENDER JSX UI SAMA SEPERTI SEBELUMNYA)
  if (isLoading) return <div className="h-[500px] flex items-center justify-center text-slate-500 font-bold animate-pulse">Memuat Tavern...</div>;

  if (friendsList.length === 0) {
    return (
      <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 transition-colors shadow-sm">
        <span className="text-6xl mb-6">💬</span>
        <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Pesan Kosong</h2>
        <p className="text-slate-500 font-medium">Kamu belum memiliki kontak. Gunakan form di atas untuk mengundang Ksatria lain.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-hidden animate-in slide-in-from-right-4 duration-300 transition-colors">
      
      {/* SIDEBAR: DAFTAR TEMAN */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 transition-colors">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Direct Messages</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {friendsList.map(friend => (
            <div 
              key={friend._id}
              onClick={() => { setActiveChat(friend); setMessages([]); }} 
              className={`group w-full p-4 flex items-center gap-4 text-left transition-colors border-b border-slate-100 dark:border-slate-800/50 cursor-pointer ${activeChat?._id === friend._id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl shadow-inner border border-slate-300 dark:border-slate-600">👤</div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{friend.username}</h4>
                <p className="text-[10px] mt-0.5 truncate text-indigo-500 font-bold uppercase tracking-widest">{friend.cultureId}</p>
              </div>

              <button 
                onClick={(e) => handleRemoveFriend(e, friend._id, friend.username)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center justify-center shrink-0"
                title="Remove Friend"
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* RUANG OBROLAN */}
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-[#0b0f19] transition-colors ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
            <span className="text-6xl mb-4">📨</span>
            <p className="font-bold text-lg text-slate-900 dark:text-white">Pilih percakapan</p>
            <p className="text-sm text-slate-500">Klik salah satu teman di samping untuk mulai mengobrol.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 shadow-sm z-10 transition-colors">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-bold active:scale-95 transition-all">
                &lt; Back
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-inner border border-slate-300 dark:border-slate-600">👤</div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white">{activeChat.username}</h4>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{activeChat.cultureId}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-sm font-bold text-slate-500">
                  <span className="text-4xl mb-2">👋</span>
                  Katakan halo kepada {activeChat.username}!
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === userData._id;
                  return (
                    <div key={msg._id || msg.id} className={`flex flex-col max-w-[75%] animate-in slide-in-from-bottom-2 duration-200 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className={`p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">{msg.time} {isMe && <span className="text-indigo-400">✓</span>}</span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center relative">
                <input 
                  type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Ketik pesan ke ${activeChat.username}...`} 
                  className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-14 py-3.5 outline-none text-sm font-medium focus:ring-2 ring-indigo-500/50 transition-colors text-slate-900 dark:text-white" 
                />
                <button type="submit" disabled={!messageInput.trim()} className={`absolute right-2 p-2 rounded-lg font-black transition-all ${messageInput.trim() ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-500 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>↗</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}