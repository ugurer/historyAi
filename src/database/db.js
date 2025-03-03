require('dotenv').config();
const { Pool } = require('pg');

// Veritabanı bağlantı havuzu
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Bağlantıyı test et
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err);
  } else {
    console.log('Veritabanı bağlantısı başarılı:', res.rows[0]);
  }
});

// Veritabanı sorgularını yürütmek için yardımcı fonksiyon
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
}; 