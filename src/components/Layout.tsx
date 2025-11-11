import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, FlaskConical, RefreshCw, FileText, Package, BookOpen, Users } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, currentTab, onTabChange }: LayoutProps) {
  const { signOut, user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home, public: true },
    { id: 'pinjam', label: 'Peminjaman', icon: FlaskConical, public: true },
    { id: 'kembali', label: 'Pengembalian', icon: RefreshCw, public: true },
    { id: 'elkm', label: 'E-LKM', icon: FileText, public: true },
    { id: 'inventaris', label: 'Inventaris', icon: Package, public: false },
    { id: 'jurnal', label: 'Jurnal', icon: BookOpen, public: false },
    { id: 'teamwork', label: 'Teamwork', icon: Users, public: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/90 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full shadow-lg bg-cover bg-center"
                style={{
                  backgroundImage: 'url("public/logo.png")',
                }}
              ></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  LABVENTORY • SPENFOURSIX
                </h1>
                <p className="text-xs text-gray-600">Smart Lab Management for Young Scientists</p>
              </div>
            </div>

            {user && (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-md"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isLocked = !item.public && !user;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  disabled={isLocked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition shadow-sm ${
                    currentTab === item.id
                      ? 'bg-blue-500 text-white'
                      : isLocked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                  {isLocked && <span className="text-xs">🔒</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        © {new Date().getFullYear()} Laboratorium IPA • SpenFourSix — PSM 8.0
      </footer>
    </div>
  );
}
