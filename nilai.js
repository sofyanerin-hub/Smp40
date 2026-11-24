const { sql, guard } = require('./_lib');
const MAPEL = ['PAI', 'PAK', 'PKN', 'BIN', 'BING', 'MAT', 'IPA', 'IPS', 'TIK', 'PJOK', 'SBKP', 'BHD'];
const cnt = v => (v === '' || v == null) ? null : Math.max(0, parseInt(v, 10) || 0);
module.exports = guard(async (req, res) => {
  await sql`CREATE TABLE IF NOT EXISTS nilai(siswa_id int REFERENCES siswa(id) ON DELETE CASCADE, semester text, skor jsonb DEFAULT '{}'::jsonb, sakit int, izin int, alpa int, PRIMARY KEY(siswa_id, semester))`;
  if (req.method === 'GET') {
    const { kelas, semester } = req.query;
    return res.json(await sql`SELECT s.id, s.nama, s.nis, s.data->>'nisn' AS nisn, n.skor, n.sakit, n.izin, n.alpa FROM siswa s LEFT JOIN nilai n ON n.siswa_id=s.id AND n.semester=${semester} WHERE s.kelas_id=${kelas} ORDER BY s.nama`);
  }
  if (req.method === 'POST') {
    const b = req.body || {}, skor = {};
    for (const m of MAPEL) {
      const v = b.skor && b.skor[m];
      if (v !== '' && v != null && !isNaN(v)) skor[m] = Math.max(0, Math.min(100, Math.round(Number(v))));
    }
    await sql`INSERT INTO nilai(siswa_id,semester,skor,sakit,izin,alpa) VALUES(${b.siswa_id},${b.semester},${JSON.stringify(skor)}::jsonb,${cnt(b.sakit)},${cnt(b.izin)},${cnt(b.alpa)}) ON CONFLICT (siswa_id,semester) DO UPDATE SET skor=EXCLUDED.skor, sakit=EXCLUDED.sakit, izin=EXCLUDED.izin, alpa=EXCLUDED.alpa`;
    return res.json({ ok: true, skor });
  }
  res.status(405).end();
});
