require('dotenv').config();
const redis = require('redis');

// Redis host ve port değerlerini kontrol et, tanımlanmamışsa varsayılan değerleri kullan
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

// Önbellek süreleri (saniye cinsinden)
const CACHE_DURATIONS = {
  YEARLY_SUMMARY: 60 * 60 * 24 * 7, // 1 hafta
  EVENT_DETAIL: 60 * 60 * 24 * 30,  // 1 ay
  CATEGORIES: 60 * 60 * 24,         // 1 gün
  YEARS: 60 * 60 * 24,              // 1 gün
  DEFAULT: 60 * 60                  // 1 saat
};

// Önbellek anahtar önekleri
const CACHE_PREFIXES = {
  YEARLY_SUMMARY: 'summary',
  EVENT_DETAIL: 'event',
  CATEGORIES: 'categories',
  YEARS: 'years'
};

// Redis istemcisi oluştur
const redisClient = redis.createClient({
  url: `redis://${REDIS_PASSWORD ? `:${REDIS_PASSWORD}@` : ''}${REDIS_HOST}:${REDIS_PORT}`
});

// Bağlantı olaylarını dinle
redisClient.on('connect', () => {
  console.log('Redis bağlantısı başarılı');
});

redisClient.on('error', (err) => {
  console.error('Redis bağlantı hatası:', err);
});

// Redis bağlantısını başlat
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis bağlantısı kurulamadı:', error);
    console.log('Redis olmadan devam ediliyor...');
  }
})();

/**
 * Redis bağlantısının durumunu kontrol eder
 * @returns {boolean} - Redis bağlantısı açık mı?
 */
const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

/**
 * Veriyi önbelleğe kaydeder
 * @param {string} key - Önbellek anahtarı
 * @param {any} data - Kaydedilecek veri
 * @param {number} expireTime - Önbellek süresi (saniye)
 * @returns {Promise<boolean>} - İşlem başarılı mı?
 */
const cacheData = async (key, data, expireTime = CACHE_DURATIONS.DEFAULT) => {
  try {
    if (!isRedisConnected()) {
      console.log('Redis bağlantısı yok, önbellekleme atlanıyor');
      return false;
    }
    
    await redisClient.set(key, JSON.stringify(data), {
      EX: expireTime
    });
    console.log(`Önbelleğe kaydedildi: ${key} (${expireTime} saniye)`);
    return true;
  } catch (error) {
    console.error('Redis önbellekleme hatası:', error);
    return false;
  }
};

/**
 * Önbellekten veri alır
 * @param {string} key - Önbellek anahtarı
 * @returns {Promise<any>} - Önbellekteki veri
 */
const getCachedData = async (key) => {
  try {
    if (!isRedisConnected()) {
      console.log('Redis bağlantısı yok, önbellekten veri alınamıyor');
      return null;
    }
    
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log(`Önbellekten alındı: ${key}`);
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('Redis veri alma hatası:', error);
    return null;
  }
};

/**
 * Önbellekten veri siler
 * @param {string} key - Önbellek anahtarı
 * @returns {Promise<boolean>} - İşlem başarılı mı?
 */
const deleteCachedData = async (key) => {
  try {
    if (!isRedisConnected()) {
      console.log('Redis bağlantısı yok, önbellekten veri silinemiyor');
      return false;
    }
    
    await redisClient.del(key);
    console.log(`Önbellekten silindi: ${key}`);
    return true;
  } catch (error) {
    console.error('Redis veri silme hatası:', error);
    return false;
  }
};

/**
 * Belirli bir önek ile başlayan tüm önbellek anahtarlarını siler
 * @param {string} prefix - Önbellek anahtarı öneki
 * @returns {Promise<boolean>} - İşlem başarılı mı?
 */
const clearCacheByPrefix = async (prefix) => {
  try {
    if (!isRedisConnected()) {
      console.log('Redis bağlantısı yok, önbellek temizlenemiyor');
      return false;
    }
    
    // SCAN komutu ile belirli bir önek ile başlayan anahtarları bul
    let cursor = '0';
    let keys = [];
    
    do {
      const result = await redisClient.scan(cursor, {
        MATCH: `${prefix}*`,
        COUNT: 100
      });
      
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== '0');
    
    if (keys.length > 0) {
      // Bulunan anahtarları sil
      await redisClient.del(keys);
      console.log(`${keys.length} adet önbellek anahtarı silindi (önek: ${prefix})`);
    }
    
    return true;
  } catch (error) {
    console.error('Redis önbellek temizleme hatası:', error);
    return false;
  }
};

/**
 * Tüm önbelleği temizler
 * @returns {Promise<boolean>} - İşlem başarılı mı?
 */
const clearAllCache = async () => {
  try {
    if (!isRedisConnected()) {
      console.log('Redis bağlantısı yok, önbellek temizlenemiyor');
      return false;
    }
    
    await redisClient.flushDb();
    console.log('Tüm önbellek temizlendi');
    return true;
  } catch (error) {
    console.error('Redis tüm önbellek temizleme hatası:', error);
    return false;
  }
};

// Önbellek anahtarı oluşturma yardımcı fonksiyonları
const createYearlySummaryKey = (year, category) => 
  `${CACHE_PREFIXES.YEARLY_SUMMARY}:${year}:${category}`;

const createEventDetailKey = (date, eventTitle) => 
  `${CACHE_PREFIXES.EVENT_DETAIL}:${date}:${eventTitle}`;

const createCategoriesKey = () => 
  `${CACHE_PREFIXES.CATEGORIES}:all`;

const createYearsKey = () => 
  `${CACHE_PREFIXES.YEARS}:all`;

module.exports = {
  redisClient,
  isRedisConnected,
  cacheData,
  getCachedData,
  deleteCachedData,
  clearCacheByPrefix,
  clearAllCache,
  createYearlySummaryKey,
  createEventDetailKey,
  createCategoriesKey,
  createYearsKey,
  CACHE_DURATIONS,
  CACHE_PREFIXES
}; 