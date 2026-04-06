const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cultureId: { type: String, unique: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ==========================================
  // RPG SYSTEM DATA (Wadah untuk Data Asli)
  // ==========================================
  exp: { type: Number, default: 0 },
  stats: {
    int: { type: Number, default: 0 },
    str: { type: Number, default: 0 },
    dex: { type: Number, default: 0 },
    vit: { type: Number, default: 0 },
    luk: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);