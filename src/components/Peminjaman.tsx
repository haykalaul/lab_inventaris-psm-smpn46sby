import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Item {
  id: string;
  name: string;
  good_condition: number;
  fair_condition: number;
}

interface BorrowItem {
  tempId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  condition: 'Baik' | 'Kurang Baik';
}

export function Peminjaman() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [borrowItems, setBorrowItems] = useState<BorrowItem[]>([]);
  const [formData, setFormData] = useState({
    borrowerName: '',
    class: '',
    activity: '',
    borrowDate: new Date().toISOString().split('T')[0],
    borrowTime: new Date().toTimeString().slice(0, 5),
  });

  useEffect(() => {
    loadItems();
    addBorrowItem();
  }, []);

  const loadItems = async () => {
    const { data } = await supabase.from('items').select('id, name, good_condition, fair_condition').order('name');
    if (data) setItems(data);
  };

  const addBorrowItem = () => {
    setBorrowItems([
      ...borrowItems,
      {
        tempId: crypto.randomUUID(),
        itemId: items[0]?.id || '',
        itemName: items[0]?.name || '',
        quantity: 1,
        condition: 'Baik',
      },
    ]);
  };

  const removeBorrowItem = (tempId: string) => {
    setBorrowItems(borrowItems.filter((item) => item.tempId !== tempId));
  };

  const updateBorrowItem = (tempId: string, field: string, value: string | number) => {
    setBorrowItems(
      borrowItems.map((item) => {
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

  const getAvailable = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item ? item.good_condition + item.fair_condition : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (borrowItems.length === 0) {
      alert('Tambahkan minimal 1 alat!');
      return;
    }

    for (const item of borrowItems) {
      if (item.quantity > getAvailable(item.itemId)) {
        alert(`Stok tidak cukup untuk ${item.itemName}`);
        return;
      }
    }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          borrower_name: formData.borrowerName,
          class: formData.class,
          activity: formData.activity,
          borrow_date: formData.borrowDate,
          borrow_time: formData.borrowTime,
          status: 'Dipinjam',
          user_id: user?.id,
        },
      ])
      .select()
      .single();

    if (txError || !transaction) {
      alert('Gagal menyimpan peminjaman');
      return;
    }

    const transactionItems = borrowItems.map((item) => ({
      transaction_id: transaction.id,
      item_id: item.itemId,
      quantity: item.quantity,
      borrow_condition: item.condition,
    }));

    const { error: itemsError } = await supabase.from('transaction_items').insert(transactionItems);

    if (itemsError) {
      alert('Gagal menyimpan detail peminjaman');
      return;
    }

    alert('Peminjaman berhasil disimpan!');
    setFormData({
      borrowerName: '',
      class: '',
      activity: '',
      borrowDate: new Date().toISOString().split('T')[0],
      borrowTime: new Date().toTimeString().slice(0, 5),
    });
    setBorrowItems([]);
    addBorrowItem();
  };

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Form Peminjaman</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Peminjam</label>
            <input
              type="text"
              value={formData.borrowerName}
              onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
              required
              placeholder="Nama peminjam"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              placeholder="7A, 8A, 9A"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Peminjaman</label>
            <input
              type="date"
              value={formData.borrowDate}
              onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Peminjaman</label>
            <input
              type="time"
              value={formData.borrowTime}
              onChange={(e) => setFormData({ ...formData, borrowTime: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan / Tujuan</label>
            <input
              type="text"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              placeholder="Praktikum larutan, pengamatan sel, dll"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Alat yang Dipinjam</label>
          <div className="space-y-3">
            {borrowItems.map((item) => (
              <div key={item.tempId} className="grid sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alat</label>
                  <select
                    value={item.itemId}
                    onChange={(e) => updateBorrowItem(item.tempId, 'itemId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} (tersedia: {getAvailable(i.id)})
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
                    onChange={(e) => updateBorrowItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Kondisi</label>
                  <select
                    value={item.condition}
                    onChange={(e) => updateBorrowItem(item.tempId, 'condition', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Kurang Baik">Kurang Baik</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeBorrowItem(item.tempId)}
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
            onClick={addBorrowItem}
            className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Tambah Alat
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-pink-600 hover:to-pink-700 transition"
          >
            Submit Peminjaman
          </button>
          <button
            type="reset"
            onClick={() => {
              setFormData({
                borrowerName: '',
                class: '',
                activity: '',
                borrowDate: new Date().toISOString().split('T')[0],
                borrowTime: new Date().toTimeString().slice(0, 5),
              });
              setBorrowItems([]);
              addBorrowItem();
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
