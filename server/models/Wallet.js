const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Bank', 'E-Wallet', 'Cash', 'Savings', 'Custom'], required: true },
  balance: { type: Number, default: 0 },
  color: { type: String, default: 'from-blue-500 to-blue-700' },
  icon: { type: String, default: '💰' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wallet', WalletSchema);