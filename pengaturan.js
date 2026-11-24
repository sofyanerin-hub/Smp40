const { sql, guard } = require('./_lib');
const KEYS = ['nama_wali', 'sekolah', 'foto', 'logo'];
module.exports = guard(async (req, res) => {
  if (req.method === 'GET') {
    const rows = await sql`SELECT k, v FROM pengaturan`;
    return res.json(Object.fromEntries(rows.map(r => [r.k, r.v])));
  }
  if (req.method === 'POST') {
    const b = req.body || {};
    for (const k of KEYS)
      if (typeof b[k] === 'string')
        await sql`INSERT INTO pengaturan(k,v) VALUES(${k},${b[k]}) ON CONFLICT (k) DO UPDATE SET v=EXCLUDED.v`;
    return res.json({ ok: true });
  }
  res.status(405).end();
});
