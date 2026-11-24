const { sql, guard } = require('./_lib');
module.exports = guard(async (req, res) => {
  await sql`CREATE TABLE IF NOT EXISTS kelas(id serial PRIMARY KEY, nama text UNIQUE NOT NULL, tahun_ajaran text DEFAULT '2026/2027', peran text DEFAULT 'Wali kelas')`;
  await sql`CREATE TABLE IF NOT EXISTS siswa(id serial PRIMARY KEY, kelas_id int REFERENCES kelas(id) ON DELETE CASCADE, nama text NOT NULL, nis text, jk text, data jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now())`;
  await sql`CREATE TABLE IF NOT EXISTS absensi(siswa_id int REFERENCES siswa(id) ON DELETE CASCADE, tanggal date, status text, PRIMARY KEY(siswa_id, tanggal))`;
  await sql`CREATE TABLE IF NOT EXISTS pengaturan(k text PRIMARY KEY, v text)`;
  await sql`INSERT INTO pengaturan(k,v) VALUES('nama_wali','Ibu Jerniati, S.Pd'),('sekolah','UPT SMP Negeri 40 Kota Makassar') ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO kelas(nama) VALUES('8B') ON CONFLICT DO NOTHING`;
  res.json({ ok: true });
});
