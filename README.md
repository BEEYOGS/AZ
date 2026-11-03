# Pembuat Template JPEG

Aplikasi web untuk membuat kartu, sertifikat, label, tiket, dan dokumen bernomor dari gambar template atau data Excel. Antarmuka menggunakan Next.js App Router, React, TypeScript, dan Tailwind CSS. Pembuatan gambar tetap berjalan sepenuhnya di browser; file pengguna tidak dikirim ke server.

## Menjalankan aplikasi

1. Pasang Node.js 20.9 atau yang lebih baru.
2. Dari folder proyek, jalankan `npm install`.
3. Jalankan `npm run dev`, lalu buka alamat yang ditampilkan (biasanya `http://localhost:3000`).
4. Untuk versi produksi, jalankan `npm run build`, lalu `npm run start`.

Jalankan versi Next.js melalui server lokal; file gambar, spreadsheet, dan hasil JPEG diproses di browser pengguna.

## Fitur

- Impor data dari Excel (`.xlsx` / `.xls`) atau buat nomor otomatis, misalnya `A0001` sampai `A1000` (maksimal 5.000 hasil per proses).
- Pilih template gambar, ukuran tiket/A4/Legal/Letter/ID Card atau ukuran khusus, orientasi, dan resolusi 300 PPI.
- Cetak teks, barcode Code 128, atau EAN-13, dengan pilihan font, warna, alignment, ukuran, dan jarak huruf.
- Atur hingga dua posisi cetak: geser tanda di pratinjau, pilih titik acuan, offset, dan rotasi.
- Unduh semua gambar JPEG dalam satu file ZIP.
- Pilihan tema terang/gelap disimpan di browser. Font Bebas Neue dan pustaka pemrosesan disertakan lokal.

## Cara pakai

1. Pilih gambar template (JPEG, PNG, atau format gambar lain yang didukung browser).
2. Pilih **Buat nomor otomatis** atau **Ambil dari Excel**. Di Excel, baris pertama adalah judul kolom dan data dibaca dari sheet pertama.
3. Atur ukuran hasil, jenis isi, font, alignment, dan satu atau dua posisi cetak. Pengaturan penempatan dapat diseret langsung pada pratinjau.
4. Tekan **Buat JPEG dan unduh ZIP**. Satu nomor atau satu baris Excel menghasilkan satu JPEG.

Ukuran kertas khusus menggunakan sentimeter; ukuran tulisan menggunakan point; tinggi barcode dan offset menggunakan milimeter. EAN-13 menerima 12 digit (check digit dihitung) atau 13 digit dengan check digit yang valid. Code 128 mendukung teks alfanumerik.

Pencarian font perangkat bergantung pada dukungan browser dan izin Local Font Access. Jika daftar font tidak tersedia, ketik nama font yang terpasang secara manual.

## Troubleshooting

- **Aplikasi tidak terbuka:** pastikan dependensi sudah terpasang dengan `npm install`, lalu jalankan `npm run dev` dari folder proyek.
- **Tombol unduh belum aktif:** pilih template. Mode nomor otomatis memerlukan awalan yang berakhir angka dan jumlah 1–5.000; mode Excel memerlukan judul kolom dan setidaknya satu baris data.
- **Barcode EAN-13 gagal:** gunakan 12 digit, atau 13 digit dengan check digit yang benar.
- **ZIP lambat atau gagal dibuat:** ukuran besar dan banyak hasil membutuhkan memori browser; bagi pekerjaan menjadi beberapa ZIP.
- **Font tidak berubah:** pastikan font terpasang dan nama font benar. Bebas Neue disertakan di folder `vendor`.

## Lisensi pustaka dan font

- SheetJS Community Edition: [`public/vendor/xlsx-LICENSE`](public/vendor/xlsx-LICENSE).
- JSZip: [`public/vendor/jszip-LICENSE.markdown`](public/vendor/jszip-LICENSE.markdown).
- JsBarcode: [`public/vendor/jsbarcode-LICENSE.txt`](public/vendor/jsbarcode-LICENSE.txt).
- Bebas Neue: [`public/vendor/BebasNeue-OFL.txt`](public/vendor/BebasNeue-OFL.txt).
