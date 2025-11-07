/*
  # Lab Management System Schema

  1. New Tables
    - `items` - Inventory items (alat dan bahan laboratorium)
      - `id` (uuid, primary key)
      - `name` (text) - Nama alat/bahan
      - `category` (text) - Kategori (Fisika, Kimia, Biologi)
      - `good_condition` (integer) - Jumlah kondisi baik
      - `fair_condition` (integer) - Jumlah kondisi kurang baik
      - `damaged` (integer) - Jumlah rusak
      - `lost` (integer) - Jumlah hilang
      - `location` (text) - Lokasi penyimpanan
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `transactions` - Transaksi peminjaman
      - `id` (uuid, primary key)
      - `borrower_name` (text) - Nama peminjam
      - `class` (text) - Kelas
      - `activity` (text) - Kegiatan/tujuan
      - `borrow_date` (date) - Tanggal pinjam
      - `borrow_time` (time) - Jam pinjam
      - `return_date` (date) - Tanggal kembali
      - `return_time` (time) - Jam kembali
      - `status` (text) - Status (Dipinjam/Dikembalikan)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      
    - `transaction_items` - Detail alat yang dipinjam
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `quantity` (integer)
      - `borrow_condition` (text) - Kondisi saat pinjam
      - `return_condition` (text) - Kondisi saat kembali
      
    - `journals` - Jurnal laboratorium
      - `id` (uuid, primary key)
      - `date` (date)
      - `time` (time)
      - `teacher_name` (text)
      - `class` (text)
      - `topic` (text) - Materi/topik
      - `result` (text) - Hasil praktikum
      - `notes` (text) - Keterangan
      - `return_date` (date)
      - `signature` (text) - Base64 signature
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      
    - `journal_items` - Alat yang digunakan dalam jurnal
      - `id` (uuid, primary key)
      - `journal_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `quantity` (integer)
      
    - `lkm_documents` - Dokumen E-LKM
      - `id` (uuid, primary key)
      - `title` (text)
      - `class_level` (text) - Kelas (7, 8, atau 9)
      - `file_url` (text) - URL file PDF
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data
    - Public read access for certain views
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Fisika', 'Kimia', 'Biologi')),
  good_condition integer DEFAULT 0 CHECK (good_condition >= 0),
  fair_condition integer DEFAULT 0 CHECK (fair_condition >= 0),
  damaged integer DEFAULT 0 CHECK (damaged >= 0),
  lost integer DEFAULT 0 CHECK (lost >= 0),
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_name text NOT NULL,
  class text DEFAULT '',
  activity text DEFAULT '',
  borrow_date date NOT NULL,
  borrow_time time NOT NULL,
  return_date date,
  return_time time,
  status text DEFAULT 'Dipinjam' CHECK (status IN ('Dipinjam', 'Dikembalikan')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  borrow_condition text DEFAULT 'Baik' CHECK (borrow_condition IN ('Baik', 'Kurang Baik')),
  return_condition text CHECK (return_condition IN ('Baik', 'Kurang Baik', 'Rusak', 'Hilang'))
);

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time NOT NULL,
  teacher_name text NOT NULL,
  class text NOT NULL,
  topic text NOT NULL,
  result text DEFAULT '',
  notes text DEFAULT '',
  return_date date,
  signature text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create journal_items table
CREATE TABLE IF NOT EXISTS journal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid REFERENCES journals(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0)
);

-- Create lkm_documents table
CREATE TABLE IF NOT EXISTS lkm_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_level text NOT NULL CHECK (class_level IN ('7', '8', '9')),
  file_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkm_documents ENABLE ROW LEVEL SECURITY;

-- Items policies (authenticated users can manage)
CREATE POLICY "Authenticated users can view items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (true);

-- Transactions policies
CREATE POLICY "Authenticated users can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- Transaction items policies
CREATE POLICY "Authenticated users can view transaction items"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transaction items"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaction items"
  ON transaction_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transaction items"
  ON transaction_items FOR DELETE
  TO authenticated
  USING (true);

-- Journals policies
CREATE POLICY "Authenticated users can view journals"
  ON journals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert journals"
  ON journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update journals"
  ON journals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete journals"
  ON journals FOR DELETE
  TO authenticated
  USING (true);

-- Journal items policies
CREATE POLICY "Authenticated users can view journal items"
  ON journal_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert journal items"
  ON journal_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update journal items"
  ON journal_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete journal items"
  ON journal_items FOR DELETE
  TO authenticated
  USING (true);

-- LKM documents policies
CREATE POLICY "Authenticated users can view LKM documents"
  ON lkm_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert LKM documents"
  ON lkm_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update LKM documents"
  ON lkm_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete LKM documents"
  ON lkm_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals(date);
CREATE INDEX IF NOT EXISTS idx_journals_user ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_lkm_class ON lkm_documents(class_level);

-- Insert seed data
INSERT INTO items (name, category, good_condition, fair_condition, damaged, lost, location)
VALUES 
  ('Mikroskop', 'Biologi', 15, 5, 0, 0, 'Lemari B2'),
  ('Gelas Ukur 100 ml', 'Kimia', 20, 2, 1, 0, 'Lemari A1'),
  ('Dinamometer', 'Fisika', 6, 1, 1, 0, 'Rak C1')
ON CONFLICT DO NOTHING;