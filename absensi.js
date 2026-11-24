const { sql, guard } = require('./_lib');
module.exports = guard(async (req, res) => {
  if (req.method === 'GET') {
    const { kelas, tanggal } = req.query;
    return res.json(await sql`SELECT s.id, s.nama, a.status FROM siswa s LEFT JOIN absensi a ON a.siswa_id=s.id AND a.tanggal=${tanggal}::date WHERE s.kelas_id=${kelas} ORDER BY s.nama`);
  }
  if (req.method === 'POST') {
    const { tanggal, items = [] } = req.body || {};
    const ok = items.filter(i => ['H', 'S', 'I', 'A'].includes(i.status));
    await Promise.all(ok.map(i => sql`INSERT INTO absensi(siswa_id,tanggal,status) VALUES(${i.siswa_id},${tanggal}::date,${i.status}) ON CONFLICT (siswa_id,tanggal) DO UPDATE SET status=EXCLUDED.status`));
    return res.json({ ok: true, jumlah: ok.length });
  }
  res.status(405).end();
});
