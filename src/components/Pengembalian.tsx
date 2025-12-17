import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  borrower_name: string;
  class: string;
  borrow_date: string;
  borrow_time: string;
  transaction_items: Array<{
    id: string;
    item_id: string;
    quantity: number;
    items: {
      name: string;
    };
  }>;
}

interface ReturnItem {
  id: string;
  itemName: string;
  borrowedQty: number;
  returnQty: number;
  returnCondition: 'Baik' | 'Kurang Baik' | 'Rusak' | 'Hilang';
}

export function Pengembalian() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnTime, setReturnTime] = useState(new Date().toTimeString().slice(0, 5));

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (selectedTxId) {
      buildReturnItems();
    }
  }, [selectedTxId]);

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(
        `
        id,
        borrower_name,
        class,
        borrow_date,
        borrow_time,
        transaction_items (
          id,
          item_id,
          quantity,
          items (name)
        )
      `
      )
      .eq('status', 'Dipinjam')
      .order('borrow_date', { ascending: false });

    if (data) {
      setTransactions(data as unknown as Transaction[]);
      if (data.length > 0) {
        setSelectedTxId(data[0].id);
      }
    }
  };

  const buildReturnItems = () => {
    const tx = transactions.find((t) => t.id === selectedTxId);
    if (!tx) {
      setReturnItems([]);
      return;
    }

    const items: ReturnItem[] = tx.transaction_items.map((ti) => ({
      id: ti.id,
      itemName: ti.items.name,
      borrowedQty: ti.quantity,
      returnQty: ti.quantity,
      returnCondition: 'Baik',
    }));

    setReturnItems(items);
  };

  const updateReturnItem = (id: string, field: string, value: number | string) => {
    setReturnItems(
      returnItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tx = transactions.find((t) => t.id === selectedTxId);
    if (!tx) return;

    for (const item of returnItems) {
      const { error: updateError } = await supabase
        .from('transaction_items')
        .update({ return_condition: item.returnCondition })
        .eq('id', item.id);

      if (updateError) {
        alert('Gagal memperbarui kondisi alat');
        return;
      }

      const txItem = tx.transaction_items.find((ti) => ti.id === item.id);
      if (!txItem) continue;

      const { data: currentItem } = await supabase
        .from('items')
        .select('good_condition, fair_condition, damaged, lost')
        .eq('id', txItem.item_id)
        .single();

      if (!currentItem) continue;

      let updates: Record<string, number> = {};

      if (item.returnCondition === 'Baik') {
        updates.good_condition = currentItem.good_condition + item.returnQty;
      } else if (item.returnCondition === 'Kurang Baik') {
        updates.fair_condition = currentItem.fair_condition + item.returnQty;
      } else if (item.returnCondition === 'Rusak') {
        updates.damaged = currentItem.damaged + item.returnQty;
      } else if (item.returnCondition === 'Hilang') {
        updates.lost = currentItem.lost + item.returnQty;
      }

      await supabase.from('items').update(updates).eq('id', txItem.item_id);
    }

    const { error: txUpdateError } = await supabase
      .from('transactions')
      .update({
        status: 'Dikembalikan',
        return_date: returnDate,
        return_time: returnTime,
      })
      .eq('id', selectedTxId);

    if (txUpdateError) {
      alert('Gagal memperbarui status transaksi');
      return;
    }

    logActivity('RETURN_ITEMS', { transactionId: selectedTxId, borrowerName: tx.borrower_name, class: tx.class, returnDate, returnTime, items: returnItems });
    alert('Pengembalian berhasil dicatat!');
    loadTransactions();
    setReturnItems([]);
  };

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Form Pengembalian</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Transaksi Dipinjam</label>
            <select
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {transactions.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.borrower_name} • {tx.class || ''} • {tx.borrow_date} {tx.borrow_time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengembalian</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Pengembalian</label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Detail Alat Dikembalikan</label>
          {returnItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada transaksi aktif.</p>
          ) : (
            <div className="space-y-3">
              {returnItems.map((item) => (
                <div key={item.id} className="grid sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Alat</label>
                    <input
                      type="text"
                      value={item.itemName}
                      disabled
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jumlah Dikembalikan</label>
                    <input
                      type="number"
                      min="0"
                      max={item.borrowedQty}
                      value={item.returnQty}
                      onChange={(e) => updateReturnItem(item.id, 'returnQty', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Kondisi saat Kembali</label>
                    <select
                      value={item.returnCondition}
                      onChange={(e) => updateReturnItem(item.id, 'returnCondition', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    >
                      <option value="Baik">Baik</option>
                      <option value="Kurang Baik">Kurang Baik</option>
                      <option value="Rusak">Rusak</option>
                      <option value="Hilang">Hilang</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={returnItems.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50"
          >
            Submit Pengembalian
          </button>
          <button
            type="reset"
            onClick={() => {
              setReturnDate(new Date().toISOString().split('T')[0]);
              setReturnTime(new Date().toTimeString().slice(0, 5));
              buildReturnItems();
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
