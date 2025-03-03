# Türkiye'de Geçmiş Olayları Sorgulama Sistemi

Bu proje, kullanıcıların interaktif olarak yıl, kategori ve gün bazlı sorgular yaparak Türkiye'de yaşanan olayları görüntüleyebileceği bir sistem sunmaktadır.

## 🚀 Özellikler

- **İnteraktif Zaman Çizelgesi**: 1923'ten günümüze kadar olan olayları görselleştiren dinamik zaman çizelgesi
- **Kategori Bazlı Sorgulama**: Siyasi, ekonomik, sosyal, doğal afet ve daha birçok kategoride olay sorgulama
- **AI Destekli İçerik**: Gemini veya OpenAI API kullanarak olaylar hakkında detaylı özetler ve açıklamalar
- **Verimli Önbellekleme**: Redis ile optimize edilmiş önbellekleme sistemi
- **Modern Arayüz**: Material-UI ile tasarlanmış, kullanıcı dostu ve responsive arayüz
- **Gerçek Zamanlı Güncellemeler**: Yeni olaylar ve güncellemeler için otomatik içerik üretimi
- **Detaylı Olay Sayfaları**: Her olay için zaman çizelgesi, ilgili olaylar ve kaynaklar

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- Redis (v6 veya üzeri)
- OpenAI API Anahtarı veya Gemini API Anahtarı

## 🔧 Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/ugurer/historyAi.git
   cd historyAi
   ```

2. Backend bağımlılıklarını yükleyin:
   ```bash
   npm install
   ```

3. Frontend bağımlılıklarını yükleyin:
   ```bash
   cd src/frontend
   npm install
   ```

4. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:
   ```bash
   cp .env.example .env
   ```

5. Veritabanını kurun:
   ```bash
   npm run setup-db
   ```

6. Uygulamayı başlatın:
   ```bash
   # Backend sunucusunu başlat
   npm run dev
   
   # Frontend geliştirme sunucusunu başlat (yeni bir terminal penceresinde)
   cd src/frontend
   npm run dev
   ```

## 🏗️ Proje Yapısı

```
historyAi/
├── src/
│   ├── backend/
│   │   ├── routes/      # API rotaları
│   │   ├── services/    # İş mantığı servisleri
│   │   └── server.js    # Express sunucusu
│   ├── database/
│   │   ├── db.js        # PostgreSQL bağlantısı
│   │   ├── redis.js     # Redis bağlantısı
│   │   └── setup.js     # Veritabanı kurulumu
│   └── frontend/
│       ├── components/  # React bileşenleri
│       ├── pages/      # Next.js sayfaları
│       └── services/   # API istemci servisleri
├── .env.example        # Örnek çevre değişkenleri
└── package.json        # Proje bağımlılıkları
```

## 💾 Veritabanı Şeması

### Tablolar

1. **yearly_summaries**
   - Yıl ve kategori bazlı AI özetleri
   - Önbellek entegrasyonu ile optimize edilmiş sorgulamalar

2. **event_details**
   - Belirli olaylar için detaylı AI açıklamaları
   - Tarih, başlık ve önem derecesi bilgileri

3. **categories**
   - Olay kategorileri ve açıklamaları
   - Dinamik kategori yönetimi

4. **predefined_events**
   - Önceden tanımlanmış önemli olaylar
   - Kategori bazlı sınıflandırma ve önem derecelendirmesi

## 🔌 API Endpoints

- `GET /api/categories` - Tüm kategorileri listele
- `GET /api/years` - Yıl listesini getir (1923'ten günümüze)
- `GET /api/summary/:year/:category` - Yıl ve kategori bazlı özet
- `GET /api/events/:year/:category` - Belirli bir yıl ve kategorideki olaylar
- `GET /api/event/:date/:title` - Belirli bir olay hakkında detaylı bilgi

## 🎯 Gelecek Özellikler

- [ ] Kullanıcı hesapları ve kişiselleştirilmiş içerik
- [ ] Olay yorumları ve tartışma platformu
- [ ] Görsel ve video içerik desteği
- [ ] İleri düzey filtreleme ve arama özellikleri
- [ ] Mobil uygulama desteği

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [OpenAI](https://openai.com) ve [Google](https://ai.google.dev/) - AI API'leri için
- [Material-UI](https://mui.com) - UI bileşenleri için
- [Next.js](https://nextjs.org) - Frontend framework için
- [Express](https://expressjs.com) - Backend framework için 