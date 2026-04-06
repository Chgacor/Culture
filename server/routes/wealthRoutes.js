const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// ==========================================
// 1. GET ALL WALLETS (Ambil data dompet)
// ==========================================
router.get('/wallets/:userId', async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.params.userId });
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data dompet', error: error.message });
  }
});

// ==========================================
// 2. CREATE WALLET (Bikin dompet baru)
// ==========================================
router.post('/wallets', async (req, res) => {
  try {
    const { userId, name, type, balance, color, icon } = req.body;
    const newWallet = new Wallet({ user: userId, name, type, balance, color, icon });
    const savedWallet = await newWallet.save();
    res.status(201).json({ message: 'Dompet berhasil dibuat!', wallet: savedWallet });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat dompet', error: error.message });
  }
});

// ==========================================
// 3. GET ALL TRANSACTIONS (Ambil riwayat)
// ==========================================
router.get('/transactions/:userId', async (req, res) => {
  try {
    // Ambil transaksi, urutkan dari yang terbaru, dan ambil info dompetnya
    const transactions = await Transaction.find({ user: req.params.userId })
                                        .sort({ date: -1 })
                                        .populate('wallet', 'name icon color');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: error.message });
  }
});

// ==========================================
// 4. ADD TRANSACTION (Catat Pemasukan/Pengeluaran)
// ==========================================
router.post('/transactions', async (req, res) => {
  try {
    const { userId, walletId, desc, category, amount, type } = req.body;

    // 1. Cek dompetnya ada atau tidak
    const wallet = await Wallet.findOne({ _id: walletId, user: userId });
    if (!wallet) return res.status(404).json({ message: 'Dompet tidak ditemukan!' });

    // 2. Cek saldo jika tipe transaksi adalah pengeluaran ('out')
    if (type === 'out' && wallet.balance < amount) {
      return res.status(400).json({ message: 'Saldo tidak mencukupi untuk transaksi ini!' });
    }

    // 3. Update Saldo Dompet
    if (type === 'in') {
      wallet.balance += Number(amount);
    } else if (type === 'out') {
      wallet.balance -= Number(amount);
    }
    await wallet.save(); // Simpan saldo baru

    // 4. Catat Transaksinya
    const newTransaction = new Transaction({ user: userId, wallet: walletId, desc, category, amount, type });
    const savedTransaction = await newTransaction.save();

    res.status(201).json({ 
      message: 'Transaksi berhasil dicatat!', 
      transaction: savedTransaction,
      updatedBalance: wallet.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mencatat transaksi', error: error.message });
  }
});

// ==========================================
// 5. EDIT WALLET (Ubah nama, saldo, dll)
// ==========================================
router.put('/wallets/:id', async (req, res) => {
  try {
    const updatedWallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Dompet berhasil diperbarui!', wallet: updatedWallet });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui dompet', error: error.message });
  }
});

// ==========================================
// 6. DELETE WALLET (Hapus kartu dompet)
// ==========================================
router.delete('/wallets/:id', async (req, res) => {
  try {
    await Wallet.findByIdAndDelete(req.params.id);
    // CATATAN: Idealnya kita juga menghapus transaksi yang terkait dengan dompet ini
    await Transaction.deleteMany({ wallet: req.params.id }); 
    res.status(200).json({ message: 'Dompet dan riwayatnya berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus dompet', error: error.message });
  }
});

module.exports = router;