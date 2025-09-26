import React from 'react';
import { PlusCircle, ShoppingCart, FileDown } from 'lucide-react';

interface HeaderProps {
    onAddExpense: () => void;
    onPurchaseAdvisor: () => void;
    onGeneratePDF: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddExpense, onPurchaseAdvisor, onGeneratePDF }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PoupaAI</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onPurchaseAdvisor}
              className="hidden sm:flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Posso Comprar?"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Posso Comprar?</span>
            </button>
            <button
              onClick={onGeneratePDF}
              className="hidden sm:flex items-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Gerar Relatório PDF"
            >
              <FileDown size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
            <button
              onClick={onAddExpense}
              className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Adicionar Nova Despesa"
            >
              <PlusCircle size={20} />
              <span className="hidden md:inline">Nova Despesa</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
