const crypto = require('crypto');
const { token } = require('./_lib');
const h = s => crypto.createHash('sha256').update(String(s)).digest();
module.exports = async (req, res) => {
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', 'sess=; Path=/; Max-Age=0'); return res.json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).end();
  const real = process.env.APP_PASSWORD || '';
  const pw = (req.body || {}).password || '';
  if (!real || !process.env.SESSION_SECRET || !crypto.timingSafeEqual(h(pw), h(real)))
    return res.status(401).json({ error: 'Password salah' });
  res.setHeader('Set-Cookie', `sess=${token()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`);
  res.json({ ok: true });
};
