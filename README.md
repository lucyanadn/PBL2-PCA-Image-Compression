## PCA Image Compression

## Struktur Folder
```
webapp/
├── app.py              # Backend Flask 
├── pca.py               # Logic PCA
├── requirements.txt
├── templates/
│   └── index.html        # Halaman utama
└── static/
    ├── css/style.css
    └── js/script.js
```

## Cara Menjalankan
1. Install dependency:
   ```
   pip install -r requirements.txt
   ```
2. Jalankan server:
   ```
   python app.py
   ```
3. Buka browser ke `http://127.0.0.1:5000`

## Alur Kerja
1. Upload gambar (klik atau drag & drop) → preview langsung muncul di panel **Before**.
2. Geser slider **Compression rate** (0–99%).
3. Klik **Compress Image** → request dikirim ke `/compress`, diproses pakai `kompresi_gambar_rgb()`
   dari `pca.py`, hasilnya (base64 PNG) dikirim balik dan ditampilkan di panel **After**.
4. Statistik (persentase perbedaan ukuran file & waktu proses) muncul di bawah.
5. Klik **Download / Save As** untuk menyimpan hasil — file di-download langsung dari
   data di browser, tidak perlu endpoint tambahan.

## Anggota Kelompok 10
1. PHOEBE THEODORE BEATRICE	(L0125060)
2. RESPANANDA AYUNING TYAS	(L0125064)
3. LUCYANA DORA NOVIYANTI	(L0125121)

