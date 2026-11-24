const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function api(p, o = {}) {
  const r = await fetch('/api/' + p, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...o, body: o.body ? JSON.stringify(o.body) : undefined });
  if (r.status === 401) { location.href = 'login.html'; throw 0; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Gagal');
  return j;
}
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const ICON_CLS = `<svg viewBox="0 0 48 50" width="52" height="52" aria-hidden="true" style="flex:none;filter:drop-shadow(0 4px 3px rgba(30,27,75,.3))"><defs><linearGradient id="gCLS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93C5FD"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs><g transform="translate(0,3)" fill="#1E3A8A"><path d="M24 7L2 18l22 11 22-11z"/><path d="M10 25v9c0 4 6 8 14 8s14-4 14-8v-9l-14 7z"/></g><g fill="url(#gCLS)"><path d="M24 7L2 18l22 11 22-11z"/><path d="M10 25v9c0 4 6 8 14 8s14-4 14-8v-9l-14 7z"/></g><path d="M44 19v12" stroke="#FDE68A" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M10 17l10-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".55"/></svg>`, ICON_ALR = `<svg viewBox="0 0 48 50" width="44" height="44" aria-hidden="true" style="flex:none;filter:drop-shadow(0 4px 3px rgba(30,27,75,.3))"><defs><linearGradient id="gALR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCA5A5"/><stop offset="1" stop-color="#DC2626"/></linearGradient></defs><g transform="translate(0,3)" fill="#991B1B"><path d="M24 5L45 41H3z"/></g><g fill="url(#gALR)"><path d="M24 5L45 41H3z"/></g><rect x="22" y="17" width="4" height="13" rx="2" fill="#fff"/><circle cx="24" cy="35" r="2.5" fill="#fff"/></svg>`;
const CARD = 'background:#fff;border-radius:18px;box-shadow:0 8px 20px -6px rgba(79,70,229,.22)';
const PAL = [['#F472B6', '#BE185D'], ['#60A5FA', '#1D4ED8'], ['#FBBF24', '#B45309'], ['#2DD4BF', '#0F766E'], ['#FB923C', '#C2410C'], ['#A78BFA', '#6D28D9']];
const ST = { H: ['Hadir', '#DCFCE7', '#166534'], S: ['Sakit', '#FEF3C7', '#92400E'], I: ['Izin', '#DBEAFE', '#1E40AF'], A: ['Alpa', '#FEE2E2', '#991B1B'] };
const av = (n, i, sz = 44) => { const [a, b] = PAL[i % PAL.length]; return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:linear-gradient(145deg,${a},${b});color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 1px rgba(255,255,255,.45);flex:none">${esc((n || '?')[0].toUpperCase())}</div>`; };
const chip = s => { const t = ST[s] || ['Belum absen', '#EDE9FE', '#5B21B6']; return `<span style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:99px;background:${t[1]};color:${t[2]};white-space:nowrap">${t[0]}</span>`; };
const toData = (file, max, type) => new Promise(res => { const im = new Image(); im.onload = () => { const sc = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = im.width * sc; c.height = im.height * sc; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL(type, .85)); }; im.src = URL.createObjectURL(file); });

async function kelasAktif() {
  const list = await api('kelas');
  const id = +localStorage.getItem('kelas_id');
  const k = list.find(x => x.id === id) || list[0];
  if (k) { localStorage.setItem('kelas_id', k.id); $$('[data-kelas]').forEach(e => e.textContent = 'Kelas ' + k.nama); $$('[data-kelasnama]').forEach(e => e.textContent = k.nama); }
  return k;
}
async function common() {
  const p = await api('pengaturan');
  $$('[data-nama]').forEach(e => e.textContent = p.nama_wali || '');
  $$('[data-sekolah]').forEach(e => e.textContent = p.sekolah || '');
  if (p.foto) $$('img[data-foto]').forEach(e => e.src = p.foto);
  return p;
}

async function index() {
  const k = await kelasAktif(); if (!k) return;
  const rows = await api(`absensi?kelas=${k.id}&tanggal=${today()}`);
  const c = { H: 0, S: 0, I: 0, A: 0 };
  rows.forEach(r => { if (c[r.status] !== undefined) c[r.status]++; });
  $('#hadir').textContent = c.H; $('#total').textContent = rows.length;
  ['S', 'I', 'A'].forEach(x => $('#c' + x).textContent = c[x]);
  $('#pbar').style.width = (rows.length ? Math.round(c.H * 100 / rows.length) : 0) + '%';
  const abs = rows.filter(r => ['S', 'I', 'A'].includes(r.status));
  $('#perhatian').innerHTML = abs.length ? abs.map(r => `<div style="${CARD};padding:12px;display:flex;gap:12px;align-items:center">${ICON_ALR}<div><div style="font-size:14px;font-weight:700">${esc(r.nama)}</div><div style="font-size:13px;color:#475569">${ST[r.status][0]} hari ini</div></div></div>`).join('')
    : `<div style="${CARD};padding:14px;font-size:13px;color:#475569">Tidak ada siswa yang perlu perhatian hari ini.</div>`;
}

async function absensi() {
  const k = await kelasAktif(); if (!k) return;
  const t = today(), box = $('#abs');
  const rows = await api(`absensi?kelas=${k.id}&tanggal=${t}`);
  rows.forEach(r => r.status = r.status || 'H');
  const B = { H: ['Hadir', '#4ADE80', '#15803D'], S: ['Sakit', '#FBBF24', '#B45309'], I: ['Izin', '#60A5FA', '#1D4ED8'], A: ['Alpa', '#F87171', '#B91C1C'] };
  const btn = (r, s) => r.status === s
    ? `<button data-id="${r.id}" data-s="${s}" aria-label="${B[s][0]}" style="height:44px;width:44px;border-radius:12px;font-size:13px;font-weight:800;border:0;background:linear-gradient(145deg,${B[s][1]},${B[s][2]});color:#fff;box-shadow:0 4px 8px -2px ${B[s][2]}99,inset 0 2px 1px rgba(255,255,255,.45),inset 0 -2px 2px rgba(0,0,0,.2)">${s}</button>`
    : `<button data-id="${r.id}" data-s="${s}" aria-label="${B[s][0]}" style="height:44px;width:44px;border-radius:12px;font-size:13px;font-weight:800;border:1px solid #C7D2FE;background:#fff;color:#475569">${s}</button>`;
  const draw = () => {
    box.innerHTML = rows.length ? rows.map((r, i) => `<div style="display:flex;align-items:center;gap:4px;padding:8px 12px;border-bottom:1px solid #EDE9FE">${av(r.nama, i, 36)}<div style="flex:1;font-size:14px;font-weight:600;margin-left:6px;min-width:0">${esc(r.nama)}</div>${['H', 'S', 'I', 'A'].map(s => btn(r, s)).join('')}</div>`).join('')
      : '<div style="padding:20px;font-size:14px;color:#475569">Belum ada siswa di kelas ini. Tambahkan lewat menu Siswa.</div>';
    ['H', 'S', 'I', 'A'].forEach(s => $('#c' + s).textContent = rows.filter(r => r.status === s).length);
  };
  box.onclick = e => { const b = e.target.closest('button[data-s]'); if (!b) return; rows.find(r => r.id == b.dataset.id).status = b.dataset.s; draw(); };
  draw();
  const sv = $('#simpan');
  sv.onclick = async () => {
    try { await api('absensi', { method: 'POST', body: { tanggal: t, items: rows.map(r => ({ siswa_id: r.id, status: r.status })) } }); sv.textContent = 'Tersimpan'; }
    catch (e) { alert(e.message); }
    setTimeout(() => sv.textContent = 'Simpan absensi', 1500);
  };
}

async function daftar() {
  const k = await kelasAktif(); if (!k) return;
  const list = await api('siswa?kelas=' + k.id);
  $('#jml').textContent = list.length + ' siswa';
  let f = 'all';
  const draw = () => {
    const q = $('#cari').value.toLowerCase();
    const rows = list.filter(s => (s.nama + ' ' + (s.nis || '')).toLowerCase().includes(q) && (f === 'all' || (f === 'perhatian' && s.status === 'A') || (f !== 'perhatian' && (s.jk || '')[0]?.toUpperCase() === f)));
    $('#list').innerHTML = `<button id="add" style="height:48px;border:2px dashed #A78BFA;border-radius:16px;background:none;color:#6D28D9;font-size:14px;font-weight:800;flex:none">+ Tambah siswa</button>` +
      rows.map((s, i) => `<div role="link" tabindex="0" data-id="${s.id}" style="${CARD};padding:10px 12px;display:flex;gap:12px;align-items:center;cursor:pointer;flex:none">${av(s.nama, i)}<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:800">${esc(s.nama)}</div><div style="font-size:12px;color:#475569">NIS ${esc(s.nis || '-')} · ${esc((s.jk || '-')[0].toUpperCase())}</div></div>${chip(s.status)}</div>`).join('');
  };
  $('#list').onclick = e => { if (e.target.closest('#add')) return location.href = 'lengkap.html?new=1'; const r = e.target.closest('[data-id]'); if (r) location.href = 'lengkap.html?id=' + r.dataset.id; };
  $('#cari').oninput = draw;
  $$('[data-f]').forEach(b => b.onclick = () => { f = b.dataset.f; $$('[data-f]').forEach(x => { const on = x === b; x.style.background = on ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#fff'; x.style.color = on ? '#fff' : '#475569'; x.style.border = on ? '0' : '1px solid #C7D2FE'; }); draw(); });
  draw();
}

async function lengkap() {
  const id = new URLSearchParams(location.search).get('id');
  const k = await kelasAktif(); if (!k) return;
  let s = { nama: '', nis: '', jk: '', data: {} };
  if (id) s = await api('siswa?id=' + id);
  const inputs = $$('input[name]');
  inputs.forEach(i => { const n = i.name; i.value = (n === 'nama' || n === 'nis' || n === 'jk') ? (s[n] || '') : ((s.data || {})[n] || ''); });
  const head = () => {
    const nm = $('[name=nama]').value || 'Siswa baru';
    $('#hnama').textContent = nm; $('#hin').textContent = nm[0].toUpperCase();
    $('#hsub').textContent = `NIS ${$('[name=nis]').value || '-'} · Kelas ${k.nama}`;
    const kosong = inputs.filter(i => !i.value.trim()), pct = Math.round((inputs.length - kosong.length) * 100 / inputs.length);
    $('#kpct').textContent = pct + '%'; $('#kbar').style.width = pct + '%';
    $('#kbelum').textContent = kosong.length ? kosong.slice(0, 3).map(i => i.closest('label').firstChild.textContent).join(', ') + (kosong.length > 3 ? ` dan ${kosong.length - 3} lainnya` : '') : 'semua terisi';
  };
  inputs.forEach(i => i.oninput = head); head();
  const sv = $('#simpan');
  sv.onclick = async () => {
    const body = { id: s.id, kelas_id: s.kelas_id || k.id, nama: $('[name=nama]').value.trim(), nis: $('[name=nis]').value.trim(), jk: $('[name=jk]').value.trim(), data: {} };
    if (!body.nama) return alert('Nama siswa wajib diisi');
    inputs.forEach(i => { if (!['nama', 'nis', 'jk'].includes(i.name)) body.data[i.name] = i.value; });
    try { s = await api('siswa', { method: 'POST', body }); sv.textContent = 'Tersimpan'; history.replaceState(null, '', 'lengkap.html?id=' + s.id); }
    catch (e) { alert(e.message); }
    setTimeout(() => sv.textContent = 'Simpan data siswa', 1500);
  };
}

async function kelas() {
  const aktif = await kelasAktif();
  const list = await api('kelas');
  $('#kelaslist').innerHTML = list.map(k => `<div role="link" tabindex="0" data-id="${k.id}" style="${CARD};border:2px solid ${aktif && k.id === aktif.id ? '#7C3AED' : 'transparent'};padding:12px;display:flex;gap:12px;align-items:center;cursor:pointer;flex:none">${ICON_CLS}<div style="flex:1"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:16px;font-weight:800">Kelas ${esc(k.nama)}</span>${aktif && k.id === aktif.id ? '<span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:99px;background:#DCFCE7;color:#166534">Aktif</span>' : ''}</div><div style="font-size:13px;color:#475569;margin-top:1px">${esc(k.peran)} · ${k.jumlah} siswa · TA ${esc(k.tahun_ajaran)}</div></div></div>`).join('') +
    `<button id="tambah" style="height:50px;border:2px dashed #A78BFA;border-radius:16px;background:none;color:#6D28D9;font-size:14px;font-weight:800;flex:none">+ Tambah kelas</button>`;
  $('#kelaslist').onclick = async e => {
    if (e.target.closest('#tambah')) { const n = prompt('Nama kelas (contoh: 8C)'); if (n) { await api('kelas', { method: 'POST', body: { nama: n.trim() } }); location.reload(); } return; }
    const r = e.target.closest('[data-id]'); if (r) { localStorage.setItem('kelas_id', r.dataset.id); location.href = 'daftar.html'; }
  };
}

async function pengaturan() {
  const p = await api('pengaturan'), k = await kelasAktif(); if (!k) return;
  const F = n => $(`[name=${n}]`);
  F('nama_wali').value = p.nama_wali || ''; F('nama_kelas').value = k.nama; F('tahun_ajaran').value = k.tahun_ajaran || ''; F('peran').value = k.peran || '';
  const showLogo = d => $('#logobox').innerHTML = `<img alt="Logo sekolah" src="${d}" style="width:64px;height:64px;object-fit:contain">`;
  if (p.logo) showLogo(p.logo);
  let foto, logo;
  $('#gantifoto').onclick = () => $('#ffoto').click();
  $('#unggahlogo').onclick = () => $('#flogo').click();
  $('#ffoto').onchange = async e => { if (e.target.files[0]) { foto = await toData(e.target.files[0], 256, 'image/jpeg'); $('img[data-foto]').src = foto; } };
  $('#flogo').onchange = async e => { if (e.target.files[0]) { logo = await toData(e.target.files[0], 256, 'image/png'); showLogo(logo); } };
  const flash = (b, t) => { const o = b.textContent; b.textContent = t; setTimeout(() => b.textContent = o, 1500); };
  const kelasBody = () => ({ id: k.id, nama: F('nama_kelas').value.trim(), tahun_ajaran: F('tahun_ajaran').value.trim(), peran: F('peran').value.trim() });
  $('#editkelas').onclick = async function () { try { await api('kelas', { method: 'PUT', body: kelasBody() }); flash(this, 'Tersimpan'); } catch (e) { alert(e.message); } };
  $('#tambahkelas').onclick = async () => { const n = prompt('Nama kelas baru (contoh: 8C)'); if (n) { try { await api('kelas', { method: 'POST', body: { nama: n.trim() } }); alert('Kelas ditambahkan. Pilih di menu Kelas.'); } catch (e) { alert(e.message); } } };
  $('#simpan').onclick = async function () {
    const body = { nama_wali: F('nama_wali').value.trim() }; if (foto) body.foto = foto; if (logo) body.logo = logo;
    try { await api('pengaturan', { method: 'POST', body }); await api('kelas', { method: 'PUT', body: kelasBody() }); flash(this, 'Tersimpan'); } catch (e) { alert(e.message); }
  };
}

// RUMUS-START
const MAPEL = ['PAI', 'PAK', 'PKN', 'BIN', 'BING', 'MAT', 'IPA', 'IPS', 'TIK', 'PJOK', 'SBKP', 'BHD'];
const TOP = 10;
function hitung(skor) {
  const v = MAPEL.map(m => skor && skor[m]).filter(x => x !== '' && x != null && !isNaN(x)).map(Number);
  const total = v.reduce((a, b) => a + b, 0);
  return { total, n: v.length, rerata: v.length ? total / v.length : 0 };
}
function ranking(rows) {
  const vals = [...new Set(rows.filter(r => r.n).map(r => Math.round(r.rerata * 100)))].sort((a, b) => b - a);
  rows.forEach(r => { const i = r.n ? vals.indexOf(Math.round(r.rerata * 100)) : -1; r.rank = i >= 0 && i < TOP ? i + 1 : null; });
}
// RUMUS-END
const MCOL = { PAI: '#F4B6C8', PAK: '#E8E4C9', PKN: '#B7D7F0', BIN: '#F9CB3C', BING: '#5B9BD5', MAT: '#E7A5D2', IPA: '#F5B183', IPS: '#9BC84B', TIK: '#F4A640', PJOK: '#C9BCE0', SBKP: '#5B9BD5', BHD: '#E9B8B0' };
const fmt = n => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function nilai() {
  const k = await kelasAktif(); if (!k) return;
  let sem = 'Ganjil', view = 'daftar', rows = [], cur = null;
  const key = () => `${k.tahun_ajaran}-${sem}`;
  const recalc = () => { rows.forEach(r => Object.assign(r, hitung(r.skor))); ranking(rows); };
  const load = async () => {
    const d = await api(`nilai?kelas=${k.id}&semester=${encodeURIComponent(key())}`);
    rows = d.map(r => ({ ...r, skor: r.skor || {}, sakit: r.sakit ?? '', izin: r.izin ?? '', alpa: r.alpa ?? '' }));
    recalc(); draw();
  };
  const badge = r => r.rank ? `<span style="font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px;background:linear-gradient(135deg,#FDE68A,#F59E0B);color:#78350F">Peringkat ${r.rank}</span>` : '';
  const draw = () => {
    const isi = rows.filter(r => r.n);
    const avg = isi.length ? isi.reduce((a, r) => a + r.rerata, 0) / isi.length : 0;
    const top = isi.reduce((a, r) => (!a || r.rerata > a.rerata) ? r : a, null);
    const sc = (bg, t, v) => `<div style="flex:1;background:${bg};border-radius:16px;padding:10px 12px;color:#fff;box-shadow:inset 0 2px 1px rgba(255,255,255,.35)"><div style="font-size:11px;font-weight:700">${t}</div><div style="font-size:18px;font-weight:800;margin-top:2px">${v}</div></div>`;
    $('#sum').innerHTML = sc('linear-gradient(145deg,#0D9488,#0F766E)', 'Rerata kelas', isi.length ? fmt(avg) : '-') + sc('linear-gradient(145deg,#2563EB,#1D4ED8)', 'Tertinggi', top ? fmt(top.rerata) : '-') + sc('linear-gradient(145deg,#C2410C,#9A3412)', 'Terisi', `${isi.length}/${rows.length}`);
    $$('[data-sem]').forEach(b => { const on = b.dataset.sem === sem; b.style.background = on ? 'linear-gradient(135deg,#0D9488,#0F766E)' : '#fff'; b.style.color = on ? '#fff' : '#475569'; b.style.border = on ? '0' : '1px solid #C7D2FE'; });
    $$('[data-view]').forEach(b => { const on = b.dataset.view === view; b.style.background = on ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#fff'; b.style.color = on ? '#fff' : '#475569'; b.style.border = on ? '0' : '1px solid #C7D2FE'; });
    if (!rows.length) { $('#nbody').innerHTML = '<div style="padding:20px;font-size:14px;color:#475569">Belum ada siswa di kelas ini. Tambahkan lewat menu Siswa.</div>'; return; }
    if (view === 'daftar') {
      $('#nbody').innerHTML = rows.map((r, i) => `<div role="button" tabindex="0" data-id="${r.id}" style="${CARD};padding:10px 12px;display:flex;gap:12px;align-items:center;cursor:pointer;margin-bottom:10px">${av(r.nama, i)}<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:800">${esc(r.nama)}</div><div style="font-size:12px;color:#475569">${r.n ? `Total ${r.total} · Rerata ${fmt(r.rerata)}` : 'Nilai belum diisi'}</div></div>${badge(r)}</div>`).join('');
    } else {
      const th = (t, bg, ex = '') => `<th style="background:${bg};padding:6px 8px;font-size:11px;font-weight:800;border:1px solid #94A3B8;white-space:nowrap;${ex}">${t}</th>`;
      const td = (v, ex = '') => `<td style="border:1px solid #CBD5E1;padding:6px 8px;font-size:12px;text-align:center;${ex}">${v}</td>`;
      $('#nbody').innerHTML = `<div style="background:#fff;border-radius:12px;overflow:auto;height:100%"><table style="border-collapse:collapse;min-width:100%"><thead><tr>${th('Nama', '#DDE5B6', 'position:sticky;left:0;z-index:2;text-align:left;min-width:130px')}${MAPEL.map(m => th(m, MCOL[m])).join('')}${th('Sakit', '#fff')}${th('Izin', '#fff')}${th('Alpa', '#fff')}${th('Rerata', '#B9A4DD')}${th('Total', '#E4A9A9')}${th('Peringkat', '#F9D54A')}</tr></thead><tbody>${rows.map((r, i) => `<tr data-id="${r.id}" style="cursor:pointer">${td(`${i + 1}. ${esc(r.nama)}`, 'position:sticky;left:0;background:#fff;text-align:left;white-space:nowrap;font-weight:700')}${MAPEL.map(m => td(r.skor[m] ?? '', `background:${MCOL[m]}33`)).join('')}${td(r.sakit)}${td(r.izin)}${td(r.alpa)}${td(r.n ? fmt(r.rerata) : '', 'font-weight:700')}${td(r.n ? r.total : '', 'font-weight:700')}${td(r.rank ?? '', 'font-weight:800')}</tr>`).join('')}</tbody></table></div>`;
    }
  };
  const inp = 'width:100%;box-sizing:border-box;height:44px;border:1px solid #C7D2FE;border-radius:12px;text-align:center;font:700 15px inherit;background:#fff';
  const open = r => {
    cur = r; const E = $('#editor'); E.hidden = false;
    E.innerHTML = `<div style="background:linear-gradient(135deg,#4F46E5,#7C3AED 60%,#C026D3);padding:20px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div style="font-size:12px;font-weight:700">Nilai rapor · ${esc(sem)} ${esc(k.tahun_ajaran)}</div><div style="font-size:18px;font-weight:800">${esc(r.nama)}</div></div><button id="tutup" style="height:44px;padding:0 16px;border:0;border-radius:12px;background:rgba(255,255,255,.2);color:#fff;font-weight:800">Tutup</button></div>
      <div style="padding:14px 20px 0;font-size:12px;color:#475569">Isi PAI atau PAK sesuai agama siswa. Mata pelajaran yang kosong tidak dihitung.</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px 20px 0">${MAPEL.map(m => `<label style="display:block"><span style="display:block;font-size:11px;font-weight:800;margin-bottom:3px;padding:2px 8px;border-radius:8px;background:${MCOL[m]}">${m}</span><input data-m="${m}" inputmode="numeric" maxlength="3" value="${esc(r.skor[m] ?? '')}" style="${inp}"></label>`).join('')}</div>
      <div style="padding:16px 20px 0;font-size:14px;font-weight:800">Ketidakhadiran</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:8px 20px 0">${[['sakit', 'Sakit'], ['izin', 'Izin'], ['alpa', 'Alpa']].map(([a, l]) => `<label style="display:block"><span style="display:block;font-size:11px;font-weight:800;margin-bottom:3px">${l}</span><input data-a="${a}" inputmode="numeric" maxlength="3" value="${esc(r[a])}" style="${inp}"></label>`).join('')}</div>
      <div style="display:flex;gap:10px;padding:16px 20px 0"><div style="flex:1;${CARD};padding:12px"><div style="font-size:12px;color:#475569;font-weight:700">Total</div><div id="et" style="font-size:22px;font-weight:800;color:#4F46E5"></div></div><div style="flex:1;${CARD};padding:12px"><div style="font-size:12px;color:#475569;font-weight:700">Rerata</div><div id="er" style="font-size:22px;font-weight:800;color:#0F766E"></div></div></div>
      <div style="padding:16px 20px 24px"><button id="simpan" style="width:100%;height:50px;border:0;border-radius:16px;background:linear-gradient(135deg,#4ADE80,#15803D);color:#fff;font:800 15px inherit;box-shadow:0 8px 16px -4px rgba(21,128,61,.5),inset 0 2px 1px rgba(255,255,255,.45),inset 0 -3px 2px rgba(0,0,0,.2)">Simpan nilai</button></div>`;
    const read = () => { const sk = {}; $$('[data-m]', E).forEach(i => sk[i.dataset.m] = i.value.trim()); return sk; };
    const live = () => { const h = hitung(read()); $('#et').textContent = h.total; $('#er').textContent = h.n ? fmt(h.rerata) : '-'; };
    E.oninput = live; live();
    $('#tutup').onclick = () => E.hidden = true;
    $('#simpan').onclick = async function () {
      const body = { siswa_id: r.id, semester: key(), skor: read() };
      $$('[data-a]', E).forEach(i => body[i.dataset.a] = i.value.trim());
      for (const m of MAPEL) if (body.skor[m] !== '' && !(Number(body.skor[m]) >= 0 && Number(body.skor[m]) <= 100)) return alert(`Nilai ${m} harus 0 sampai 100`);
      try {
        const d = await api('nilai', { method: 'POST', body });
        r.skor = d.skor; ['sakit', 'izin', 'alpa'].forEach(a => r[a] = body[a]);
        recalc(); draw(); E.hidden = true;
      } catch (e) { alert(e.message); }
    };
  };
  $('#nbody').onclick = e => { const x = e.target.closest('[data-id]'); if (x) open(rows.find(r => r.id == x.dataset.id)); };
  $$('[data-sem]').forEach(b => b.onclick = () => { sem = b.dataset.sem; load(); });
  $$('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; draw(); });
  $('#csv').onclick = () => {
    const head = ['No', 'Nama', 'NISN', 'NIS', ...MAPEL, 'Sakit', 'Izin', 'Alpa', 'Rerata', 'Total', 'Peringkat'];
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [head.map(q).join(';')].concat(rows.map((r, i) => [i + 1, r.nama, r.nisn, r.nis, ...MAPEL.map(m => r.skor[m] ?? ''), r.sakit, r.izin, r.alpa, r.n ? fmt(r.rerata) : '', r.n ? r.total : '', r.rank ?? ''].map(q).join(';')));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `leger-kelas-${k.nama}-${sem}.csv`; a.click();
  };
  await load();
}

(async () => {
  const page = location.pathname.replace(/\.html$/, '').replace(/^\//, '') || 'index';
  $$('[data-tgl]').forEach(e => e.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  if (page === 'login') return;
  try { await common(); const fn = { index, absensi, daftar, lengkap, kelas, pengaturan, nilai }[page]; if (fn) await fn(); }
  catch (e) { if (e) { console.error(e); alert(e.message || 'Gagal memuat data'); } }
})();
