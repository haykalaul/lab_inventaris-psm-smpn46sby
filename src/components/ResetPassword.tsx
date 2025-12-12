import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has access token from reset email
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked reset link
        console.log('Password recovery mode')
      }
    })
  }, [])

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) {
      return 'Password minimal 8 karakter'
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password harus mengandung huruf besar'
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password harus mengandung huruf kecil'
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password harus mengandung angka'
    }
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Validasi
    if (password !== confirmPassword) {
      setError('Password tidak cocok!')
      setLoading(false)
      return
    }

    const validationError = validatePassword(password)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('✅ Password berhasil direset! Anda akan diarahkan ke halaman login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      console.error('Reset password error:', error)
      setError(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔑</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Buat Password Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Inventaris Lab IPA SMPN 46 Surabaya
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password Baru
                </label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Masukkan password baru"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >   
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
            </div>  
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                </label>    
                <div className="relative">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Konfirmasi password baru"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >   
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
            </div>
            <button
              type="submit"
              disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            > 
                {loading ? (
                <span className="flex items-center">  
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Memproses...
                </span>
                ) : (
                '🔒 Reset Password'
                )}
            </button>
          </form>
            {message && (
                <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
                    <p className="text-sm text-green-800">{message}</p>
                </div>
            )}
            {error && (
                <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}
        </div>
        </div>
    </div>
  )
}