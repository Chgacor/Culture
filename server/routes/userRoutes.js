const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 

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
// API 1: REGISTER
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

// ==========================================
// API 2: LOGIN
// ==========================================
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

    // Auto-patcher untuk player lama yang belum punya ID berurutan
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
// API 3: ADD FRIEND
// ==========================================
router.post('/add-friend', async (req, res) => {
  try {
    const { userId, friendCultureId } = req.body; 

    const friend = await User.findOne({ cultureId: friendCultureId });
    if (!friend) {
      return res.status(404).json({ message: 'Petarung dengan ID tersebut tidak ditemukan!' });
    }

    if (friend._id.toString() === userId) {
      return res.status(400).json({ message: 'Kamu tidak bisa menambahkan dirimu sendiri ke dalam Guild!' });
    }

    const user = await User.findById(userId);
    
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Kalian sudah berada di dalam Guild yang sama!' });
    }

    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    res.status(200).json({ 
      message: 'Berhasil menjalin aliansi!', 
      friend: { _id: friend._id, username: friend.username, cultureId: friend.cultureId } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server kewalahan saat menambahkan teman.', error: error.message });
  }
});

// ==========================================
// API 4: GET FRIENDS LIST (Diperlukan oleh ChatTab)
// ==========================================
router.get('/:id/friends', async (req, res) => {
  try {
    // Cari user berdasarkan ID, lalu 'populate' (ambil data asli) dari array friends-nya
    const user = await User.findById(req.params.id).populate('friends', 'username cultureId');
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar teman', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Cari user berdasarkan ID, kecualikan password agar aman
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Karakter tidak ditemukan di Realm!' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat profil karakter', error: error.message });
  }
});

module.exports = router;