import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else if (!isLogin) {
        setError('Akun berhasil dibuat! Silakan login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            LABVENTORY • SPENFOURSIX
          </h1>
          <p className="text-gray-600 text-sm">Smart Lab Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="guru@smpn46sby.sch.id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={`p-3 rounded-xl text-sm ${error.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isLogin ? 'Login' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sistem ini hanya untuk Guru dan Laboran SMPN 46 Surabaya
          </p>
        </div>
      </div>
    </div>
  );
}
