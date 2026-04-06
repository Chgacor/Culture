import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function CalendarTab({ tasks }) {
  // ==========================================
  // STATE KALENDER DINAMIS
  // ==========================================
  const [currentDate, setCurrentDate] = useState(new Date()); // Untuk mengatur Bulan yang sedang dilihat
  const [selectedDate, setSelectedDate] = useState(new Date()); // Untuk menandai Hari yang diklik

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('Routine');
  const [newTaskTime, setNewTaskTime] = useState('10:00');
  
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeOptions = ['Routine', 'Instant'];

  // Fungsi Logika Kalender
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Format YYYY-MM-DD untuk ditampilkan di Input Form
  const formatDateString = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateStr = formatDateString(selectedDate);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    toast.success(`${newTaskType} ditambahkan untuk tanggal ${selectedDateStr}!`);
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-300 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors">Hybrid Calendar</h2>
          <p className="text-slate-500 font-bold mt-1">Pilih tanggal untuk mengatur jadwal.</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-200 dark:border-emerald-500/30 transition-colors shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Smart Reminders Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ========================================== */}
        {/* KOLOM KIRI: KALENDER INTERAKTIF            */}
        {/* ========================================== */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            
            <div className="flex justify-between items-center mb-8">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-indigo-500 transition-colors active:scale-95">&lt;</button>
              <h3 className="text-lg font-black text-slate-900 dark:text-white transition-colors">{monthNames[month]} {year}</h3>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-indigo-500 transition-colors active:scale-95">&gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
              {/* Render Kotak Kosong (Sebelum Tanggal 1) */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} className="text-transparent">0</div>
              ))}

              {/* Render Tanggal Asli */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                if (isSelected) {
                  return <div key={day} onClick={() => handleDateClick(day)} className="bg-indigo-600 text-white rounded-xl flex items-center justify-center w-8 h-8 mx-auto shadow-lg shadow-indigo-500/40 cursor-pointer scale-110 transition-transform">{day}</div>
                }

                return (
                  <div key={day} onClick={() => handleDateClick(day)} className={`hover:text-indigo-500 cursor-pointer flex items-center justify-center w-8 h-8 mx-auto transition-all ${isToday ? 'border-2 border-indigo-500 text-indigo-500 rounded-xl' : ''}`}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* KOLOM KANAN: FORM & JADWAL TERPILIH        */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 relative z-20">
            <input 
              type="text" 
              value={newTaskTitle} 
              onChange={e => setNewTaskTitle(e.target.value)} 
              // Placeholder Otomatis mengikuti tanggal yang diklik!
              placeholder={`Tambah jadwal untuk ${selectedDateStr}...`} 
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 outline-none focus:ring-2 ring-indigo-500 text-sm font-medium transition-colors shadow-sm text-slate-900 dark:text-white" 
            />
            <div className="flex gap-3 h-[50px]">
              <div className="relative h-full shrink-0">
                <div onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 cursor-pointer flex justify-between items-center text-sm font-bold min-w-[120px] select-none transition-colors shadow-sm">
                  <span className="text-slate-700 dark:text-slate-200">{newTaskType}</span><span className="text-slate-400 text-[10px] ml-3">▼</span>
                </div>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {typeOptions.map(type => (
                      <div key={type} onClick={() => { setNewTaskType(type); setIsTypeDropdownOpen(false); }} className="px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors text-slate-700 dark:text-slate-200">{type}</div>
                    ))}
                  </div>
                )}
              </div>
              <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors cursor-pointer shrink-0" />
              <button type="submit" className="h-full px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0 flex items-center justify-center">+</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-48 flex flex-col">
              <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex justify-between">
                <span>Daily Routine</span>
                <span className="text-slate-400">{selectedDateStr}</span>
              </h3>
              <div className="flex-1 flex items-center text-slate-400 text-sm font-bold opacity-70">Tidak ada jadwal.</div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors h-48 flex flex-col">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex justify-between">
                <span>Instant Notes</span>
                <span className="text-slate-400">{selectedDateStr}</span>
              </h3>
              <div className="flex-1 flex items-center text-slate-400 text-sm font-bold opacity-70">Tidak ada catatan instan.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}