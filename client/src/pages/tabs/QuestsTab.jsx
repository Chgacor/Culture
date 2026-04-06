import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function QuestsTab({ userData, refreshData }) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('Deep Work');
  const [newTaskDuration, setNewTaskDuration] = useState(120);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeOptions = ['Deep Work', 'Routine', 'Instant'];

  const [timeLeft, setTimeLeft] = useState(7200);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('Work');
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      
      if (timerMode === 'Work' && activeTaskId) {
        const completedTask = tasks.find(t => t.id === activeTaskId);
        setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, status: 'done' } : t));
        setActiveTaskId(null);

        let statKey = 'vit'; let expGain = 50; let statGain = 2;
        if (completedTask.type === 'Deep Work') { statKey = 'int'; expGain = 100; statGain = 3; }

        axios.put(`http://localhost:5001/api/users/${userData._id}/add-exp`, { exp: expGain, statKey: statKey, statValue: statGain })
          .then(() => {
            refreshData(); 
            toast.success(`Misi selesai! +${expGain} EXP & +${statGain} ${statKey.toUpperCase()}`, { icon: '🏆', duration: 5000 });
          })
          .catch(() => toast.error('Gagal menyimpan EXP ke server.'));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timerMode, activeTaskId, tasks, userData, refreshData]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  const getMaxTime = () => timerMode === 'Rest' ? 1800 : (activeTaskId ? tasks.find(t => t.id === activeTaskId)?.duration * 60 : 7200);
  const progressPercentage = ((getMaxTime() - timeLeft) / getMaxTime()) * 100 || 0;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([{ id: Date.now(), title: newTaskTitle, type: newTaskType, duration: newTaskType === 'Instant' ? 0 : parseInt(newTaskDuration) || 0, status: 'pending', time: "", date: getTodayDate() }, ...tasks]);
    setNewTaskTitle('');
    toast.success('Misi ditambahkan!');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) { setActiveTaskId(null); setIsActive(false); setTimeLeft(7200); }
  };

  const startTaskTimer = (task) => {
    if (task.type === 'Instant') {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done' } : t));
      
      axios.put(`http://localhost:5001/api/users/${userData._id}/add-exp`, { exp: 20, statKey: 'str', statValue: 1 })
        .then(() => { refreshData(); toast.success('Misi Instant selesai! +20 EXP', { icon: '⚡' }); })
        .catch(() => toast.error('Gagal menyimpan EXP.'));
      return;
    }
    setActiveTaskId(task.id); setTimerMode('Work'); setTimeLeft(task.duration * 60); setIsActive(true);
  };

  const switchMode = (mode) => {
    setIsActive(false); setTimerMode(mode); setTimeLeft(mode === 'Work' ? 7200 : 1800); setActiveTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Daily Quests</h3>
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Ketik misi baru..." className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 text-sm font-medium transition-colors" />
            <div className="flex gap-2 relative">
              <div className="relative">
                <div onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center text-sm font-bold min-w-[140px] select-none transition-colors h-full">
                  <span className="text-slate-700 dark:text-slate-200">{newTaskType}</span>
                  <span className="text-slate-400 text-xs ml-3">▼</span>
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {typeOptions.map(type => (
                      <div key={type} onClick={() => { setNewTaskType(type); setIsTypeDropdownOpen(false); }} className="px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors text-slate-700 dark:text-slate-200">{type}</div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0">ADD</button>
            </div>
          </form>

          <div className="space-y-3">
            {tasks.filter(t => t.status === 'pending').length === 0 ? (
              <div className="text-center py-10 opacity-50 font-bold text-sm">Semua misi harian telah selesai! 🎉</div>
            ) : (
              tasks.filter(t => t.status === 'pending').map(task => (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${activeTaskId === task.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{task.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{task.type} {task.duration > 0 && `• ${task.duration} MINS`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTaskId !== task.id && (
                      <button onClick={() => startTaskTimer(task)} className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all text-sm">{task.type === 'Instant' ? '✓' : '▶'}</button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-sm">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-[#0b0f19] text-slate-900 dark:text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative border border-slate-200 dark:border-slate-800 text-center flex flex-col h-full min-h-[400px] transition-colors">
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-10 w-full transition-colors">
            <button onClick={() => switchMode('Work')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timerMode === 'Work' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Focus</button>
            <button onClick={() => switchMode('Rest')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timerMode === 'Rest' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Rest</button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 mb-4 h-5">
              {activeTaskId ? tasks.find(t => t.id === activeTaskId)?.title : (timerMode === 'Rest' ? 'Waktunya Jeda' : 'Pilih Misi untuk Mulai')}
            </p>

            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800 transition-colors" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * progressPercentage) / 100} className="text-indigo-500 transition-all duration-1000 ease-linear" />
              </svg>
              <h1 className="text-5xl font-black tracking-tighter tabular-nums z-10">{formatTime(timeLeft)}</h1>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsActive(!isActive)} className="w-16 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                {isActive ? '⏸' : '▶'}
              </button>
              <button onClick={() => { setIsActive(false); setTimeLeft(getMaxTime()); }} className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xl transition-all active:scale-95">
                ⏹
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}