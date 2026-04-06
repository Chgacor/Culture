const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ==========================================
  // IDENTITAS DASAR
  // ==========================================
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cultureId: { type: String, unique: true },
  
  // ==========================================
  // SISTEM SOSIAL & GUILD
  // ==========================================
  bio: { type: String, default: "A mysterious warrior in the world of Culture." },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Inbox permintaan pertemanan
  
  // ==========================================
  // SISTEM RPG (GAMIFICATION)
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