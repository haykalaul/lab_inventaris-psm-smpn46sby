import { FlaskConical, RefreshCw, FileText, Package, BookOpen, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const tiles = [
    {
      id: 'pinjam',
      title: 'Form Peminjaman',
      desc: 'peminjaman alat',
      icon: FlaskConical,
      color: 'from-pink-100 to-pink-50',
    },
    {
      id: 'kembali',
      title: 'Form Pengembalian',
      desc: 'pengembalian alat',
      icon: RefreshCw,
      color: 'from-pink-100 to-pink-50',
    },
    {
      id: 'inventaris',
      title: 'Data Inventaris',
      desc: 'alat & bahan',
      icon: Package,
      color: 'from-blue-100 to-blue-50',
    },
    {
      id: 'jurnal',
      title: 'Jurnal Laboratorium',
      desc: 'rekap kegiatan & peminjaman',
      icon: BookOpen,
      color: 'from-blue-100 to-blue-50',
    },
    {
      id: 'elkm',
      title: 'E-LKM',
      desc: 'panduan praktikum',
      icon: FileText,
      color: 'from-pink-100 to-pink-50',
    },
    {
      id: 'teamwork',
      title: 'Teamwork',
      desc: 'about us',
      icon: Users,
      color: 'from-pink-100 to-pink-50',
    },
  ];

  return (
    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Selamat Datang, Saintis Muda 👋
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Portal Laboratorium IPA SMPN 46 Surabaya yang memudahkan pengelolaan inventaris,
          peminjaman alat, jurnal laboratorium, dan E-LKM secara modern dan realtime.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className={`bg-gradient-to-br ${tile.color} rounded-2xl p-5 text-left hover:scale-105 transition-transform shadow-lg`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center mb-3">
                  <Icon className="text-gray-700" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{tile.title}</h3>
                <p className="text-sm text-gray-600">{tile.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-3xl shadow-xl h-64 md:h-auto bg-cover bg-center"
        style={{
          backgroundImage: 'url("docs/hero1.jpeg")',
        }}
        title="Laboratorium IPA"
      />
    </div>
  );
}
