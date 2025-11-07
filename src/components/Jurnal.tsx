import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Download } from 'lucide-react';
import { exportAllData, exportJournalMonthly } from '../utils/exportExcel';

interface Item {
  id: string;
  name: string;
}

interface JournalItem {
  tempId: string;
  itemId: string;
  itemName: string;
  quantity: number;
}

interface Journal {
  id: string;
  date: string;
  time: string;
  teacher_name: string;
  class: string;
  topic: string;
  result: string;
  notes: string;
  return_date: string | null;
  signature: string | null;
  journal_items: Array<{
    items: { name: string };
    quantity: number;
  }>;
}

interface KPI {
  good: number;
  fair: number;
  damaged: number;
  lost: number;
  borrowed: number;
  totalJournals: number;
}

export function Jurnal() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [journalItems, setJournalItems] = useState<JournalItem[]>([]);
  const [kpi, setKpi] = useState<KPI>({ good: 0, fair: 0, damaged: 0, lost: 0, borrowed: 0, totalJournals: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    teacherName: '',
    class: '',
    topic: '',
    result: '',
    notes: '',
    returnDate: '',
  });

  useEffect(() => {
    if (user) {
      loadItems();
      loadJournals();
      loadKPI();
      addJournalItem();
      initSignaturePad();
    }
  }, [user]);

  const loadItems = async () => {
    const { data } = await supabase.from('items').select('id, name').order('name');
    if (data) setItems(data);
  };

  const loadJournals = async () => {
    const { data } = await supabase
      .from('journals')
      .select(
        `
        *,
        journal_items (
          items (name),
          quantity
        )
      `
      )
      .order('date', { ascending: false });

    if (data) {
      setJournals(data as unknown as Journal[]);
    }
  };

  const loadKPI = async () => {
    const { data: itemsData } = await supabase.from('items').select('good_condition, fair_condition, damaged, lost');
    const { data: txData } = await supabase
      .from('transactions')
      .select('transaction_items(quantity)')
      .eq('status', 'Dipinjam');

    const good = itemsData?.reduce((sum, i) => sum + i.good_condition, 0) || 0;
    const fair = itemsData?.reduce((sum, i) => sum + i.fair_condition, 0) || 0;
    const damaged = itemsData?.reduce((sum, i) => sum + i.damaged, 0) || 0;
    const lost = itemsData?.reduce((sum, i) => sum + i.lost, 0) || 0;
    const borrowed =
      txData?.reduce((sum, tx) => sum + (tx.transaction_items as any[]).reduce((s, ti) => s + ti.quantity, 0), 0) || 0;

    const { count } = await supabase.from('journals').select('*', { count: 'exact', head: true });

    setKpi({ good, fair, damaged, lost, borrowed, totalJournals: count || 0 });
  };

  const addJournalItem = () => {
    setJournalItems([
      ...journalItems,
      {
        tempId: crypto.randomUUID(),
        itemId: items[0]?.id || '',
        itemName: items[0]?.name || '',
        quantity: 1,
      },
    ]);
  };

  const removeJournalItem = (tempId: string) => {
    setJournalItems(journalItems.filter((item) => item.tempId !== tempId));
  };

  const updateJournalItem = (tempId: string, field: string, value: string | number) => {
    setJournalItems(
      journalItems.map((item) => {
        if (item.tempId === tempId) {
          if (field === 'itemId') {
            const selectedItem = items.find((i) => i.id === value);
            return { ...item, itemId: value as string, itemName: selectedItem?.name || '' };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const initSignaturePad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true);
      setLastPos(getPos(e));
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPos(pos);
      e.preventDefault();
    };

    const handleEnd = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart as any);
    canvas.addEventListener('touchmove', handleMove as any, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart as any);
      canvas.removeEventListener('touchmove', handleMove as any);
      canvas.removeEventListener('touchend', handleEnd);
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (journalItems.length === 0) {
      alert('Tambahkan minimal 1 alat!');
      return;
    }

    const signature = getSignatureData();

    const { data: journal, error: jrnError } = await supabase
      .from('journals')
      .insert([
        {
          date: formData.date,
          time: formData.time,
          teacher_name: formData.teacherName,
          class: formData.class,
          topic: formData.topic,
          result: formData.result,
          notes: formData.notes,
          return_date: formData.returnDate || null,
          signature,
          user_id: user?.id,
        },
      ])
      .select()
      .single();

    if (jrnError || !journal) {
      alert('Gagal menyimpan jurnal');
      return;
    }

    const jrnItems = journalItems.map((item) => ({
      journal_id: journal.id,
      item_id: item.itemId,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('journal_items').insert(jrnItems);

    if (itemsError) {
      alert('Gagal menyimpan detail jurnal');
      return;
    }

    alert('Entri jurnal berhasil disimpan!');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      teacherName: '',
      class: '',
      topic: '',
      result: '',
      notes: '',
      returnDate: '',
    });
    setJournalItems([]);
    clearSignature();
    addJournalItem();
    loadJournals();
    loadKPI();
  };

  if (!user) {
    return (
      <div className="bg-white/90 rounded-3xl shadow-xl p-8 text-center">
        <p className="text-gray-600">Silakan login untuk mengakses halaman Jurnal.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Jurnal Laboratorium</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Alat Baik</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.good}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Kurang Baik</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.fair}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Rusak</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.damaged}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Hilang</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.lost}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Dipinjam</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.borrowed}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
          <h3 className="text-xs text-gray-600 mb-1">Total Jurnal</h3>
          <p className="text-2xl font-bold text-gray-800">{kpi.totalJournals}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => exportAllData()}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition shadow-md flex items-center gap-2"
        >
          <Download size={18} />
          Ekspor Excel (Semua Sheet)
        </button>
        <button
          onClick={() => exportJournalMonthly()}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md flex items-center gap-2"
        >
          <Download size={18} />
          Ekspor Jurnal Bulanan
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Form Entri Jurnal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hari & Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mengajar</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Guru</label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                required
                placeholder="Nama guru"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                required
                placeholder="7A, 8A, 9A"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Materi / Topik</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
                placeholder="Asam-basa, fotosintesis, dll"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Alat yang Dipinjam</label>
            <div className="space-y-3">
              {journalItems.map((item) => (
                <div key={item.tempId} className="grid sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Alat</label>
                    <select
                      value={item.itemId}
                      onChange={(e) => updateJournalItem(item.tempId, 'itemId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jumlah</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateJournalItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeJournalItem(item.tempId)}
                      className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addJournalItem}
              className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah Alat
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasil Praktikum</label>
            <textarea
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              rows={3}
              placeholder="Ringkasan hasil praktikum"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Catatan kondisi alat/lab"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kembali</label>
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanda Tangan</label>
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={560}
                height={180}
                className="border border-dashed border-gray-300 rounded-xl bg-white w-full touch-none"
              />
              <button
                type="button"
                onClick={clearSignature}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
              >
                Bersihkan
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition"
            >
              Simpan ke Jurnal
            </button>
            <button
              type="reset"
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().slice(0, 5),
                  teacherName: '',
                  class: '',
                  topic: '',
                  result: '',
                  notes: '',
                  returnDate: '',
                });
                setJournalItems([]);
                clearSignature();
                addJournalItem();
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Daftar Jurnal Laboratorium</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jam</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Guru</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kelas</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Materi</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Alat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hasil</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((journal) => (
                <tr key={journal.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{journal.date}</td>
                  <td className="px-4 py-3">{journal.time}</td>
                  <td className="px-4 py-3">{journal.teacher_name}</td>
                  <td className="px-4 py-3">{journal.class}</td>
                  <td className="px-4 py-3">{journal.topic}</td>
                  <td className="px-4 py-3">
                    {journal.journal_items.map((ji, i) => (
                      <div key={i}>
                        {ji.items.name} ({ji.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3">{journal.result || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
