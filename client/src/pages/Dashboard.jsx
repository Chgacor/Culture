import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CharacterTab from './tabs/CharacterTab';
import SocialTab from './tabs/SocialTab';
import WealthTab from './tabs/WealthTab';
import QuestsTab from './tabs/QuestsTab';
import CalendarTab from './tabs/CalendarTab';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('character');
  const [userData, setUserData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const applyTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(applyTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('culture_user'));
    if (!savedUser || !savedUser._id) {
      navigate('/');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5001/api/users/${savedUser._id}`);
      setUserData(response.data);
    } catch (error) {
      localStorage.removeItem('culture_user');
      navigate('/');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!userData) return <div className="text-center py-20 animate-pulse font-bold text-slate-500">Memuat Realm...</div>;

  const menus = [
    { id: 'character', name: 'Profile', icon: '👤' },
    { id: 'quests', name: 'Tasks', icon: '⚔️' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'wealth', name: 'Finance', icon: '💰' },
    { id: 'social', name: 'Tavern', icon: '🍻' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white transition-colors duration-300">
      
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col z-50 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">C</div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-widest">CULTURE</h1>
        </div>

        <nav className="flex-1 space-y-3">
          {menus.map(menu => (
            <button key={menu.id} onClick={() => setActiveMenu(menu.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${activeMenu === menu.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}>
              <span className="text-lg">{menu.icon}</span> {menu.name}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto mb-4 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-1">
          <button onClick={() => setTheme('light')} title="Light Mode" className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${theme === 'light' ? 'bg-white dark:bg-indigo-600 text-amber-500 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>☀️</button>
          <button onClick={() => setTheme('system')} title="System Mode" className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${theme === 'system' ? 'bg-white dark:bg-indigo-600 text-indigo-500 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>💻</button>
          <button onClick={() => setTheme('dark')} title="Dark Mode" className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${theme === 'dark' ? 'bg-white dark:bg-indigo-600 text-indigo-400 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>🌙</button>
        </div>

        <button onClick={() => { localStorage.removeItem('culture_user'); navigate('/'); }} className="w-full py-4 text-center rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">🚪 Logout</button>
      </aside>

      <main className="ml-64 pt-10 px-10 pb-10 min-h-screen">
        {activeMenu === 'character' && <CharacterTab userData={userData} setActiveMenu={setActiveMenu} refreshData={fetchUserData} />}
        {activeMenu === 'quests' && <QuestsTab userData={userData} refreshData={fetchUserData} />}
        {activeMenu === 'calendar' && <CalendarTab tasks={[]} />}
        {activeMenu === 'wealth' && <WealthTab userData={userData} />}
        {activeMenu === 'social' && <SocialTab userData={userData} />}
      </main>
    </div>
  );
}