const { sql, guard } = require('./_lib');
module.exports = guard(async (req, res) => {
  const q = req.query, b = req.body || {};
  if (req.method === 'GET') {
    if (q.id) { const r = await sql`SELECT * FROM siswa WHERE id=${q.id}`; return res.json(r[0] || {}); }
    return res.json(await sql`SELECT s.id, s.nama, s.nis, s.jk, a.status FROM siswa s LEFT JOIN absensi a ON a.siswa_id=s.id AND a.tanggal=(now() at time zone 'Asia/Makassar')::date WHERE s.kelas_id=${q.kelas} ORDER BY s.nama`);
  }
  if (req.method === 'POST') {
    const data = JSON.stringify(b.data || {});
    if (b.id) {
      const r = await sql`UPDATE siswa SET nama=${b.nama}, nis=${b.nis}, jk=${b.jk}, data=${data}::jsonb WHERE id=${b.id} RETURNING *`;
      return res.json(r[0]);
    }
    const r = await sql`INSERT INTO siswa(kelas_id,nama,nis,jk,data) VALUES(${b.kelas_id},${b.nama},${b.nis},${b.jk},${data}::jsonb) RETURNING *`;
    return res.json(r[0]);
  }
  if (req.method === 'DELETE') { await sql`DELETE FROM siswa WHERE id=${q.id}`; return res.json({ ok: true }); }
  res.status(405).end();
});
