require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

// Express uygulaması oluştur
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API rotaları
app.use('/api', apiRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    message: 'Türkiye\'de Geçmiş Olayları Sorgulama Sistemi API',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      years: '/api/years',
      summary: '/api/summary/:year/:category',
      events: '/api/events/:year/:category',
      eventDetail: '/api/event/:date/:title'
    }
  });
});

// 404 - Sayfa Bulunamadı
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

// Hata işleyici
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
}); 