const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { 
  cacheData, 
  getCachedData, 
  createYearlySummaryKey, 
  createEventDetailKey,
  createCategoriesKey,
  createYearsKey,
  CACHE_DURATIONS
} = require('../../database/redis');
const { generateYearlySummary, generateEventDetail, generateEvents } = require('../services/aiService');

/**
 * Tüm kategorileri getir
 * GET /api/categories
 */
router.get('/categories', async (req, res) => {
  try {
    // Önbellekten kontrol et
    const cacheKey = createCategoriesKey();
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Veritabanından getir
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    
    // Önbelleğe al
    await cacheData(cacheKey, result.rows, CACHE_DURATIONS.CATEGORIES);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: 'Kategoriler alınamadı. Lütfen daha sonra tekrar deneyin.',
      success: false 
    });
  }
});

/**
 * Yıl listesini getir (1923'ten günümüze)
 * GET /api/years
 */
router.get('/years', async (req, res) => {
  try {
    // Önbellekten kontrol et
    const cacheKey = createYearsKey();
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Yıl listesini oluştur
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear; year >= 1923; year--) {
      years.push(year);
    }
    
    // Önbelleğe al
    await cacheData(cacheKey, years, CACHE_DURATIONS.YEARS);
    
    res.json(years);
  } catch (error) {
    console.error('Yıl listesi oluşturma hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: 'Yıl listesi oluşturulamadı. Lütfen daha sonra tekrar deneyin.',
      success: false 
    });
  }
});

/**
 * Yıl ve kategori bazlı özet getir
 * GET /api/summary/:year/:category
 */
router.get('/summary/:year/:category', async (req, res) => {
  try {
    const { year, category } = req.params;
    
    // Parametre doğrulama
    if (!year || !category) {
      return res.status(400).json({ 
        error: 'Geçersiz parametreler', 
        message: 'Yıl ve kategori parametreleri gereklidir',
        success: false 
      });
    }

    // Yıl formatını doğrula
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1923 || yearNum > new Date().getFullYear()) {
      return res.status(400).json({ 
        error: 'Geçersiz yıl', 
        message: 'Yıl 1923 ile günümüz arasında olmalıdır',
        success: false 
      });
    }
    
    // Önbellekten kontrol et
    const cacheKey = createYearlySummaryKey(year, category);
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json({ summary: cachedData, source: 'cache', success: true });
    }
    
    // Veritabanından kontrol et
    const dbResult = await db.query(
      'SELECT ai_summary FROM yearly_summaries WHERE year = $1 AND category = $2',
      [year, category]
    );
    
    if (dbResult.rows.length > 0) {
      // Önbelleğe al ve yanıt ver
      await cacheData(cacheKey, dbResult.rows[0].ai_summary, CACHE_DURATIONS.YEARLY_SUMMARY);
      return res.json({ summary: dbResult.rows[0].ai_summary, source: 'database', success: true });
    }
    
    // AI ile özet oluştur
    try {
      const aiSummary = await generateYearlySummary(year, category);
      
      // Veritabanına kaydet
      await db.query(
        'INSERT INTO yearly_summaries (year, category, ai_summary) VALUES ($1, $2, $3) ON CONFLICT (year, category) DO UPDATE SET ai_summary = $3, updated_at = CURRENT_TIMESTAMP',
        [year, category, aiSummary]
      );
      
      // Önbelleğe al
      await cacheData(cacheKey, aiSummary, CACHE_DURATIONS.YEARLY_SUMMARY);
      
      res.json({ summary: aiSummary, source: 'ai', success: true });
    } catch (aiError) {
      console.error('AI özet oluşturma hatası:', aiError);
      res.status(503).json({ 
        error: 'AI servisi hatası', 
        message: 'Özet oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        success: false 
      });
    }
  } catch (error) {
    console.error('Özet getirme hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: 'Özet alınamadı. Lütfen daha sonra tekrar deneyin.',
      success: false 
    });
  }
});

/**
 * Belirli bir yıl ve kategoriye ait olayları getir
 * GET /api/events/:year/:category
 */
router.get('/events/:year/:category', async (req, res) => {
  try {
    const { year, category } = req.params;
    
    console.log(`API sorgusu: Yıl=${year}, Kategori=${category} için olaylar isteniyor`);
    
    // SQL sorgusunu oluştur ve göster
    const sqlQuery = `
      SELECT pe.id, pe.event_date, pe.event_title, pe.importance
      FROM predefined_events pe
      JOIN categories c ON pe.category_id = c.id
      WHERE EXTRACT(YEAR FROM pe.event_date) = $1 AND c.name = $2
      ORDER BY pe.event_date
    `;
    console.log(`SQL Sorgusu: ${sqlQuery} Parametreler: [${year}, ${category}]`);
    
    // Kategorinin varlığını kontrol et
    const categoryCheck = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
    console.log(`Kategori kontrolü: ${JSON.stringify(categoryCheck.rows)}`);
    
    if (categoryCheck.rows.length === 0) {
      console.log(`HATA: "${category}" kategorisi bulunamadı`);
      return res.status(404).json({ 
        error: 'Kategori bulunamadı',
        message: `"${category}" adında bir kategori bulunamadı`,
        success: false 
      });
    }
    
    const categoryId = categoryCheck.rows[0].id;
    const result = await db.query(sqlQuery, [year, category]);
    
    console.log(`Veritabanı sorgusu sonucu: ${result.rows.length} adet olay bulundu`);
    
    // Eğer olay bulunamadıysa AI ile otomatik olarak olaylar oluştur
    if (result.rows.length === 0) {
      console.log(`NOT: ${year} yılında "${category}" kategorisinde hiç olay bulunamadı`);
      console.log('AI ile olaylar oluşturulacak...');
      
      try {
        // AI ile olaylar oluştur
        const generatedEvents = await generateEvents(year, category);
        
        if (generatedEvents && generatedEvents.length > 0) {
          console.log(`AI tarafından ${generatedEvents.length} adet olay oluşturuldu`);
          
          // Oluşturulan olayları veritabanına kaydet
          const savedEvents = [];
          
          for (const event of generatedEvents) {
            try {
              const insertResult = await db.query(
                'INSERT INTO predefined_events (event_date, event_title, category_id, importance) VALUES ($1, $2, $3, $4) RETURNING id, event_date, event_title, importance',
                [event.event_date, event.event_title, categoryId, event.importance]
              );
              
              if (insertResult.rows.length > 0) {
                savedEvents.push(insertResult.rows[0]);
                console.log(`Olay kaydedildi: ${event.event_title}`);
              }
            } catch (insertError) {
              console.error(`Olay kaydedilirken hata: ${event.event_title}`, insertError);
              // Kaydedilemezse bir sonraki olaya geç
            }
          }
          
          console.log(`${savedEvents.length} adet olay veritabanına kaydedildi`);
          
          // Kaydedilen olayları döndür
          return res.json(savedEvents);
        } else {
          console.log('AI olay oluşturamadı, boş dizi döndürülüyor');
          return res.json([]);
        }
      } catch (aiError) {
        console.error('AI ile olay oluşturma hatası:', aiError);
        console.log('Hata nedeniyle boş dizi döndürülüyor');
        return res.json([]);
      }
    } else {
      if (result.rows.length > 0) {
        console.log(`İlk birkaç olay: ${JSON.stringify(result.rows.slice(0, 2))}`);
      }
      
      // Veritabanından bulunan olayları döndür
      return res.json(result.rows);
    }
  } catch (error) {
    console.error('Olay getirme hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: 'Olaylar alınamadı. Lütfen daha sonra tekrar deneyin.',
      success: false 
    });
  }
});

/**
 * Belirli bir olay hakkında detaylı bilgi getir
 * GET /api/event/:date/:title
 */
router.get('/event/:date/:title', async (req, res) => {
  try {
    const { date, title } = req.params;
    
    // Parametre doğrulama
    if (!date || !title) {
      return res.status(400).json({ 
        error: 'Geçersiz parametreler', 
        message: 'Tarih ve başlık parametreleri gereklidir',
        success: false 
      });
    }
    
    // Tarih formatını doğrula
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'Geçersiz tarih formatı', 
        message: 'Tarih YYYY-MM-DD formatında olmalıdır',
        success: false 
      });
    }
    
    const decodedTitle = decodeURIComponent(title);
    
    // Önbellekten kontrol et
    const cacheKey = createEventDetailKey(date, decodedTitle);
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json({ detail: cachedData, source: 'cache', success: true });
    }
    
    // Veritabanından kontrol et
    const dbResult = await db.query(
      'SELECT ai_summary FROM event_details WHERE event_date = $1 AND event_title = $2',
      [date, decodedTitle]
    );
    
    if (dbResult.rows.length > 0) {
      // Önbelleğe al ve yanıt ver
      await cacheData(cacheKey, dbResult.rows[0].ai_summary, CACHE_DURATIONS.EVENT_DETAIL);
      return res.json({ detail: dbResult.rows[0].ai_summary, source: 'database', success: true });
    }
    
    // AI ile detay oluştur
    try {
      const aiDetail = await generateEventDetail(date, decodedTitle);
      
      // Veritabanına kaydet
      await db.query(
        'INSERT INTO event_details (event_date, event_title, ai_summary) VALUES ($1, $2, $3) ON CONFLICT (event_date, event_title) DO UPDATE SET ai_summary = $3, updated_at = CURRENT_TIMESTAMP',
        [date, decodedTitle, aiDetail]
      );
      
      // Önbelleğe al
      await cacheData(cacheKey, aiDetail, CACHE_DURATIONS.EVENT_DETAIL);
      
      res.json({ detail: aiDetail, source: 'ai', success: true });
    } catch (aiError) {
      console.error('AI detay oluşturma hatası:', aiError);
      res.status(503).json({ 
        error: 'AI servisi hatası', 
        message: 'Olay detayı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        success: false 
      });
    }
  } catch (error) {
    console.error('Olay detayı getirme hatası:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: 'Olay detayı alınamadı. Lütfen daha sonra tekrar deneyin.',
      success: false 
    });
  }
});

/**
 * Yeni bir olay ekle
 * POST /api/events
 */
router.post('/events', async (req, res) => {
  try {
    const { eventDate, eventTitle, categoryId, importance } = req.body;
    
    if (!eventDate || !eventTitle || !categoryId) {
      return res.status(400).json({ error: 'Tarih, başlık ve kategori zorunludur' });
    }
    
    const result = await db.query(
      'INSERT INTO predefined_events (event_date, event_title, category_id, importance) VALUES ($1, $2, $3, $4) RETURNING *',
      [eventDate, eventTitle, categoryId, importance || 1]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Olay ekleme hatası:', error);
    res.status(500).json({ error: 'Olay eklenemedi' });
  }
});

module.exports = router; 