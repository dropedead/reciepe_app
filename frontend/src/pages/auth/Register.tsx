/// <reference path="../../types/google.d.ts" />
import { useState, FormEvent, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Zap, Shield, Clock } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google Sign-In Component with Recommendation Badge using renderButton
const GoogleSignUp = ({ onSuccess, onError }: { onSuccess: (credential: string) => void; onError: (error: string) => void }) => {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => onError('Gagal memuat Google Sign-In');
    document.head.appendChild(script);
  }, [onError]);

  // Initialize and render button
  useEffect(() => {
    if (!googleLoaded || !window.google || !GOOGLE_CLIENT_ID || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onError('Gagal mendapatkan kredensial Google');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 360,
      text: 'signup_with',
      shape: 'rectangular',
    });
  }, [googleLoaded, onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-4">
      {/* Recommendation Badge */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            Direkomendasikan
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <Clock size={12} />
            <span>Daftar dalam hitungan detik</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <Shield size={12} />
            <span>Tidak perlu mengingat password baru</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle size={12} />
            <span>Email langsung terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Google Sign-Up Button (rendered by Google) */}
      <div ref={buttonRef} className="w-full flex justify-center"></div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-dark-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-dark-800 text-gray-500 dark:text-dark-400">
            atau daftar dengan email
          </span>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, googleLogin, refreshUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(email, password, name);
      await refreshUser();
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await googleLogin(credential);
      await refreshUser();
      
      // Check if user needs onboarding
      if (!result.user.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal masuk dengan Google');
    } finally {
      setIsLoading(false);
    }
  }, [googleLogin, refreshUser, navigate]);

  const handleGoogleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
  }, []);

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 'weak', text: 'Lemah', color: 'bg-red-500', width: 'w-1/3' };
    if (password.length < 10) return { level: 'medium', text: 'Sedang', color: 'bg-amber-500', width: 'w-2/3' };
    return { level: 'strong', text: 'Kuat', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary-600/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow">
              🍳
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buat Akun</h1>
            <p className="text-gray-500 dark:text-dark-400">Daftar untuk mulai mengelola resep Anda</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6 animate-slide-down">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-Up with Recommendation */}
          <GoogleSignUp onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                  autoComplete="name"
                  className="input pl-11"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                  autoComplete="email"
                  className="input pl-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  autoComplete="new-password"
                  className="input pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-dark-400 
                             hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password Strength */}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <span className={`text-xs ${
                    strength.level === 'weak' ? 'text-red-400' :
                    strength.level === 'medium' ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  autoComplete="new-password"
                  className={`input pl-11 pr-12 ${
                    passwordsMatch ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''
                  }`}
                />
                {passwordsMatch && (
                  <CheckCircle size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                'Daftar dengan Email'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700 text-center">
            <p className="text-gray-500 dark:text-dark-400">
              Sudah punya akun?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

