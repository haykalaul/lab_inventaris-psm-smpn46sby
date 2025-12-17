import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../utils/auditLogger';

interface LKMDocument {
  id: string;
  title: string;
  class_level: '7' | '8' | '9';
  file_url: string;
  user_id: string;
  created_at: string;
}

export function ELKM() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<LKMDocument[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    classLevel: '7' as '7' | '8' | '9',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('lkm_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDocuments(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Hanya guru yang dapat mengunggah LKM. Silakan login terlebih dahulu.');
      return;
    }

    if (!file) {
      alert('Pilih file PDF terlebih dahulu!');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan!');
      return;
    }

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('lkm-files').upload(fileName, file);
    if (uploadError) {
      // eslint-disable-next-line no-console
      console.error('uploadError', uploadError);
      alert('Gagal mengunggah file: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('lkm-files').createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      // eslint-disable-next-line no-console
      console.error('signedUrlError', signedUrlError);
      alert('Gagal mendapatkan URL file: ' + signedUrlError.message);
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('lkm_documents').insert([
      {
        title: formData.title,
        class_level: formData.classLevel,
        file_url: signedUrlData.signedUrl,
        user_id: user.id,
      },
    ]);

    if (dbError) {
      // eslint-disable-next-line no-console
      console.error('dbError', dbError);
      alert('Gagal menyimpan data LKM: ' + dbError.message);
      setUploading(false);
      return;
    }

    logActivity('UPLOAD_DOCUMENT', { title: formData.title, classLevel: formData.classLevel });
    alert('LKM berhasil diunggah!');
    setFormData({ title: '', classLevel: '7' });
    setFile(null);
    setUploading(false);
    loadDocuments();
  };

  const handleDelete = async (doc: LKMDocument) => {
    if (!user || user.id !== doc.user_id) {
      alert('Anda tidak memiliki izin untuk menghapus dokumen ini.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus "${doc.title}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from('lkm-files').remove([doc.file_url.split('/').pop() || '']);
      if (storageError) {
        // eslint-disable-next-line no-console
        console.error('storageError', storageError);
        alert('Gagal menghapus file dari penyimpanan: ' + storageError.message);
        return;
      }

      // Delete from database
      const { error: dbError } = await supabase.from('lkm_documents').delete().eq('id', doc.id);
      if (dbError) {
        // eslint-disable-next-line no-console
        console.error('dbError', dbError);
        alert('Gagal menghapus data LKM: ' + dbError.message);
        return;
      }

      logActivity('DELETE_DOCUMENT', { title: doc.title, classLevel: doc.class_level });
      setNotification({ message: 'LKM sudah terhapus!', type: 'success' });
      loadDocuments();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('deleteError', error);
      alert('Terjadi kesalahan saat menghapus LKM.');
    }
  };

  const documentsByClass = {
    '7': documents.filter((doc) => doc.class_level === '7'),
    '8': documents.filter((doc) => doc.class_level === '8'),
    '9': documents.filter((doc) => doc.class_level === '9'),
  };

  return (
    <div className="bg-white/90 rounded-3xl shadow-xl p-8">
      {notification && (
        <div className={`mb-4 p-4 rounded-xl ${
          notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">E-LKM</h2>
      <p className="text-gray-600 mb-8">
        Lembar Kerja Murid (LKM) yang memandu siswa untuk melakukan praktikum, berisi petunjuk langkah kerja, tujuan,
        alat, dan bahan.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {(['7', '8', '9'] as const).map((classLevel) => (
          <div key={classLevel} className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Kelas {classLevel}</h3>
            <ul className="space-y-2">
              {documentsByClass[classLevel].length === 0 ? (
                <li className="text-gray-500 text-sm">Belum ada dokumen</li>
              ) : (
                documentsByClass[classLevel].map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline flex-1"
                    >
                      <FileText size={16} />
                      <span className="text-sm">{doc.title}</span>
                    </a>
                    {user && user.id === doc.user_id && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="ml-2 text-red-500 hover:text-red-700 p-1"
                        title="Hapus dokumen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      {user && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Upload size={24} />
            Unggah LKM Baru
          </h3>
          <p className="text-sm text-gray-600 mb-4">Hanya guru yang dapat mengunggah dokumen LKM.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul / Materi</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Contoh: Perubahan Wujud Benda"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as '7' | '8' | '9' })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">File PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
            >
              {uploading ? 'Mengunggah...' : 'Unggah LKM'}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-gray-600">Silakan login untuk mengunggah dokumen LKM.</p>
        </div>
      )}
    </div>
  );
}
