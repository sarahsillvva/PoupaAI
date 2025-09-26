import React from 'react';
import { X, Info } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface BudgetSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalIncome: number;
}

const BudgetSuggestionModal: React.FC<BudgetSuggestionModalProps> = ({ isOpen, onClose, totalIncome }) => {
  if (!isOpen) {
    return null;
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Info className="text-blue-500 mr-3" />
            Sugestão de Orçamento
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
                Com base no seu valor disponível de <strong>{formatCurrency(totalIncome)}</strong>, aqui está uma sugestão de como distribuir seus gastos seguindo o método do Investidor Sardinha. Use isso como um guia para categorizar suas despesas.
            </p>
            <ul className="space-y-3">
                {Object.entries(CATEGORIES).filter(([key]) => key !== Category.UNCATEGORIZED && CATEGORIES[key as Category].target > 0).map(([key, info]) => (
                    <li key={key} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="w-5 h-5 rounded-full mr-3" style={{ backgroundColor: info.color }}></div>
                        <div className="flex-1">
                            <p className="font-semibold">{info.name} ({(info.target * 100).toFixed(0)}%)</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(totalIncome * info.target)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSuggestionModal;
