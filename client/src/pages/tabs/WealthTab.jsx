import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import WalletDashboard from './wealth/WalletDashboard';
import WalletReports from './wealth/WalletReports';

export default function WealthTab({ userData }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  const [wallets, setWallets] = useState([]); 
  const [transactions, setTransactions] = useState([]); 

  // FUNGSI UNTUK MENARIK DATA DARI DATABASE
  const fetchWealthData = async () => {
    if (!userData?._id) return;
    try {
      const resWallets = await axios.get(`http://localhost:5001/api/wealth/wallets/${userData._id}`);
      setWallets(resWallets.data);
      
      const resTrx = await axios.get(`http://localhost:5001/api/wealth/transactions/${userData._id}`);
      setTransactions(resTrx.data);
    } catch (error) {
      toast.error('Gagal memuat data brankas.');
    }
  };

  // Panggil saat halaman dibuka
  useEffect(() => {
    fetchWealthData();
  }, [userData]);

  const formatCurrency = (amount) => {
    if (isPrivacyMode) return 'Rp ••••••••';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleTogglePrivacy = () => {
    setIsPrivacyMode(!isPrivacyMode);
    toast(isPrivacyMode ? 'Privacy Mode Dinonaktifkan 🔓' : 'Privacy Mode Diaktifkan 🔒', { icon: isPrivacyMode ? '👀' : '🛡️' });
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-300 pb-20">
      
      {/* HEADER & NAVIGASI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">The Vault</h2>
          <p className="text-slate-500 font-bold mt-1">Lacak kekayaan dan kuasai finansialmu.</p>
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button onClick={() => setActiveSubTab('dashboard')} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'dashboard' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Wallets</button>
            <button onClick={() => setActiveSubTab('reports')} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'reports' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Reports</button>
          </div>
          <button onClick={handleTogglePrivacy} className={`h-11 px-4 flex items-center justify-center rounded-xl font-bold text-sm transition-all shadow-sm border shrink-0 ${isPrivacyMode ? 'bg-slate-800 text-emerald-400 border-slate-700 shadow-emerald-500/10' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
            {isPrivacyMode ? '👁️ Sembunyikan' : '👁️‍🗨️ Tampilkan'}
          </button>
        </div>
      </div>

      {/* RENDER SUB-MODUL & KIRIMKAN PROP */}
      {activeSubTab === 'dashboard' && (
        <WalletDashboard wallets={wallets} transactions={transactions} formatCurrency={formatCurrency} userData={userData} refreshData={fetchWealthData} />
      )}
      {activeSubTab === 'reports' && (
        <WalletReports wallets={wallets} transactions={transactions} formatCurrency={formatCurrency} />
      )}

    </div>
  );
}