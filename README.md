# Sistem Inventaris Laboratorium IPA SMPN 46 Surabaya

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.4-3ECF8E.svg)](https://supabase.com/)

Portal modern untuk pengelolaan inventaris laboratorium IPA SMPN 46 Surabaya yang memudahkan pengelolaan alat dan bahan praktikum, peminjaman, jurnal laboratorium, serta E-LKM secara realtime dan digital.

## ✨ Fitur Utama

### 🏠 Dashboard Utama
- Navigasi intuitif ke semua modul sistem
- Tampilan modern dengan desain yang menarik
- Akses cepat ke fitur-fitur utama

### 📦 Manajemen Inventaris
- **Data Alat & Bahan**: Katalog lengkap alat dan bahan laboratorium
- **Kategori**: Fisika, Kimia, Biologi
- **Tracking Kondisi**: Baik, Kurang Baik, Rusak, Hilang
- **Lokasi Penyimpanan**: Informasi lokasi alat di laboratorium
- **Pencarian & Filter**: Cari berdasarkan nama atau kategori

### 🔄 Sistem Peminjaman
- **Form Peminjaman**: Input data peminjam dan alat yang dipinjam
- **Form Pengembalian**: Proses pengembalian dengan tracking kondisi
- **Status Tracking**: Monitor status peminjaman secara real-time
- **Riwayat Transaksi**: Log lengkap semua aktivitas peminjaman

### 📝 Jurnal Laboratorium
- **Entri Jurnal**: Rekam kegiatan praktikum harian
- **Tanda Tangan Digital**: Signature pad untuk validasi
- **KPI Dashboard**: Metrik kondisi alat dan aktivitas laboratorium
- **Ekspor Data**: Export ke Excel untuk pelaporan
- **Detail Alat**: Tracking alat yang digunakan per praktikum

### 📚 E-LKM (Elektronik Lembar Kerja Mahasiswa)
- **Panduan Praktikum**: Dokumen digital untuk setiap materi
- **Klasifikasi Kelas**: Terorganisir berdasarkan tingkat kelas (7, 8, 9)
- **Akses Mudah**: Upload dan akses dokumen PDF

### 👥 Sistem Autentikasi
- **Login Aman**: Autentikasi berbasis Supabase Auth
- **Role-based Access**: Kontrol akses berdasarkan peran pengguna
- **Session Management**: Manajemen sesi yang aman

## 🏗️ Struktur Proyek

```
lab_inventaris-psm-smpn46sby/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── Home.tsx                # Dashboard utama
│   │   ├── Inventaris.tsx          # Manajemen inventaris
│   │   ├── Peminjaman.tsx          # Form peminjaman
│   │   ├── Pengembalian.tsx        # Form pengembalian
│   │   ├── Jurnal.tsx              # Jurnal laboratorium
│   │   ├── ELKM.tsx                # E-LKM documents
│   │   ├── Teamwork.tsx            # About page
│   │   ├── Login.tsx               # Authentication
│   │   └── Layout.tsx              # Main layout
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── lib/
│   │   └── supabase.ts             # Supabase client
│   ├── utils/
│   │   └── exportExcel.ts          # Excel export utilities
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # App entry point
├── supabase/
│   └── migrations/                  # Database migrations
│       └── 20251107063440_create_lab_management_schema.sql
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS config
└── README.md                        # Documentation
```

## 🚀 Teknologi yang Digunakan

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Charts**: Built-in KPI components
- **Export**: XLSX for Excel export

## Akses Autentikasi Akun Guru (Masuk ke Sistem)

- **Email**: haykalaulil.22033@mhs.unesa.ac.id
- **Pass**: Guru25!

## 📋 Prasyarat

- Node.js 18+
- npm atau yarn
- Akun Supabase

## 🛠️ Setup Lokal

### 1. Clone Repository
```bash
git clone https://github.com/username/lab_inventaris-psm-smpn46sby.git
cd lab_inventaris-psm-smpn46sby
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Buat project baru di [Supabase](https://supabase.com)
2. Copy `.env.example` ke `.env.local`
3. Isi environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database
Jalankan migration Supabase:
```bash
# Via Supabase CLI (jika terinstall)
supabase db push

# Atau jalankan SQL migration secara manual di Supabase Dashboard
# File: supabase/migrations/20251107063440_create_lab_management_schema.sql
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🌐 Deploy ke Netlify

### 1. Build Production
```bash
npm run build
```

### 2. Deploy ke Netlify
1. Push kode ke GitHub repository
2. Connect repository ke Netlify
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variables di Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## 📊 Skema Database

Sistem menggunakan PostgreSQL dengan tabel berikut:

- **items**: Data alat dan bahan laboratorium
- **transactions**: Transaksi peminjaman/pengembalian
- **transaction_items**: Detail alat per transaksi
- **journals**: Jurnal kegiatan laboratorium
- **journal_items**: Alat yang digunakan per jurnal
- **lkm_documents**: Dokumen E-LKM

## 🤝 Berkontribusi

Kami menerima kontribusi untuk meningkatkan sistem ini!

### Cara Berkontribusi:
1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Panduan Kontribusi:
- Ikuti standar kode yang ada
- Tambahkan komentar pada kode baru
- Update dokumentasi jika diperlukan
- Test perubahan sebelum submit PR

## 📝 Lisensi

Proyek ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

## 👨‍💻 Tim Pengembang

Dikembangkan untuk SMPN 46 Surabaya sebagai solusi modernisasi manajemen laboratorium IPA.
Tim dan penanggung jawab Laboratorium IPA SMPN 46 Surabaya.
- Kepala Sekolah: Ani Musafa'ah, M.Pd.
- Kepala Laboratorium: Dra. Dwi Wulandari
- Guru Pamong: Priambodo, S.S
- Guru IPA: 1.Dra. Dwi Wulandari,2. Dra. Bekti Diah Widjajanti, M.Pd, 3. Dra. Mukammilah, 4. Ach. Jubaidi, S.Si,5. Serly Meinar Paramita, 6.Aditya Gama Nurcahyo
- Tim Penyusun: Arika Nadia Zalfa, Naurah Fakhrina, Novita Azzahra Ramadhina


---

**Catatan**: Sistem ini dirancang khusus untuk kebutuhan Laboratorium IPA SMPN 46 Surabaya. Untuk adaptasi ke sekolah lain, silakan hubungi tim pengembang.
