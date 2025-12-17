import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

// Zod schemas for validation
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/\d/, 'Password harus mengandung angka')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password harus mengandung karakter khusus'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const { signIn, signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const watchedPassword = watch('password');

  // Update password requirements based on watched password
  useEffect(() => {
    if (watchedPassword) {
      setPasswordRequirements({
        length: watchedPassword.length >= 6,
        uppercase: /[A-Z]/.test(watchedPassword),
        lowercase: /[a-z]/.test(watchedPassword),
        number: /\d/.test(watchedPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword),
      });
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [watchedPassword]);

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setError('');
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password);

      if (error) {
        setError(error.message);
      } else if (!isLogin) {
        logActivity('REGISTER', { email: data.email });
        setError('Akun berhasil dibuat! Silakan login.');
        setIsLogin(true);
        reset();
      } else {
        logActivity('LOGIN', { email: data.email });
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            LABVENTORY • SPENFOURSIX
          </h1>
          <p className="text-gray-600 text-sm">Smart Lab Management System</p>
        </div>

        <form key={isLogin ? 'login' : 'register'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="guru@smpn46sby.sch.id"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full px-4 py-2 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
            <div className="mt-2 space-y-0.5">
              <div className="flex items-center text-xs">
                {passwordRequirements.length ? '✓' : '✗'} Minimal 6 karakter
              </div>
              <div className="flex items-center text-xs">
                {passwordRequirements.uppercase ? '✓' : '✗'} Huruf besar (A-Z)
              </div>
              <div className="flex items-center text-xs">
                {passwordRequirements.lowercase ? '✓' : '✗'} Huruf kecil (a-z)
              </div>
              <div className="flex items-center text-xs">
                {passwordRequirements.number ? '✓' : '✗'} Angka (0-9)
              </div>
              <div className="flex items-center text-xs">
                {passwordRequirements.special ? '✓' : '✗'} Karakter khusus (!@#$%^&*)
              </div>
            </div>
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

        <div className="mt-4 text-center">
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

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sistem ini hanya untuk Guru dan Laboran SMPN 46 Surabaya
          </p>
        </div>
      </div>
    </div>
  );
}