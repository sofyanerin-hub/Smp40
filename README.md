# Aplikasi Wali Kelas SMP (dengan database Vercel / Neon Postgres)

UPT SMP Negeri 40 Kota Makassar.

## Struktur
- `*.html`, `assets/` : tampilan (statis)
- `api/` : fungsi server Vercel (login, kelas, siswa, absensi, pengaturan)
- Database : Neon Postgres lewat Vercel Marketplace. Tabel dibuat otomatis saat login pertama.

## Langkah deploy
1. Buat repo GitHub (disarankan **private**), lalu:
   ```
   git init && git add . && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/USERNAME/wali-kelas.git
   git push -u origin main
   ```
2. Di vercel.com: Add New > Project > import repo. Framework Preset: **Other**. Deploy.
3. Di project Vercel buka tab **Storage** > **Create Database** > pilih **Neon** (Postgres) > hubungkan ke project ini. Variabel `DATABASE_URL` terisi otomatis.
4. Di **Settings > Environment Variables** tambahkan:
   - `APP_PASSWORD` : password untuk masuk aplikasi
   - `SESSION_SECRET` : teks acak panjang (contoh hasil `openssl rand -hex 32`)
5. **Redeploy** (Deployments > titik tiga > Redeploy).
6. Buka situs, masuk dengan `APP_PASSWORD`. Tabel dan kelas 8B dibuat otomatis.

## Yang sudah tersambung database
Login, pilih/tambah kelas, daftar siswa, data lengkap siswa (tambah/ubah), absensi harian, beranda (rekap hari ini), pengaturan (nama wali, foto, logo, edit kelas).

## Belum tersambung (masih contoh)
Halaman `siswa.html` (catatan perilaku) dan `jadwal.html` (jadwal mengajar).

## Catatan keamanan
- Data siswa bersifat pribadi: pakai repo private dan password kuat.
- Foto dan logo disimpan sebagai gambar kecil (maks 256 px) di database.
