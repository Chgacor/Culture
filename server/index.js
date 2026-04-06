require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ==========================================
// TAMBAHAN UNTUK SOCKET.IO (REAL-TIME CHAT)
// ==========================================
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// 1. GERBANG TOL
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

app.use(express.json()); 

// ==========================================
// INISIALISASI SERVER & PORTAL SOCKET.IO
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// LOGIKA REAL-TIME SOCKET.IO
io.on("connection", (socket) => {
  console.log(`Ksatria terhubung ke portal: ${socket.id}`);

  // Bergabung ke ruang obrolan (Room)
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  // Menerima pesan dan langsung melemparnya ke teman di Room yang sama
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data.messageData);
  });

  socket.on("disconnect", () => {
    console.log(`Ksatria terputus dari portal: ${socket.id}`);
  });
});

// ==========================================
// 2. JALUR API
// ==========================================
// Pastikan nama file ini sesuai dengan yang ada di foldermu (userRoutes.js atau UserRoutes.js)
const userRoutes = require('./routes/UserRoutes'); 
const wealthRoutes = require('./routes/wealthRoutes');

app.use('/api/users', userRoutes);
app.use('/api/wealth', wealthRoutes);

app.get('/', (req, res) => {
  res.send('Server Culture RPG sudah menyala di PORT 5001! 🚀 (Real-Time Active)');
});

// ==========================================
// 3. KONEKSI DATABASE
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database MongoDB Berhasil Terhubung!'))
  .catch((err) => console.log('❌ Gagal terhubung ke MongoDB:', err));

// ==========================================
// 4. JALANKAN SERVER (MENGGUNAKAN server.listen)
// ==========================================
// KITA PAKSA PINDAH KE PORT 5001 (Abaikan .env)
const PORT = 5001; 

// SANGAT PENTING: Gunakan server.listen, BUKAN app.listen
server.listen(PORT, () => {
  console.log(`🔥 Server & Portal Real-Time berhasil pindah dan berjalan di port ${PORT}`);
});