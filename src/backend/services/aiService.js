require('dotenv').config();
const { OpenAI } = require('openai');
const axios = require('axios');

// OpenAI API istemcisi
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini API için alternatif istemci
const useGeminiAPI = !process.env.OPENAI_API_KEY && process.env.GEMINI_API_KEY;
const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * OpenAI API'sini kullanarak metin oluşturur
 * @param {string} prompt - AI'ya gönderilecek istek metni
 * @returns {Promise<string>} - AI'nın yanıtı
 */
const generateWithOpenAI = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Sen Türkiye tarihi konusunda uzmanlaşmış bir tarihçisin. Türkiye\'deki olaylar hakkında doğru, tarafsız ve detaylı bilgiler sunuyorsun.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API hatası:', error);
    throw new Error('AI yanıtı alınamadı');
  }
};

/**
 * Gemini API'sini kullanarak metin oluşturur
 * @param {string} prompt - AI'ya gönderilecek istek metni
 * @returns {Promise<string>} - AI'nın yanıtı
 */
const generateWithGemini = async (prompt) => {
  try {
    console.log('Gemini API isteği gönderiliyor...');
    
    const response = await axios.post(
      `${geminiApiUrl}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Sen Türkiye tarihi konusunda uzmanlaşmış bir tarihçisin. Türkiye'deki olaylar hakkında doğru, tarafsız ve detaylı bilgiler sunuyorsun. İstek: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topK: 40,
          topP: 0.95
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0] || 
        !response.data.candidates[0].content || !response.data.candidates[0].content.parts || 
        !response.data.candidates[0].content.parts[0]) {
      console.error('Gemini API yanıtı beklenen formatta değil:', JSON.stringify(response.data));
      throw new Error('Gemini API yanıtı beklenen formatta değil');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API hatası:', error.response ? error.response.data : error.message);
    throw new Error('AI yanıtı alınamadı');
  }
};

/**
 * Yıl ve kategori bazlı özet oluşturur
 * @param {number} year - Yıl
 * @param {string} category - Kategori
 * @returns {Promise<string>} - AI özeti
 */
const generateYearlySummary = async (year, category) => {
  const prompt = `${year} yılında Türkiye'de ${category} alanında yaşanan önemli olayları kronolojik sırayla ve detaylı olarak anlat. 
  Her olay için tarih, yer ve önemli kişileri belirt. Olayların etkilerini ve sonuçlarını da açıkla.`;
  
  return useGeminiAPI ? generateWithGemini(prompt) : generateWithOpenAI(prompt);
};

/**
 * Belirli bir olay hakkında detaylı bilgi oluşturur
 * @param {string} eventDate - Olay tarihi (YYYY-MM-DD formatında)
 * @param {string} eventTitle - Olay başlığı
 * @returns {Promise<string>} - AI özeti
 */
const generateEventDetail = async (eventDate, eventTitle) => {
  const date = new Date(eventDate);
  const formattedDate = `${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'long' })} ${date.getFullYear()}`;
  
  const prompt = `${formattedDate} tarihinde gerçekleşen "${eventTitle}" olayını detaylı olarak anlat. 
  Olayın nedenleri, gelişimi, sonuçları ve Türkiye tarihindeki önemi hakkında bilgi ver. 
  Olaya dahil olan önemli kişileri ve olayın toplumsal, siyasi ve ekonomik etkilerini açıkla.`;
  
  return useGeminiAPI ? generateWithGemini(prompt) : generateWithOpenAI(prompt);
};

/**
 * Belirli bir yıl ve kategoriye ait olayları AI ile oluşturur
 * @param {number} year - Yıl
 * @param {string} category - Kategori
 * @returns {Promise<Array>} - Oluşturulan olaylar listesi
 */
const generateEvents = async (year, category) => {
  console.log(`AI ile ${year} yılı ${category} olayları oluşturuluyor...`);
  
  const prompt = `${year} yılında Türkiye'de ${category} alanında gerçekleşen tüm önemli olayları tarih (gün ve ay dahil) ve başlıklarıyla listele.
  Önemli, orta önemli ve daha az önemli olayları da dahil et. Mümkün olduğunca fazla olay ekle.
  
  Yanıt format: JSON formatında bir dizi olarak dönüş yap, her olay için event_date (YYYY-MM-DD formatında), event_title (başlık) ve importance (1-5 arası önemlilik derecesi) bilgilerini içersin.
  Örnek format:
  [
    {
      "event_date": "1983-05-13",
      "event_title": "Örnek Ekonomik Olay",
      "importance": 4
    }
  ]
  
  Önemli kurallar:
  1. Sadece gerçek tarihi olaylar ekle, spekülasyon yapma.
  2. Her olayın önemi için 1-5 arası bir değer belirle (5: çok önemli, 1: daha az önemli).
  3. Olayları önce önem derecesine göre (5'ten 1'e), sonra tarihe göre sırala.
  4. Olayların başlıklarını kısa ve öz tut, maksimum 100 karakter olsun.
  5. Olayların tarihlerini kesin biliyorsan o tarihi kullan, eğer gün kesin değilse ayın 15'ini kullan, ay da kesin değilse 06 (Haziran) kullan.
  6. Mümkün olduğunca fazla olay ekle, sayı sınırlaması yok.`;
  
  try {
    const response = useGeminiAPI ? 
      await generateWithGemini(prompt) : 
      await generateWithOpenAI(prompt);
    
    // JSON yanıtını parse et
    let events = [];
    
    try {
      // Bazen AI yanıtı JSON dışında ekstra açıklamalar içerebilir
      // JSON bölümünü bulmaya çalış
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
      } else {
        // Eğer doğrudan JSON formatında değilse, tüm metni parse etmeyi dene
        events = JSON.parse(response);
      }
      
      console.log(`AI ${events.length} adet olay oluşturdu`);
      
      // Olayları doğrula ve format düzeltmeleri yap
      events = events.map(event => {
        // Tarih formatını kontrol et
        let eventDate = event.event_date;
        if (!eventDate || !eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Eğer tarih uygun formatta değilse, yılın ortasında bir tarih ata
          eventDate = `${year}-06-15`;
        }
        
        // Önem derecesini kontrol et
        let importance = parseInt(event.importance);
        if (isNaN(importance) || importance < 1 || importance > 5) {
          importance = 3; // Varsayılan orta önem
        }
        
        return {
          event_date: eventDate,
          event_title: event.event_title,
          importance
        };
      });
      
      // Olayları önce önem derecesine göre (5'ten 1'e), sonra tarihe göre sırala
      events.sort((a, b) => {
        if (b.importance !== a.importance) {
          return b.importance - a.importance;
        }
        return new Date(a.event_date) - new Date(b.event_date);
      });
      
      return events;
    } catch (parseError) {
      console.error('AI yanıtı JSON formatında değil:', parseError);
      console.log('AI Yanıtı:', response);
      
      // Varsayılan bir olay oluştur
      return [{
        event_date: `${year}-07-01`,
        event_title: `${year} Yılı ${category} Olayı`,
        importance: 3
      }];
    }
  } catch (error) {
    console.error('Olaylar oluşturulurken hata:', error);
    throw new Error('AI ile olaylar oluşturulamadı');
  }
};

module.exports = {
  generateYearlySummary,
  generateEventDetail,
  generateEvents
}; 