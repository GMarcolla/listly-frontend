import { Shield, Zap, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Trust Badge 1: Pagamentos Seguros */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Pagamentos Seguros</h3>
            <p className="text-xs text-gray-600">Transações protegidas via PIX</p>
          </div>

          {/* Trust Badge 2: Recebimento Instantâneo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Recebimento Instantâneo</h3>
            <p className="text-xs text-gray-600">Receba suas contribuições na hora</p>
          </div>

          {/* Trust Badge 3: Milhares de Usuários */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Milhares de Usuários</h3>
            <p className="text-xs text-gray-600">Confiado por casais em todo Brasil</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-xs text-gray-400">
          © 2024 Listly. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
