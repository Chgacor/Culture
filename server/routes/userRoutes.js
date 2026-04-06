const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const Message = require('../models/Message');

// ==========================================
// FUNGSI: GENERATOR ID URUTAN (CULT-0001)
// ==========================================
const generateSequentialId = async () => {
  const lastUser = await User.findOne({ cultureId: /^CULT-\d{4,}$/ }).sort({ _id: -1 });
  
  let nextNumber = 1;
  if (lastUser && lastUser.cultureId) {
    const lastNumber = parseInt(lastUser.cultureId.split('-')[1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  return `CULT-${String(nextNumber).padStart(4, '0')}`;
};

// ==========================================
// 1. AUTENTIKASI (REGISTER & LOGIN)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username atau Email sudah terdaftar!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCultureId = await generateSequentialId();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      cultureId: newCultureId
    });

    const savedUser = await newUser.save();
    savedUser.password = undefined; 
    res.status(201).json({ message: 'Karakter berhasil diciptakan!', user: savedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server Error saat mendaftar.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!user) {
      return res.status(400).json({ message: 'Karakter tidak ditemukan!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah!' });
    }

    if (!user.cultureId || !user.cultureId.match(/^CULT-\d{4,}$/)) {
      user.cultureId = await generateSequentialId();
      await user.save(); 
    }

    user.password = undefined; 
    res.status(200).json({ message: 'Berhasil masuk ke Realm!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error saat login', error: error.message });
  }
});


// ==========================================
// 2. SISTEM SOSIAL (SEARCH, REQUEST, REMOVE)
// PASTIKAN SEMUA RUTE SPESIFIK BERADA DI ATAS!
// ==========================================

// A. Search User
router.get('/search/:cultureId', async (req, res) => {
  try {
    const user = await User.findOne({ cultureId: req.params.cultureId.toUpperCase() }).select('-password');
    if (!user) return res.status(404).json({ message: 'Ksatria tidak ditemukan di realm ini!' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
});

// B. Kirim Request Pertemanan
router.post('/send-request', async (req, res) => {
  try {
    const { userId, friendCultureId } = req.body;
    const sender = await User.findById(userId);
    const receiver = await User.findOne({ cultureId: friendCultureId.toUpperCase() });

    if (!receiver) return res.status(404).json({ message: 'ID tidak ditemukan!' });
    if (sender._id.toString() === receiver._id.toString()) return res.status(400).json({ message: 'Tidak bisa invite diri sendiri!' });
    if (sender.friends.includes(receiver._id)) return res.status(400).json({ message: 'Kalian sudah beraliansi!' });
    if (receiver.pendingRequests.includes(sender._id)) return res.status(400).json({ message: 'Request sudah dikirim sebelumnya!' });

    receiver.pendingRequests.push(sender._id);
    await receiver.save();
    res.status(200).json({ message: 'Request terkirim! Menunggu verifikasi.' });
  } catch (error) { 
    res.status(500).json({ message: 'Error Server', error: error.message }); 
  }
});

// C. Terima / Tolak Request
router.post('/handle-request', async (req, res) => {
  try {
    const { userId, friendId, action } = req.body;
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== friendId.toString());

    if (action === 'accept') {
      user.friends.push(friendId);
      friend.friends.push(userId);
      await friend.save();
    }
    await user.save();
    res.status(200).json({ message: 'Selesai diproses' });
  } catch (error) { 
    res.status(500).json({ message: 'Error Server', error: error.message }); 
  }
});

// D. Hapus Teman
router.post('/remove-friend', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(404).json({ message: 'Karakter tidak ditemukan!' });

    user.friends = user.friends.filter(id => id.toString() !== friendId.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== userId.toString());

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Aliansi berhasil diputus.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memutus aliansi', error: error.message });
  }
});


// ==========================================
// 3. SISTEM PROFIL & GAMIFIKASI (SUB-ROUTES)
// ==========================================

// A. Edit Bio Profil
router.put('/:id/update-profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.bio = req.body.bio;
    await user.save();
    res.status(200).json(user);
  } catch (error) { 
    res.status(500).json({ message: 'Error update profile' }); 
  }
});

// B. Tambah EXP dari Quest
router.put('/:id/add-exp', async (req, res) => {
  try {
    const { exp, statKey, statValue } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.exp += exp;
    
    if (statKey && user.stats[statKey] !== undefined) {
      user.stats[statKey] += statValue;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status karakter', error: error.message });
  }
});

// C. Ambil Daftar Teman (Untuk Chat)
router.get('/:id/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'username cultureId');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar teman', error: error.message });
  }
});

// D. Ambil Data Inbox (Pending Requests)
router.get('/:id/requests', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('pendingRequests', '-password');
    res.status(200).json(user.pendingRequests);
  } catch (error) { 
    res.status(500).json({ message: 'Error memuat inbox' }); 
  }
});


// ==========================================
// 4. GET USER PROFILE UMUM (HARUS PALING BAWAH!)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Karakter tidak ditemukan di Realm!' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat profil karakter', error: error.message });
  }
});

// D. Ambil Data Inbox (Pending Requests)
router.get('/:id/requests', async (req, res) => {
  try {
    // KUNCI UTAMA ADA DI SINI: .populate() akan menukar ID dengan data asli karakter
    const user = await User.findById(req.params.id).populate('pendingRequests', '-password');
    res.status(200).json(user.pendingRequests);
  } catch (error) { 
    res.status(500).json({ message: 'Error memuat inbox' }); 
  }
});

// ==========================================
// 5. SISTEM CHAT REAL-TIME
// ==========================================

// A. Simpan Pesan Baru ke Database
router.post('/chat/save', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) { res.status(500).json({ message: 'Gagal menyimpan pesan' }); }
});

// B. Ambil Riwayat Obrolan Dua Karakter
router.get('/chat/:userId/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }); // Urutkan dari yang terlama ke terbaru
    
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ message: 'Gagal memuat chat' }); }
});

module.exports = router;