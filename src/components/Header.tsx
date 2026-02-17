import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">Listly</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Início
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Como Funciona
            </Link>
            <Link to="/explore" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
              Explorar Listas
            </Link>
            <Link 
              to="/login" 
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
