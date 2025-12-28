import { Link } from 'react-router-dom';
import { 
  ChefHat, Calculator, UtensilsCrossed, TrendingUp, Users, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, Shield, Zap, Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'Manajemen Resep',
      description: 'Kelola semua resep dengan mudah. Simpan bahan, komponen, dan SOP dalam satu tempat.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Kalkulasi HPP Otomatis',
      description: 'Hitung Harga Pokok Penjualan secara otomatis berdasarkan resep dan harga bahan.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: 'Menu & Bundling',
      description: 'Buat menu dan paket bundling dengan margin yang optimal untuk bisnis Anda.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Riwayat Harga',
      description: 'Lacak perubahan harga bahan baku untuk analisis dan perencanaan bisnis.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multi-tenant',
      description: 'Kelola beberapa outlet atau tim dengan sistem organisasi yang terpisah.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Dashboard Analytics',
      description: 'Lihat statistik dan insight bisnis Anda dalam dashboard yang informatif.',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Daftarkan Akun',
      description: 'Buat akun gratis dalam hitungan detik'
    },
    {
      number: '02',
      title: 'Input Bahan & Resep',
      description: 'Masukkan data bahan dan resep Anda'
    },
    {
      number: '03',
      title: 'Kelola Bisnis',
      description: 'Nikmati perhitungan otomatis dan insight bisnis'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                🍳
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                ResepKu
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/15 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Platform Manajemen Resep #1 di Indonesia
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight animate-slide-up">
            Kelola Resep & Hitung{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-400 bg-clip-text text-transparent">
              HPP Otomatis
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            ResepKu membantu bisnis kuliner mengelola resep, menghitung HPP secara otomatis, 
            dan mengoptimalkan margin keuntungan dengan mudah dan efisien.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link 
              to="/register" 
              className="group flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-xl shadow-primary-500/30 transition-all hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1"
            >
              Get Started - Gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 border-2 border-gray-200 dark:border-dark-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Login ke Akun
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-500" />
              <span>Gratis Selamanya</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              <span>Data Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-500" />
              <span>Setup 5 Menit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-white dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Fitur lengkap untuk mengelola bisnis kuliner Anda dari hulu ke hilir
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 hover:border-primary-500/30 dark:hover:border-primary-500/30 transition-all hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mulai dalam 3 Langkah Mudah
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Proses sederhana untuk memulai mengelola resep dan bisnis Anda
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-300 opacity-30" />
                )}
                
                {/* Step Number */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white text-3xl font-bold mb-6 shadow-xl shadow-primary-500/30">
                  {step.number}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-primary-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            ))}
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Siap Mengoptimalkan Bisnis Kuliner Anda?
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Bergabung dengan ribuan pebisnis kuliner yang sudah menggunakan ResepKu untuk mengelola resep dan meningkatkan profit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="group flex items-center gap-2 px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-xl hover:bg-gray-100 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              Daftar Sekarang - Gratis!
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Sudah Punya Akun? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl">
                🍳
              </div>
              <span className="text-xl font-bold text-white">ResepKu</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-gray-400">
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2024 ResepKu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
