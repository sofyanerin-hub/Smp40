const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = (s, ...v) => neon(url())(s, ...v);
const token = () => crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update('wali-kelas').digest('hex');
const cookie = (req, n) => {
  const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(n + '='));
  return m ? m.slice(n.length + 1) : '';
};
const authed = req => {
  if (!process.env.SESSION_SECRET) return false;
  const a = Buffer.from(cookie(req, 'sess')), b = Buffer.from(token());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const guard = h => async (req, res) => {
  try {
    if (!authed(req)) return res.status(401).json({ error: 'unauthorized' });
    await h(req, res);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Terjadi kesalahan server', detail: String(e && e.message || e).slice(0, 160) }); }
};
module.exports = { sql, token, guard };
