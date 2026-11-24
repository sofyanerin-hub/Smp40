const { sql, guard } = require('./_lib');
module.exports = guard(async (req, res) => {
  const b = req.body || {};
  if (req.method === 'GET')
    return res.json(await sql`SELECT k.*, (SELECT count(*)::int FROM siswa s WHERE s.kelas_id=k.id) AS jumlah FROM kelas k ORDER BY nama`);
  if (req.method === 'POST') {
    const r = await sql`INSERT INTO kelas(nama,tahun_ajaran,peran) VALUES(${b.nama},${b.tahun_ajaran || '2026/2027'},${b.peran || 'Wali kelas'}) RETURNING *`;
    return res.json(r[0]);
  }
  if (req.method === 'PUT') {
    const r = await sql`UPDATE kelas SET nama=${b.nama}, tahun_ajaran=${b.tahun_ajaran}, peran=${b.peran} WHERE id=${b.id} RETURNING *`;
    return res.json(r[0]);
  }
  if (req.method === 'DELETE') { await sql`DELETE FROM kelas WHERE id=${req.query.id}`; return res.json({ ok: true }); }
  res.status(405).end();
});
