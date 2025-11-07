import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Item {
  id: string;
  name: string;
  category: 'Fisika' | 'Kimia' | 'Biologi';
  good_condition: number;
  fair_condition: number;
  damaged: number;
  lost: number;
  location: string;
}

export function Inventaris() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    category: 'Fisika' | 'Kimia' | 'Biologi';
    good_condition: number;
    fair_condition: number;
    damaged: number;
    lost: number;
    location: string;
  }>({
    id: '',
    name: '',
    category: 'Fisika',
    good_condition: 0,
    fair_condition: 0,
    damaged: 0,
    lost: 0,
    location: '',
  });

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.id) {
      const { error } = await supabase
        .from('items')
        .update({
          name: formData.name,
          category: formData.category,
          good_condition: formData.good_condition,
          fair_condition: formData.fair_condition,
          damaged: formData.damaged,
          lost: formData.lost,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.id);

      if (!error) {
        alert('Data alat berhasil diperbarui!');
      }
    } else {
      const { error } = await supabase.from('items').insert([
        {
          name: formData.name,
          category: formData.category,
          good_condition: formData.good_condition,
          fair_condition: formData.fair_condition,
          damaged: formData.damaged,
          lost: formData.lost,
          location: formData.location,
        },
      ]);

      if (!error) {
        alert('Data alat berhasil ditambahkan!');
      }
    }

    resetForm();
    loadItems();
  };

  const handleEdit = (item: Item) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      good_condition: item.good_condition,
      fair_condition: item.fair_condition,
      damaged: item.damaged,
      lost: item.lost,
      location: item.location,
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item ini?')) return;

    const { error } = await supabase.from('items').delete().eq('id', id);

    if (!error) {
      alert('Item berhasil dihapus!');
      loadItems();
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      category: 'Fisika',
      good_condition: 0,
      fair_condition: 0,
      damaged: 0,
      lost: 0,
      location: '',
    });
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const availableOf = (item: Item) => {
    return item.good_condition + item.fair_condition;
  };

  if (!user) {
    return (
      <div className="bg-white/90 rounded-3xl shadow-xl p-8 text-center">
        <p className="text-gray-600">Silakan login untuk mengakses halaman Inventaris.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Data Alat & Bahan</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari alat/bahan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Semua Kategori</option>
          <option value="Fisika">Fisika</option>
          <option value="Kimia">Kimia</option>
          <option value="Biologi">Biologi</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-8">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Baik</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kurang Baik</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rusak</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hilang</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lokasi</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tersedia</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.good_condition}</td>
                  <td className="px-4 py-3">{item.fair_condition}</td>
                  <td className="px-4 py-3">{item.damaged}</td>
                  <td className="px-4 py-3">{item.lost}</td>
                  <td className="px-4 py-3">{item.location || '-'}</td>
                  <td className="px-4 py-3 font-semibold">{availableOf(item)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={24} />
          {formData.id ? 'Perbarui Alat' : 'Tambah Alat Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Alat</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as 'Fisika' | 'Kimia' | 'Biologi' })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Fisika">Fisika</option>
              <option value="Kimia">Kimia</option>
              <option value="Biologi">Biologi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi Baik</label>
            <input
              type="number"
              min="0"
              value={formData.good_condition}
              onChange={(e) => setFormData({ ...formData, good_condition: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kondisi Kurang Baik</label>
            <input
              type="number"
              min="0"
              value={formData.fair_condition}
              onChange={(e) => setFormData({ ...formData, fair_condition: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rusak</label>
            <input
              type="number"
              min="0"
              value={formData.damaged}
              onChange={(e) => setFormData({ ...formData, damaged: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hilang</label>
            <input
              type="number"
              min="0"
              value={formData.lost}
              onChange={(e) => setFormData({ ...formData, lost: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Lemari A1, Rak B2, dll"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition shadow-md"
            >
              {formData.id ? 'Perbarui' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
