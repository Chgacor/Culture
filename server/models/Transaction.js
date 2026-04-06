const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['in', 'out', 'transfer'], required: true }, // 'in' = Pemasukan, 'out' = Pengeluaran
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);