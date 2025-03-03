import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Axios istemcisi oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Hata işleme yardımcı fonksiyonu
const handleApiError = (error, customMessage) => {
  // Axios hata yanıtını kontrol et
  if (error.response) {
    // Sunucu yanıtı aldık ama hata kodu döndü
    const serverError = error.response.data;
    console.error('API Hatası:', serverError);
    
    // Sunucudan gelen hata mesajını kullan veya varsayılan mesajı göster
    throw new Error(
      serverError.message || 
      serverError.error || 
      customMessage || 
      'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    );
  } else if (error.request) {
    // İstek yapıldı ama yanıt alınamadı
    console.error('Sunucu yanıt vermiyor:', error.request);
    throw new Error('Sunucu yanıt vermiyor. Lütfen internet bağlantınızı kontrol edin ve daha sonra tekrar deneyin.');
  } else {
    // İstek yapılırken bir şeyler yanlış gitti
    console.error('İstek hatası:', error.message);
    throw new Error(customMessage || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
  }
};

/**
 * Tüm kategorileri getir
 * @returns {Promise<Array>} - Kategoriler listesi
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Kategoriler alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
};

/**
 * Yıl listesini getir
 * @returns {Promise<Array>} - Yıllar listesi
 */
export const getYears = async () => {
  try {
    const response = await apiClient.get('/years');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Yıllar alınamadı. Lütfen daha sonra tekrar deneyin.');
  }
};

/**
 * Yıl ve kategori bazlı özet getir
 * @param {number} year - Yıl
 * @param {string} category - Kategori
 * @returns {Promise<Object>} - Özet bilgisi
 */
export const getYearlySummary = async (year, category) => {
  try {
    const response = await apiClient.get(`/summary/${year}/${encodeURIComponent(category)}`);
    
    // Başarı durumunu kontrol et
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Özet alınamadı');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error, `${year} yılı ${category} özeti alınamadı. Lütfen daha sonra tekrar deneyin.`);
  }
};

/**
 * Belirli bir yıl ve kategoriye ait olayları getir
 * @param {number} year - Yıl
 * @param {string} category - Kategori
 * @returns {Promise<Array>} - Olaylar listesi
 */
export const getEvents = async (year, category) => {
  try {
    if (!year || !category) {
      console.error('getEvents: Eksik parametreler', { year, category });
      throw new Error('Yıl ve kategori parametreleri gereklidir');
    }
    
    console.log(`Olaylar isteniyor: Yıl=${year}, Kategori=${category}`);
    const encodedCategory = encodeURIComponent(category);
    const url = `/events/${year}/${encodedCategory}`;
    console.log(`API isteği URL: ${url}`);
    
    const response = await apiClient.get(url);
    console.log(`API yanıtı - ${year} yılı ${category} olayları:`, response.data);
    
    // Yanıt bir dizi değilse (örn. hata nesnesi döndüyse) kontrol et
    if (!Array.isArray(response.data)) {
      console.error('API yanıtı beklenen formatta değil:', response.data);
      if (response.data.success === false) {
        throw new Error(response.data.message || `${year} yılı ${category} olayları alınamadı`);
      }
      // Yanıt bir dizi değilse ve hata mesajı yoksa boş dizi döndür
      console.warn('API dizi dönmedi, boş dizi olarak işleniyor');
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Olayları getirme hatası (${year}/${category}):`, error);
    return handleApiError(error, `${year} yılı ${category} olayları alınamadı. Lütfen daha sonra tekrar deneyin.`);
  }
};

/**
 * Belirli bir olay hakkında detaylı bilgi getir
 * @param {string} date - Olay tarihi (YYYY-MM-DD formatında)
 * @param {string} title - Olay başlığı
 * @returns {Promise<Object>} - Olay detayı
 */
export const getEventDetail = async (date, title) => {
  try {
    const response = await apiClient.get(`/event/${date}/${encodeURIComponent(title)}`);
    
    // Başarı durumunu kontrol et
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Olay detayı alınamadı');
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(error, `"${title}" olayının detayları alınamadı. Lütfen daha sonra tekrar deneyin.`);
  }
};

/**
 * Yeni bir olay ekle
 * @param {Object} eventData - Olay verileri
 * @returns {Promise<Object>} - Eklenen olay
 */
export const addEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Olay eklenemedi. Lütfen tüm alanları doğru doldurduğunuzdan emin olun ve tekrar deneyin.');
  }
}; 