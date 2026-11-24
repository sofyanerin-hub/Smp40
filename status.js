const { sql } = require('./_lib');
module.exports = async (req, res) => {
  const env = { DATABASE_URL: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL), APP_PASSWORD: !!process.env.APP_PASSWORD, SESSION_SECRET: !!process.env.SESSION_SECRET };
  let db = 'DATABASE_URL belum ada', tabel = '-';
  if (env.DATABASE_URL) {
    try { await sql`SELECT 1`; db = 'terhubung'; } catch (e) { db = 'gagal terhubung'; }
    if (db === 'terhubung') {
      try { await sql`SELECT 1 FROM kelas LIMIT 1`; tabel = 'ada'; } catch (e) { tabel = 'belum dibuat'; }
    }
  }
  res.json({ env, db, tabel });
};
