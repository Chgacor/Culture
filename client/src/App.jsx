import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing'; // Tambahkan ini
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* 1. Halaman Pendaratan (Showcase) */}
      <Route path="/" element={<Landing />} />
      
      {/* 2. Halaman Login & Register */}
      <Route path="/auth" element={<Auth />} />
      
      {/* 3. Halaman Aplikasi Utama */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Jika URL ngawur, kembali ke Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;