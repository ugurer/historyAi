# Türkiye'de Geçmiş Olayları Sorgulama Sistemi

Bu proje, kullanıcıların interaktif olarak yıl, kategori ve gün bazlı sorgular yaparak Türkiye'de yaşanan olayları görüntüleyebileceği bir sistem sunmaktadır.

## 🚀 Özellikler

- **İnteraktif Sorgulama**: Yıl, kategori ve gün bazlı sorgular
- **AI Destekli İçerik**: Olaylar hakkında detaylı AI özetleri
- **Verimli Önbellekleme**: AI API çağrılarını optimize eden önbellekleme sistemi
- **Kullanıcı Dostu Arayüz**: Kolay kullanılabilir ve sezgisel bir kullanıcı arayüzü

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- PostgreSQL
- Redis (önbellekleme için)
- OpenAI API Anahtarı veya Gemini API Anahtarı

## 🔧 Kurulum

1. Projeyi klonlayın:
   ```
   git clone https://github.com/kullanici/turkiye-tarih-sorgulama.git
   cd turkiye-tarih-sorgulama
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri ayarlayın:
   ```
   cp .env.example .env
   ```

4. Veritabanını kurun:
   ```
   npm run setup-db
   ```

5. Uygulamayı başlatın:
   ```
   npm run dev:full
   ```

## 🏗️ Proje Yapısı

```
turkiye-tarih-sorgulama/
├── src/
│   ├── backend/         # Express.js API
│   ├── frontend/        # React (Next.js) uygulaması
│   └── database/        # Veritabanı şemaları ve kurulum
├── public/              # Statik dosyalar
├── .env                 # Çevre değişkenleri
└── package.json         # Proje bağımlılıkları
```

## 📊 Veritabanı Şeması

Proje iki ana tablo kullanmaktadır:

1. **yearly_summaries**: Yıl ve kategori bazlı AI özetleri
2. **event_details**: Belirli olaylar için detaylı AI açıklamaları

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen bir pull request göndermeden önce bir issue açın.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 