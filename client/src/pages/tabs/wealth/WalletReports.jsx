import React, { useState, useMemo } from 'react';

export default function WalletReports({ wallets, transactions, formatCurrency }) {
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');

  const reportData = useMemo(() => {
    let filteredTrx = transactions;
    if (filterWallet !== 'all') {
      filteredTrx = filteredTrx.filter(t => t.wallet._id === filterWallet || t.wallet === filterWallet);
    }

    // Hitung Total Pemasukan & Pengeluaran
    const income = filteredTrx.filter(t => t.type === 'in').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = filteredTrx.filter(t => t.type === 'out').reduce((acc, curr) => acc + curr.amount, 0);
    const totalFlow = income + expense; // Digunakan untuk rasio grafik

    // Hitung persentase terpakai murni (Pengeluaran dibagi Pemasukan)
    const usedPercentage = income > 0 ? Math.round((expense / income) * 100) : 0;

    // Hitung Pengeluaran berdasarkan NAMA BARANG (desc) bukan kategori
    const expensesOnly = filteredTrx.filter(t => t.type === 'out');
    const itemMap = expensesOnly.reduce((acc, curr) => {
      const itemName = curr.desc || 'Tanpa Nama';
      acc[itemName] = (acc[itemName] || 0) + curr.amount;
      return acc;
    }, {});

    const topItems = Object.entries(itemMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return { income, expense, totalFlow, usedPercentage, topItems };
  }, [transactions, filterWallet, filterMonth]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      
      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap gap-4">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-amber-500 transition-shadow">
          <option value="all">Semua Waktu (All Time)</option>
          <option value="this_month">Bulan Ini</option>
        </select>
        
        <select value={filterWallet} onChange={(e) => setFilterWallet(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-amber-500 transition-shadow">
          <option value="all">Semua Dompet</option>
          {wallets.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] p-16 text-center opacity-50">
          <span className="text-6xl block mb-6">📈</span>
          <p className="font-bold text-xl mb-2">Laporan Belum Tersedia</p>
          <p className="text-sm">Catat transaksi pertamamu di tab Wallets untuk melihat metrik keuanganmu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-full">
          
          {/* ========================================== */}
          {/* KARTU 1: Cash Flow (Teks + Grafik Progress)  */}
          {/* ========================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm w-full relative overflow-hidden">
            {/* Dekorasi Glow Kembalikan agar terlihat premium */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-slate-100 dark:bg-slate-800/50 rounded-full blur-[80px] -z-0"></div>
            
            <div className="relative z-10 w-full">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Cash Flow Overview</h3>
              
              {/* Angka Clean tanpa Truncate */}
              <div className="flex flex-col xl:flex-row items-start xl:items-end gap-6 mb-8 w-full">
                <div className="min-w-0 flex-1 w-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> Total Pemasukan
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tight break-words whitespace-normal">
                    {formatCurrency(reportData.income)}
                  </p>
                </div>
                <div className="min-w-0 flex-1 w-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span> Total Pengeluaran
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-red-500 tracking-tight break-words whitespace-normal">
                    {formatCurrency(reportData.expense)}
                  </p>
                </div>
              </div>

              {/* Progress Bar Grafik (Ditingkatkan) */}
              <div className="pt-2">
                <div className="flex justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Rasio Arus Kas</span>
                  <span className="text-amber-500">{reportData.usedPercentage}% Terpakai</span>
                </div>
                
                <div className="w-full h-6 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-800 shadow-inner">
                  {reportData.totalFlow === 0 ? (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-800"></div>
                  ) : (
                    <>
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 relative" style={{ width: `${(reportData.income / reportData.totalFlow) * 100}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"></div>
                      </div>
                      <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-1000 relative" style={{ width: `${(reportData.expense / reportData.totalFlow) * 100}%` }}></div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400">
                  <span>{reportData.totalFlow > 0 ? Math.round((reportData.income / reportData.totalFlow) * 100) : 0}% In</span>
                  <span>{reportData.totalFlow > 0 ? Math.round((reportData.expense / reportData.totalFlow) * 100) : 0}% Out</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* KARTU 2: TOP SPENDING ITEMS (NAMA BARANG)  */}
          {/* ========================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm w-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Top Spending Items</h3>
            
            {reportData.topItems.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-sm font-bold opacity-70">
                Belum ada data pengeluaran.
              </div>
            ) : (
              <div className="space-y-6 w-full">
                {reportData.topItems.map((item, index) => {
                  const percentage = (item.amount / reportData.expense) * 100;
                  const colorClass = index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-indigo-500' : index === 2 ? 'bg-purple-500' : 'bg-slate-400';
                  
                  return (
                    <div key={item.name} className="group w-full">
                      <div className="flex justify-between items-end mb-3 gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white capitalize truncate" title={item.name}>{item.name}</p>
                        </div>
                        <div className="text-right shrink-0 max-w-[50%]">
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300 break-words whitespace-normal">{formatCurrency(item.amount)}</p>
                          <p className="text-[10px] font-bold text-slate-400">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}