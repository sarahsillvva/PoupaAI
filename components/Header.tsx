import React from 'react';
import { ShoppingCart, FileDown } from 'lucide-react';
import { logoSrc } from '../constants';

interface HeaderProps {
    onPurchaseAdvisor: () => void;
    onGeneratePDF: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPurchaseAdvisor, onGeneratePDF }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img src={logoSrc} alt="PoupaAI Logo" className="h-32 w-auto" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="tour-purchase-advisor"
              onClick={onPurchaseAdvisor}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Posso Comprar?"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Posso Comprar?</span>
            </button>
            <button
              id="tour-pdf-report"
              onClick={onGeneratePDF}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Gerar Relatório PDF"
            >
              <FileDown size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;