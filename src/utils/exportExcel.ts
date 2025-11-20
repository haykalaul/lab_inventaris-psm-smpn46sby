import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export async function exportAllData() {
  const { data: items } = await supabase.from('items').select('*');
  const { data: transactions } = await supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_items (
        quantity,
        borrow_condition,
        return_condition,
        items (name)
      )
    `
    );
  const { data: journals } = await supabase
    .from('journals')
    .select(
      `
      *,
      journal_items (
        quantity,
        items (name)
      )
    `
    );

  const wb = XLSX.utils.book_new();

  const inventoryData = [
    ['Nama', 'Kategori', 'Baik', 'Kurang Baik', 'Rusak', 'Hilang', 'Lokasi'],
    ...(items || []).map((item) => [
      item.name,
      item.category,
      item.good_condition,
      item.fair_condition,
      item.damaged,
      item.lost,
      item.location || '',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inventoryData), 'Inventaris');

  const transactionData = [
    ['ID', 'Nama Peminjam', 'Kelas', 'Alat (qty)', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status'],
    ...(transactions || []).map((tx: { id: string; borrower_name: string; class?: string; transaction_items: Array<{ items: { name: string }; quantity: number }>; borrow_date: string; return_date?: string; status: string }) => [
      tx.id,
      tx.borrower_name,
      tx.class || '',
      tx.transaction_items.map((ti) => `${ti.items.name} (${ti.quantity})`).join('; '),
      tx.borrow_date,
      tx.return_date || '',
      tx.status,
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transactionData), 'Log Peminjaman');

  const journalData = [
    ['Tanggal', 'Jam', 'Guru', 'Kelas', 'Materi/Topik', 'Alat (qty)', 'Hasil', 'Keterangan', 'Tanggal Kembali', 'Tanda Tangan'],
    ...(journals || []).map((j: { date: string; time: string; teacher_name: string; class: string; topic: string; journal_items: Array<{ items: { name: string }; quantity: number }>; result?: string; notes?: string; return_date?: string; signature?: string }) => [
      j.date,
      j.time,
      j.teacher_name,
      j.class,
      j.topic,
      j.journal_items.map((ji) => `${ji.items.name} (${ji.quantity})`).join('; '),
      j.result || '',
      j.notes || '',
      j.return_date || '',
      j.signature || '',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(journalData), 'Jurnal');

  const now = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `SMPN46_Lab_All_${now}.xlsx`);
}

export async function exportJournalMonthly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { data: journals } = await supabase
    .from('journals')
    .select(
      `
      *,
      journal_items (
        quantity,
        items (name)
      )
    `
    )
    .gte('date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
    .lt('date', `${year}-${String(month + 2).padStart(2, '0')}-01`)
    .order('date', { ascending: false });

  const wb = XLSX.utils.book_new();

  const journalData = [
    ['Tanggal', 'Jam', 'Guru', 'Kelas', 'Materi/Topik', 'Alat (qty)', 'Hasil', 'Keterangan', 'Tanggal Kembali', 'Tanda Tangan'],
    ...(journals || []).map((j: { date: string; time: string; teacher_name: string; class: string; topic: string; journal_items: Array<{ items: { name: string }; quantity: number }>; result?: string; notes?: string; return_date?: string; signature?: string }) => [
      j.date,
      j.time,
      j.teacher_name,
      j.class,
      j.topic,
      j.journal_items.map((ji) => `${ji.items.name} (${ji.quantity})`).join('; '),
      j.result || '',
      j.notes || '',
      j.return_date || '',
      j.signature || '',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(journalData), 'Jurnal');

  const dateStr = now.toISOString().split('T')[0];
  XLSX.writeFile(wb, `SMPN46_Jurnal_${dateStr}.xlsx`);
}
