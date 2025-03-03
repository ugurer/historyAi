require('dotenv').config();
const { Pool } = require('pg');

// Veritabanı bağlantı bilgileri
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Tabloları oluşturan SQL sorguları
const createTablesQuery = `
-- Yıl ve kategori bazlı AI özetleri için tablo
CREATE TABLE IF NOT EXISTS yearly_summaries (
    id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    category TEXT NOT NULL,
    ai_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, category)
);

-- Belirli olaylar için detaylı AI açıklamaları için tablo
CREATE TABLE IF NOT EXISTS event_details (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_title TEXT NOT NULL,
    ai_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_date, event_title)
);

-- Kategorileri saklamak için tablo
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Önceden tanımlanmış olayları saklamak için tablo
CREATE TABLE IF NOT EXISTS predefined_events (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_title TEXT NOT NULL,
    category_id INT REFERENCES categories(id),
    importance INT DEFAULT 1, -- 1-5 arası önem derecesi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_date, event_title)
);
`;

// Örnek kategorileri ekleyen SQL sorgusu
const insertCategoriesQuery = `
INSERT INTO categories (name, description)
VALUES 
    ('Siyasi', 'Siyasi olaylar, seçimler, hükümet değişiklikleri'),
    ('Ekonomik', 'Ekonomik krizler, büyük ekonomik kararlar'),
    ('Sosyal', 'Toplumsal olaylar, sosyal değişimler'),
    ('Doğal Afet', 'Depremler, seller, doğal felaketler'),
    ('Spor', 'Önemli spor olayları, başarılar'),
    ('Kültür-Sanat', 'Kültürel ve sanatsal gelişmeler'),
    ('Bilim-Teknoloji', 'Bilimsel ve teknolojik gelişmeler'),
    ('Eğitim', 'Eğitim sistemi değişiklikleri, önemli sınavlar'),
    ('Sağlık', 'Sağlık sistemi değişiklikleri, salgın hastalıklar'),
    ('Ulaşım', 'Ulaşım projeleri, köprüler, havalimanları'),
    ('Dış Politika', 'Uluslararası ilişkiler, anlaşmalar'),
    ('Savunma', 'Askeri gelişmeler, savunma sanayi'),
    ('Çevre', 'Çevre sorunları, iklim değişikliği'),
    ('Medya', 'Medya sektörü, iletişim teknolojileri'),
    ('Enerji', 'Enerji projeleri, santraller')
ON CONFLICT (name) DO NOTHING;
`;

// Önceden tanımlanmış bazı önemli olayları ekleyen SQL sorgusu
const insertPredefinedEventsQuery = `
INSERT INTO predefined_events (event_date, event_title, category_id, importance)
VALUES 
    -- Siyasi Olaylar
    ('1923-10-29', 'Cumhuriyetin Ilani', (SELECT id FROM categories WHERE name = 'Siyasi'), 5),
    ('1950-05-14', 'Turkiyede Ilk Cok Partili Secimler', (SELECT id FROM categories WHERE name = 'Siyasi'), 5),
    ('1960-05-27', '27 Mayis Darbesi', (SELECT id FROM categories WHERE name = 'Siyasi'), 5),
    ('1980-09-12', '12 Eylul Darbesi', (SELECT id FROM categories WHERE name = 'Siyasi'), 5),
    ('2016-07-15', '15 Temmuz Darbe Girisimi', (SELECT id FROM categories WHERE name = 'Siyasi'), 5),
    ('2017-04-16', 'Cumhurbaskanligi Sistemi Referandumu', (SELECT id FROM categories WHERE name = 'Siyasi'), 4),
    ('2018-06-24', 'Cumhurbaskanligi Hukumet Sistemine Gecis', (SELECT id FROM categories WHERE name = 'Siyasi'), 4),
    ('2019-06-23', 'Istanbul Buyuksehir Belediye Baskanligi Secimi Tekrari', (SELECT id FROM categories WHERE name = 'Siyasi'), 4),

    -- Ekonomik Olaylar
    ('1994-04-05', '5 Nisan Kararlari', (SELECT id FROM categories WHERE name = 'Ekonomik'), 4),
    ('2001-02-19', 'Ekonomik Kriz', (SELECT id FROM categories WHERE name = 'Ekonomik'), 5),
    ('2008-09-15', 'Kuresel Ekonomik Kriz', (SELECT id FROM categories WHERE name = 'Ekonomik'), 4),
    ('2018-08-10', 'Doviz Kuru Krizi', (SELECT id FROM categories WHERE name = 'Ekonomik'), 4),
    ('2021-03-20', 'Merkez Bankasi Baskani Degisikligi', (SELECT id FROM categories WHERE name = 'Ekonomik'), 4),

    -- Dogal Afetler
    ('1999-08-17', 'Marmara Depremi', (SELECT id FROM categories WHERE name = 'Doğal Afet'), 5),
    ('2011-10-23', 'Van Depremi', (SELECT id FROM categories WHERE name = 'Doğal Afet'), 4),
    ('2020-01-24', 'Elazig Depremi', (SELECT id FROM categories WHERE name = 'Doğal Afet'), 4),
    ('2023-02-06', 'Kahramanmaras Depremi', (SELECT id FROM categories WHERE name = 'Doğal Afet'), 5),
    ('2021-07-28', 'Antalya ve Mugla Orman Yanginlari', (SELECT id FROM categories WHERE name = 'Doğal Afet'), 4),

    -- Spor Olaylari
    ('2000-05-17', 'Galatasaray UEFA Kupasi Sampiyonlugu', (SELECT id FROM categories WHERE name = 'Spor'), 5),
    ('2002-06-29', 'Dunya Kupasi Ucunculugu', (SELECT id FROM categories WHERE name = 'Spor'), 5),
    ('2010-09-12', 'FIBA Dunya Basketbol Sampiyonasi Ikinciligi', (SELECT id FROM categories WHERE name = 'Spor'), 4),
    ('2020-08-19', 'Basaksehir UEFA Avrupa Ligi Ceyrek Finali', (SELECT id FROM categories WHERE name = 'Spor'), 3),

    -- Kultur-Sanat
    ('2004-05-15', 'Eurovision Sarki Yarismasi Birinciligi', (SELECT id FROM categories WHERE name = 'Kültür-Sanat'), 4),
    ('2014-05-29', 'Nuri Bilge Ceylan Cannes Film Festivali Altin Palmiye Odulu', (SELECT id FROM categories WHERE name = 'Kültür-Sanat'), 4),
    ('2020-09-10', 'Istanbul Modern Yeni Binasi Acilisi', (SELECT id FROM categories WHERE name = 'Kültür-Sanat'), 3),

    -- Bilim-Teknoloji
    ('2012-12-18', 'GOKTURK-2 Uydusunun Firlatilmasi', (SELECT id FROM categories WHERE name = 'Bilim-Teknoloji'), 4),
    ('2020-01-24', 'Ilk Yerli Elektrikli Otomobil TOGG Tanitimi', (SELECT id FROM categories WHERE name = 'Bilim-Teknoloji'), 4),
    ('2022-12-10', 'TOGG Fabrikasi Acilisi', (SELECT id FROM categories WHERE name = 'Bilim-Teknoloji'), 4),

    -- Egitim
    ('2005-05-01', 'YOK Sisteminde Koklu Degisiklik', (SELECT id FROM categories WHERE name = 'Eğitim'), 4),
    ('2012-03-30', '4+4+4 Egitim Sistemi', (SELECT id FROM categories WHERE name = 'Eğitim'), 4),
    ('2017-09-01', 'Mufredat Degisikligi', (SELECT id FROM categories WHERE name = 'Eğitim'), 3),
    ('2020-03-23', 'COVID-19 Uzaktan Egitim Sureci', (SELECT id FROM categories WHERE name = 'Eğitim'), 4),

    -- Saglik
    ('2003-01-01', 'Saglikta Donusum Programi', (SELECT id FROM categories WHERE name = 'Sağlık'), 4),
    ('2020-03-11', 'Turkiyede Ilk COVID-19 Vakasi', (SELECT id FROM categories WHERE name = 'Sağlık'), 5),
    ('2020-12-14', 'COVID-19 Asi Programi Baslangici', (SELECT id FROM categories WHERE name = 'Sağlık'), 4),

    -- Ulasim
    ('2013-10-29', 'Marmaray Acilisi', (SELECT id FROM categories WHERE name = 'Ulaşım'), 4),
    ('2016-08-26', 'Yavuz Sultan Selim Koprusu Acilisi', (SELECT id FROM categories WHERE name = 'Ulaşım'), 4),
    ('2018-10-29', 'Istanbul Havalimani Acilisi', (SELECT id FROM categories WHERE name = 'Ulaşım'), 4),
    ('2022-12-25', 'Istanbul Metrosu Yeni Hatlar', (SELECT id FROM categories WHERE name = 'Ulaşım'), 3),

    -- Dis Politika
    ('2005-10-03', 'AB Muzakerelerinin Baslamasi', (SELECT id FROM categories WHERE name = 'Dış Politika'), 4),
    ('2016-06-28', 'Turkiye-Israil Iliskilerinin Normallesme Sureci', (SELECT id FROM categories WHERE name = 'Dış Politika'), 3),
    ('2020-08-21', 'Karadenizde Dogalgaz Kesfi', (SELECT id FROM categories WHERE name = 'Dış Politika'), 4),

    -- Savunma
    ('2019-07-12', 'S-400 Hava Savunma Sistemi Teslimati', (SELECT id FROM categories WHERE name = 'Savunma'), 4),
    ('2021-12-18', 'AKINCI TIHA Envantere Girisi', (SELECT id FROM categories WHERE name = 'Savunma'), 4),
    ('2022-08-15', 'TCG Anadolu Gemisi Teslimi', (SELECT id FROM categories WHERE name = 'Savunma'), 4),

    -- Cevre
    ('2015-06-05', 'Iklim Degisikligi Eylem Plani', (SELECT id FROM categories WHERE name = 'Çevre'), 3),
    ('2019-06-23', 'Sifir Atik Projesi Baslangici', (SELECT id FROM categories WHERE name = 'Çevre'), 3),
    ('2021-07-01', 'Plastik Poset Kullaniminin Ucretlendirilmesi', (SELECT id FROM categories WHERE name = 'Çevre'), 3),

    -- Medya
    ('2002-10-01', 'RTUK Yasasi Degisikligi', (SELECT id FROM categories WHERE name = 'Medya'), 3),
    ('2008-01-01', 'TRT HD Yayin Baslangici', (SELECT id FROM categories WHERE name = 'Medya'), 3),
    ('2020-07-29', 'Sosyal Medya Yasasi', (SELECT id FROM categories WHERE name = 'Medya'), 4),

    -- Enerji
    ('2018-06-19', 'TANAP Dogalgaz Boru Hatti Acilisi', (SELECT id FROM categories WHERE name = 'Enerji'), 4),
    ('2021-06-04', 'Karadeniz Dogalgaz Rezervi Kesfi', (SELECT id FROM categories WHERE name = 'Enerji'), 4),
    ('2023-01-20', 'Akkuyu Nukleer Santrali Ilk Yakit Yukleme', (SELECT id FROM categories WHERE name = 'Enerji'), 4)
ON CONFLICT (event_date, event_title) DO NOTHING;
`;

// Veritabanı kurulumunu gerçekleştiren ana fonksiyon
async function setupDatabase() {
  try {
    console.log('Veritabanı kurulumu başlatılıyor...');
    
    // Tabloları oluştur
    await pool.query(createTablesQuery);
    console.log('Tablolar başarıyla oluşturuldu.');
    
    // Kategorileri ekle
    await pool.query(insertCategoriesQuery);
    console.log('Kategoriler başarıyla eklendi.');
    
    // Önceden tanımlanmış olayları ekle
    await pool.query(insertPredefinedEventsQuery);
    console.log('Önceden tanımlanmış olaylar başarıyla eklendi.');
    
    console.log('Veritabanı kurulumu başarıyla tamamlandı!');
    
    // Bağlantıyı kapat
    await pool.end();
  } catch (error) {
    console.error('Veritabanı kurulumu sırasında bir hata oluştu:', error);
    process.exit(1);
  }
}

// Kurulumu başlat
setupDatabase(); 