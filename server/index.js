require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. GERBANG TOL
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

app.use(express.json()); 

// 2. JALUR API
// Pastikan nama file ini sesuai dengan yang ada di foldermu (userRoutes.js atau UserRoutes.js)
const userRoutes = require('./routes/UserRoutes'); 
const wealthRoutes = require('./routes/wealthRoutes');
app.use('/api/users', userRoutes);
app.use('/api/wealth', wealthRoutes);

app.get('/', (req, res) => {
  res.send('Server Culture RPG sudah menyala di PORT 5001! 🚀');
});

// 3. KONEKSI DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database MongoDB Berhasil Terhubung!'))
  .catch((err) => console.log('❌ Gagal terhubung ke MongoDB:', err));

// KITA PAKSA PINDAH KE PORT 5001 (Abaikan .env)
const PORT = 5001; 
app.listen(PORT, () => {
  console.log(`🔥 Server berhasil pindah dan berjalan di port ${PORT}`);
});