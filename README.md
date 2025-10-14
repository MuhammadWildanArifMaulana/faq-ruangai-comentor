# FAQ RuangAI Class (mini-web)

Repositori kecil ini berisi halaman FAQ statis untuk kelas "RuangAI Class".

Konten singkat:

- `index.html` — markup utama (Bootstrap + custom CSS/JS).
- `styles.css` — styling halaman dan penyesuaian responsif.
- `script.js` — fungsionalitas pencarian FAQ dan fitur voting (localStorage).
- `img/` — tempat logo dan gambar (jika ada).

Fitur penting

- Header responsif (desktop/tablet/mobile) dengan penyesuaian spacing.
- Voting ringan pada FAQ "Sesi live nya dimana? dan kapan?" yang:
  - Menyimpan pilihan di `localStorage` (satu vote per browser).
  - Menyembunyikan tombol setelah vote, menampilkan konfirmasi dan hasil animasi.
  - Catatan: vote hanya tersimpan lokal (tidak ada backend).
- Pencarian FAQ yang menyaring item dan menampilkan jumlah terlihat.

Cara menjalankan (lokal, cepat)

1. Buka PowerShell dan buka folder proyek:

```powershell
cd 'd:\academics\RuangAI\LenteRAI\mini-web'
```

2. Jalankan server statis sederhana (jika ada Python terpasang):

```powershell
python -m http.server 8000
```

3. Buka di browser: `http://localhost:8000`

Catatan pengembangan

- Untuk menyesuaikan jarak header/logo/search: edit `styles.css` pada selector `.header-logo` dan `.simple-header` (nilai `margin-bottom` dan `padding-bottom`).
- Agar voting bersifat global perlu backend; saat ini data hanya di browser pengguna.

Lisensi

- Bebas digunakan untuk keperluan internal.

Jika mau, saya bisa tambahkan instruksi testing otomatis atau screenshot preview untuk beberapa breakpoint—beri tahu saja apa yang Anda butuhkan.
