import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, RefreshCw, Lightbulb, Mail, ArrowLeft, Send, 
  CheckCircle2, ChevronRight, Headphones, MessageSquare,
  Sparkles, ExternalLink, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type SupportCategory = 'technical' | 'update' | 'suggestion' | 'contact' | null;

const Support = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      id: 'technical' as SupportCategory,
      icon: <Wrench className="w-8 h-8" />,
      title: 'Support Technical',
      description: 'Laporkan masalah teknis atau bug yang Anda temukan pada aplikasi.',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20 hover:border-red-500/40'
    },
    {
      id: 'update' as SupportCategory,
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Permintaan Update',
      description: 'Ajukan permintaan fitur baru atau peningkatan yang Anda butuhkan.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20 hover:border-blue-500/40'
    },
    {
      id: 'suggestion' as SupportCategory,
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Saran Aplikasi',
      description: 'Berikan saran dan ide untuk pengembangan aplikasi yang lebih baik.',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40'
    },
    {
      id: 'contact' as SupportCategory,
      icon: <Mail className="w-8 h-8" />,
      title: 'Kontak IT Developer',
      description: 'Hubungi tim developer langsung untuk pertanyaan atau kolaborasi.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20 hover:border-purple-500/40'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mailto link
    const subject = encodeURIComponent(`[${getCategoryTitle(selectedCategory)}] ${formData.subject}`);
    const body = encodeURIComponent(`Nama: ${formData.name}\nEmail: ${formData.email}\n\nPesan:\n${formData.message}`);
    window.location.href = `mailto:muhamad.irmansyah@gmail.com?subject=${subject}&body=${body}`;
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const getCategoryTitle = (category: SupportCategory) => {
    switch (category) {
      case 'technical': return 'Support Technical';
      case 'update': return 'Permintaan Update';
      case 'suggestion': return 'Saran Aplikasi';
      case 'contact': return 'Kontak IT Developer';
      default: return '';
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/welcome" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                🍳
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                ResepKu
              </span>
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                to={isAuthenticated ? "/" : "/welcome"} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
              {isAuthenticated ? (
                <Link 
                  to="/" 
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary-500/15 via-primary-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/10 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-600 dark:text-primary-400 text-sm font-medium mb-6 animate-fade-in">
            <Headphones className="w-4 h-4" />
            Pusat Bantuan & Dukungan
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight animate-slide-up">
            Bagaimana Kami Dapat{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-emerald-400 bg-clip-text text-transparent">
              Membantu Anda?
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Pilih kategori di bawah untuk mendapatkan bantuan yang Anda butuhkan. Tim kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      {!selectedCategory && (
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => category.id === 'contact' ? null : setSelectedCategory(category.id)}
                  className={`group relative p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl border ${category.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left ${category.id === 'contact' ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${category.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                        {category.icon}
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 flex items-center gap-2">
                        {category.title}
                        {category.id !== 'contact' && (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        )}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Contact Info Card */}
                      {category.id === 'contact' && (
                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg sm:rounded-xl border border-purple-500/20">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email Developer</p>
                              <a 
                                href="mailto:muhamad.irmansyah@gmail.com" 
                                className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors flex items-center gap-1 truncate"
                              >
                                <span className="truncate">muhamad.irmansyah@gmail.com</span>
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form Section */}
      {selectedCategory && !isSubmitted && (
        <section className="py-12 lg:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke menu
            </button>

            {/* Form Card */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${categories.find(c => c.id === selectedCategory)?.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {categories.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCategoryTitle(selectedCategory)}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Isi form di bawah untuk mengirim pesan
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subjek
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                    placeholder={
                      selectedCategory === 'technical' ? 'Contoh: Error saat menyimpan resep' :
                      selectedCategory === 'update' ? 'Contoh: Tambah fitur export PDF' :
                      'Contoh: Saran peningkatan UI'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pesan
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                    placeholder={
                      selectedCategory === 'technical' ? 'Jelaskan masalah yang Anda alami secara detail...' :
                      selectedCategory === 'update' ? 'Jelaskan fitur atau pembaruan yang Anda inginkan...' :
                      'Bagikan saran atau ide Anda...'
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <section className="py-12 lg:py-16">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-8 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Pesan Terkirim!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Terima kasih telah menghubungi kami. Email akan dikirim ke IT Developer dan kami akan merespons secepatnya.
              </p>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Kirim Pesan Lain
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-12 lg:py-20 bg-white dark:bg-dark-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Tips
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Bagaimana Cara Terbaik Menghubungi Kami?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Untuk mendapatkan respons yang cepat, pastikan Anda memberikan detail yang lengkap tentang pertanyaan atau masalah Anda. Sertakan tangkapan layar jika diperlukan.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-5 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <div className="text-3xl mb-3">📸</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Screenshot</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sertakan tangkapan layar untuk memperjelas masalah</p>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Detail Lengkap</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Jelaskan langkah-langkah yang menyebabkan masalah</p>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-dark-700 rounded-xl">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Respons Cepat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kami akan merespons dalam 1-2 hari kerja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/welcome" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl">
                🍳
              </div>
              <span className="text-xl font-bold text-white">ResepKu</span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6 text-gray-400">
              <Link to={isAuthenticated ? "/" : "/welcome"} className="hover:text-white transition-colors">Home</Link>
              <Link to="/support" className="hover:text-white transition-colors text-primary-400">Support</Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                  <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                </>
              )}
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

export default Support;
