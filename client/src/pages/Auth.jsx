import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Jika user sudah login, langsung lempar ke Dashboard
  useEffect(() => {
    const savedUser = localStorage.getItem('culture_user');
    if (savedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      // Kita asumsikan backend jalan di port 5001
      const response = await axios.post(`http://localhost:5001/api/users${endpoint}`, formData);
      
      if (isLogin) {
        toast.success(response.data.message || 'Berhasil masuk!');
        localStorage.setItem('culture_user', JSON.stringify(response.data.user));
        // Beri jeda sedikit agar toast terlihat
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.success('Karakter berhasil dibuat! Silakan Login.');
        setIsLogin(true); // Pindah ke tab login
        setFormData({ ...formData, password: '' }); // Kosongkan password
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">
            CULTURE
          </h1>
          <p className="text-slate-400 font-bold tracking-widest text-sm uppercase">The Productivity Realm</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex gap-2 mb-8 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username {isLogin && '(atau Email)'}</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder={isLogin ? "Player_One" : "Pilih Username Unik..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/50 transition-all"
              />
            </div>

            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="player@culture.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/50 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/50 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 mt-6 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 ${isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20'}`}
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Masuk ke Realm' : 'Ciptakan Karakter')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}