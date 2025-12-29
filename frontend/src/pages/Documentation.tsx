import { useState } from 'react';
import { 
  Book, 
  Home, 
  ChefHat, 
  Database, 
  Tag, 
  Users, 
  User, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Package,
  Calculator,
  History,
  Scale,
  Gift,
  UserPlus,
  Building2,
  Edit2,
  Key,
  Search
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Memulai',
      icon: <Home size={18} />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🏠 Selamat Datang di ResepKu!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aplikasi ini membantu Anda mengelola resep, menu, dan menghitung HPP (Harga Pokok Penjualan) untuk bisnis kuliner Anda.
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Langkah Pertama Setelah Login
            </h3>
            <div className="space-y-3">
              {[
                { step: 1, text: 'Buat Organisasi - Masukkan nama bisnis Anda' },
                { step: 2, text: 'Tambah Bahan Baku - Input bahan-bahan yang sering digunakan' },
                { step: 3, text: 'Buat Resep - Kombinasikan bahan menjadi resep' },
                { step: 4, text: 'Buat Menu - Tentukan menu dan harga jualnya' },
                { step: 5, text: 'Lihat HPP - Sistem otomatis menghitung HPP dan profit margin' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'menu-lab',
      title: 'Menu Lab',
      icon: <ChefHat size={18} />,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🍳 Menu Lab
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola menu dan resep bisnis kuliner Anda.
            </p>
          </div>

          {/* Membuat Menu */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              Membuat Menu Baru
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka <strong>Menu Lab → Menu</strong></li>
              <li>Klik tombol <strong>"+ Tambah Menu"</strong></li>
              <li>Isi Nama Menu, Harga Jual, dan Kategori</li>
              <li>Pilih Resep yang menjadi komposisi menu</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <Lightbulb size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tips:</strong> HPP menu otomatis terhitung dari resep yang digunakan!
              </p>
            </div>
          </div>

          {/* Membuat Resep */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChefHat size={20} className="text-orange-500" />
              Membuat Resep Baru
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka <strong>Menu Lab → Resep</strong></li>
              <li>Klik <strong>"+ Tambah Resep"</strong></li>
              <li>Isi Nama Resep dan Jumlah Porsi</li>
              <li>Tambahkan bahan-bahan dengan kuantitasnya</li>
              <li>(Opsional) Tambahkan SOP atau link video tutorial</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
              <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Tips:</strong> Resep bisa menggunakan resep lain sebagai komponen (misal: "Bumbu Dasar" dalam resep "Nasi Goreng")
              </p>
            </div>
          </div>

          {/* Kalkulator HPP */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator size={20} className="text-green-500" />
              Kalkulator HPP
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fitur untuk melihat breakdown biaya dari setiap menu, termasuk HPP, harga jual, dan profit margin.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'master-data',
      title: 'Master Data',
      icon: <Database size={18} />,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📦 Master Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola data dasar seperti bahan baku, satuan, dan kategori.
            </p>
          </div>

          {/* Bahan Baku */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              Menambah Bahan Baku
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka <strong>Master Data → Bahan Baku</strong></li>
              <li>Klik <strong>"+ Tambah Bahan"</strong></li>
              <li>Isi informasi pembelian</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-600">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Field</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Contoh</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    <td className="py-2 px-3">Nama</td>
                    <td className="py-2 px-3">Daging Ayam</td>
                    <td className="py-2 px-3">Nama bahan</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    <td className="py-2 px-3">Satuan Beli</td>
                    <td className="py-2 px-3">kg</td>
                    <td className="py-2 px-3">Satuan saat beli</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    <td className="py-2 px-3">Harga Beli</td>
                    <td className="py-2 px-3">Rp 35.000</td>
                    <td className="py-2 px-3">Harga per satuan beli</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Satuan Pakai</td>
                    <td className="py-2 px-3">gram</td>
                    <td className="py-2 px-3">Satuan di resep</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Satuan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Scale size={20} className="text-blue-500" />
              Mengelola Satuan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Satuan yang sudah tersedia:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Berat', items: 'kg, gram, ons' },
                { label: 'Volume', items: 'liter, ml' },
                { label: 'Jumlah', items: 'pcs, lusin, pack' },
              ].map(group => (
                <div key={group.label} className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{group.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.items}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Riwayat Harga */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History size={20} className="text-purple-500" />
              Riwayat Harga
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fitur untuk mencatat perubahan harga bahan dari waktu ke waktu. Anda dapat melihat grafik tren harga dan mencatat supplier.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'promotions',
      title: 'Promosi',
      icon: <Tag size={18} />,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Promosi / Menu Bundling
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Buat paket promo menarik dengan kombinasi beberapa menu.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift size={20} className="text-pink-500" />
              Tipe Promosi yang Tersedia
            </h3>
            <div className="grid gap-3">
              {[
                { type: 'Buy 1 Get 1', desc: 'Beli 1 gratis 1', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
                { type: 'Buy 2 Get 1', desc: 'Beli 2 gratis 1', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
                { type: 'Diskon %', desc: 'Potongan persentase', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
                { type: 'Diskon Nominal', desc: 'Potongan rupiah tetap', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
                { type: 'Harga Paket', desc: 'Harga tetap untuk bundle', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
              ].map(promo => (
                <div key={promo.type} className={`rounded-lg p-3 ${promo.color}`}>
                  <p className="font-medium">{promo.type}</p>
                  <p className="text-sm opacity-80">{promo.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cara Membuat Paket Promo
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka <strong>Promosi → Perencanaan Promo</strong></li>
              <li>Klik <strong>"+ Buat Promo"</strong></li>
              <li>Pilih tipe promo yang diinginkan</li>
              <li>Pilih menu yang masuk dalam bundle</li>
              <li>Atur periode promo (opsional)</li>
              <li>Lihat kalkulasi HPP dan profit</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'team',
      title: 'Manajemen Tim',
      icon: <Users size={18} />,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              👥 Manajemen Tim
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola anggota tim dan organisasi Anda.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserPlus size={20} className="text-primary-500" />
              Mengundang Anggota Baru
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka <strong>Manajemen Tim</strong></li>
              <li>Klik <strong>"Undang Anggota"</strong></li>
              <li>Masukkan email anggota</li>
              <li>Pilih role: Admin atau Member</li>
              <li>Klik <strong>"Kirim Undangan"</strong></li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Role & Hak Akses
            </h3>
            <div className="grid gap-3">
              {[
                { role: 'Owner', access: 'Full access, kelola anggota, hapus organisasi', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
                { role: 'Admin', access: 'Full access data, undang anggota', color: 'bg-blue-100 dark:bg-blue-900/30' },
                { role: 'Member', access: 'Read & write data, tidak bisa kelola tim', color: 'bg-gray-100 dark:bg-gray-700/50' },
              ].map(item => (
                <div key={item.role} className={`rounded-lg p-4 ${item.color}`}>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.access}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={20} className="text-green-500" />
              Mengganti Organisasi
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Jika Anda tergabung di beberapa organisasi, klik dropdown organisasi di bagian atas navbar untuk berpindah.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: <User size={18} />,
      content: (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              👤 Profil Saya
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola informasi akun Anda.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit2 size={20} className="text-primary-500" />
              Edit Profil
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Klik nama Anda di pojok kanan atas</li>
              <li>Pilih <strong>"Profil"</strong></li>
              <li>Klik <strong>"Edit"</strong></li>
              <li>Ubah nama, email, atau foto profil</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
              <Lightbulb size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Catatan:</strong> Mengubah email memerlukan verifikasi ulang.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key size={20} className="text-orange-500" />
              Ganti Password
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
              <li>Buka halaman Profil</li>
              <li>Klik <strong>"Ganti Password"</strong></li>
              <li>Masukkan password lama dan password baru</li>
              <li>Klik <strong>"Simpan"</strong></li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <HelpCircle size={18} />,
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ❓ FAQ (Pertanyaan Umum)
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'faq-1',
                question: 'HPP saya menunjukkan angka 0?',
                answer: 'Pastikan harga beli bahan sudah diisi dengan benar di Master Data → Bahan Baku. Periksa juga konversi satuan dan yield percentage.',
              },
              {
                id: 'faq-2',
                question: 'Bagaimana cara menghapus bahan?',
                answer: 'Bahan yang masih digunakan di resep tidak bisa dihapus. Hapus dulu bahan tersebut dari semua resep yang menggunakannya, baru kemudian hapus bahannya.',
              },
              {
                id: 'faq-3',
                question: 'Kenapa saya tidak bisa lihat data organisasi lain?',
                answer: 'Setiap organisasi memiliki data yang terpisah untuk keamanan. Anda perlu diundang oleh admin organisasi tersebut untuk dapat mengakses datanya.',
              },
              {
                id: 'faq-4',
                question: 'Bagaimana cara keluar dari organisasi?',
                answer: 'Buka Profil → bagian Organisasi Saya → klik ikon keluar di samping nama organisasi. Catatan: Owner tidak bisa keluar dari organisasi yang dibuatnya.',
              },
              {
                id: 'faq-5',
                question: 'Apa itu komponen resep?',
                answer: 'Komponen resep adalah resep lain yang digunakan sebagai bahan dalam resep utama. Contoh: Resep "Nasi Goreng Spesial" menggunakan komponen "Bumbu Dasar Merah".',
              },
              {
                id: 'faq-6',
                question: 'Bagaimana cara menghitung profit margin?',
                answer: 'Profit margin dihitung otomatis dengan rumus: ((Harga Jual - HPP) / Harga Jual) x 100%. Semakin tinggi persentasenya, semakin besar keuntungan Anda.',
              },
            ].map(faq => (
              <div 
                key={faq.id}
                className="border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 py-3 text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
          <Book size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panduan Pengguna</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Pelajari cara menggunakan ResepKu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari topik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {currentSection?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
