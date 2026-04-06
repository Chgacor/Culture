import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function WalletDashboard({ wallets, transactions, formatCurrency, userData, refreshData }) {
  const totalWealth = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [walletForm, setWalletForm] = useState({ name: '', type: 'Bank', balance: '', color: 'from-blue-500 to-blue-700', icon: '🏦' });
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [trxForm, setTrxForm] = useState({ walletId: '', desc: '', category: '', amount: '', type: 'out' });
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

  const typeOptions = ['Bank', 'E-Wallet', 'Cash', 'Savings'];
  const colorOptions = ['from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-amber-400 to-orange-500', 'from-purple-500 to-indigo-600', 'from-rose-400 to-red-600', 'from-slate-700 to-slate-900'];
  const iconOptions = ['🏦', '📱', '💵', '🛡️', '💳', '💎'];

  const openAddWalletModal = () => { setEditId(null); setWalletForm({ name: '', type: 'Bank', balance: '', color: 'from-blue-500 to-blue-700', icon: '🏦' }); setIsWalletModalOpen(true); };
  const openEditWalletModal = (wallet) => { setEditId(wallet._id); setWalletForm({ name: wallet.name, type: wallet.type, balance: wallet.balance, color: wallet.color, icon: wallet.icon }); setIsWalletModalOpen(true); };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!userData || !userData._id) return toast.error("ID tidak terdeteksi. Silakan Login ulang.");
    try {
      const payload = { ...walletForm, balance: Number(walletForm.balance) || 0 };
      if (editId) {
        await axios.put(`http://localhost:5001/api/wealth/wallets/${editId}`, payload); toast.success('Dompet diupdate!');
      } else {
        await axios.post('http://localhost:5001/api/wealth/wallets', { ...payload, userId: userData._id }); toast.success('Dompet ditambahkan!');
      }
      setIsWalletModalOpen(false); refreshData(); 
    } catch (error) { toast.error(error.response?.data?.message || 'Server Error.'); }
  };

  const handleDeleteWallet = async (id, name) => {
    if (window.confirm(`Hapus dompet ${name} beserta riwayatnya?`)) {
      try { await axios.delete(`http://localhost:5001/api/wealth/wallets/${id}`); toast.success('Dompet dihapus.'); refreshData(); } 
      catch (error) { toast.error('Gagal menghapus.'); }
    }
  };

  const openTrxModal = () => {
    if (wallets.length === 0) return toast.error("Buat dompet dulu!");
    setTrxForm({ walletId: wallets[0]._id, desc: '', category: '', amount: '', type: 'out' }); setIsTrxModalOpen(true);
  };

  const handleTrxSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/wealth/transactions', { ...trxForm, userId: userData._id, amount: Number(trxForm.amount), category: trxForm.category || 'Lainnya' });
      toast.success(trxForm.type === 'in' ? 'Pemasukan dicatat!' : 'Pengeluaran dicatat!');
      setIsTrxModalOpen(false); refreshData();
    } catch (error) { toast.error('Gagal mencatat transaksi.'); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-300">
      
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-[#0b0f19] text-slate-900 dark:text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Total Net Worth</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">{formatCurrency(totalWealth)}</h1>
            <div className="flex flex-wrap gap-4">
              <button onClick={openAddWalletModal} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white dark:text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2">
                <span>+</span> Add Wallet
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-2">My Accounts</h3>
          {wallets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center opacity-60">
              <span className="text-4xl mb-3 block">🏦</span>
              <p className="font-bold">Belum ada dompet.</p>
              <p className="text-xs">Klik "Add Wallet" untuk mulai mencatat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map(wallet => (
                <div key={wallet._id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/30 transition-colors group relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditWalletModal(wallet)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs hover:bg-indigo-500 hover:text-white transition-colors">✏️</button>
                    <button onClick={() => handleDeleteWallet(wallet._id, wallet.name)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-xl shadow-lg text-white`}>{wallet.icon}</div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white pr-16">{wallet.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wallet.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">{formatCurrency(wallet.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col min-h-[400px]">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <span className="text-4xl mb-2 block">🧾</span>
                <p className="text-sm font-bold">Belum ada transaksi.</p>
              </div>
            ) : (
              transactions.map(trx => {
                 const trxWallet = wallets.find(w => w._id === trx.wallet._id);
                 return (
                  <div key={trx._id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${trx.type === 'in' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                          {trx.type === 'in' ? '↓' : '↑'}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{trx.desc}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">{new Date(trx.date).toLocaleDateString('id-ID')} • {trxWallet ? trxWallet.name : 'Terhapus'}</p>
                        </div>
                      </div>
                      <p className={`font-black text-sm whitespace-nowrap text-right ${trx.type === 'in' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {trx.type === 'in' ? '+' : '-'}{formatCurrency(trx.amount)}
                      </p>
                  </div>
                 )
              })
            )}
          </div>
          <button onClick={openTrxModal} className="w-full mt-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <span className="text-lg">+</span> Record Transaction
          </button>
        </div>
      </div>

      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative">
            <button onClick={() => setIsWalletModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
            <h2 className="text-xl font-black mb-6">{editId ? 'Edit Wallet' : 'Create New Wallet'}</h2>
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Dompet</label>
                <input type="text" required value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} placeholder="Misal: BCA Utama" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500 text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipe</label>
                  <div onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{walletForm.type}</span><span className="text-slate-400 text-xs">▼</span>
                  </div>
                  {isTypeDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      {typeOptions.map(type => <div key={type} onClick={() => { setWalletForm({...walletForm, type}); setIsTypeDropdownOpen(false); }} className="px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">{type}</div>)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Saldo (Rp)</label>
                  <input type="number" required value={walletForm.balance} onChange={e => setWalletForm({...walletForm, balance: e.target.value})} placeholder="0" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500 text-sm font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 mt-2">Pilih Ikon</label>
                <div className="flex gap-2">
                  {iconOptions.map(icon => <button type="button" key={icon} onClick={() => setWalletForm({...walletForm, icon})} className={`w-12 h-12 rounded-xl text-xl transition-all ${walletForm.icon === icon ? 'bg-slate-200 dark:bg-slate-700 ring-2 ring-amber-500' : 'bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800'}`}>{icon}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 mt-2">Warna Kartu</label>
                <div className="flex gap-2">
                  {colorOptions.map(color => <button type="button" key={color} onClick={() => setWalletForm({...walletForm, color})} className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all ${walletForm.color === color ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-amber-500 scale-110' : 'border border-transparent'}`}></button>)}
                </div>
              </div>
              <button type="submit" className="w-full mt-6 py-4 bg-amber-500 hover:bg-amber-400 text-white dark:text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95">{editId ? 'Simpan Perubahan' : 'Buat Dompet'}</button>
            </form>
          </div>
        </div>
      )}

      {isTrxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative">
            <button onClick={() => setIsTrxModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold">✕</button>
            <h2 className="text-xl font-black mb-6">Catat Transaksi</h2>
            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button onClick={() => setTrxForm({...trxForm, type: 'out'})} className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${trxForm.type === 'out' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500'}`}>↑ Pengeluaran</button>
              <button onClick={() => setTrxForm({...trxForm, type: 'in'})} className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${trxForm.type === 'in' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>↓ Pemasukan</button>
            </div>
            <form onSubmit={handleTrxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dompet Sumber</label>
                <div className="relative">
                  <div onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center text-sm font-medium">
                    <span>{wallets.find(w => w._id === trxForm.walletId)?.name || 'Pilih Dompet'}</span><span className="text-slate-400 text-xs">▼</span>
                  </div>
                  {isWalletDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto">
                      {wallets.map(w => <div key={w._id} onClick={() => { setTrxForm({...trxForm, walletId: w._id}); setIsWalletDropdownOpen(false); }} className="px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">{w.icon} {w.name} ({formatCurrency(w.balance)})</div>)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Deskripsi</label>
                <input type="text" required value={trxForm.desc} onChange={e => setTrxForm({...trxForm, desc: e.target.value})} placeholder={trxForm.type === 'out' ? 'Misal: Beli Kopi' : 'Misal: Gaji Bulanan'} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500 text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kategori (Opsional)</label>
                  <input type="text" value={trxForm.category} onChange={e => setTrxForm({...trxForm, category: e.target.value})} placeholder="Misal: Food" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nominal (Rp)</label>
                  <input type="number" required value={trxForm.amount} onChange={e => setTrxForm({...trxForm, amount: e.target.value})} placeholder="0" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-amber-500 text-sm font-medium" />
                </div>
              </div>
              <button type="submit" className={`w-full mt-6 py-4 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${trxForm.type === 'out' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}>Simpan Transaksi</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}