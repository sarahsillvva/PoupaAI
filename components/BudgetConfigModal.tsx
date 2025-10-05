import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { Category, CategoryInfo } from '../types';
import { CATEGORIES } from '../constants';
import type { CategoryTargets } from '../services/apiService';

interface BudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (targets: CategoryTargets) => void;
  onReset: () => void;
  currentConfig: Record<Category, CategoryInfo>;
}

const editableCategories = Object.entries(CATEGORIES)
    .filter(([key, info]) => key !== Category.UNCATEGORIZED && info.target > 0)
    .map(([key]) => key as Category);

const BudgetConfigModal: React.FC<BudgetConfigModalProps> = ({ isOpen, onClose, onSave, onReset, currentConfig }) => {
  const [targets, setTargets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
        const initialTargets: Record<string, string> = {};
        editableCategories.forEach(key => {
            initialTargets[key] = (currentConfig[key].target * 100).toString();
        });
        setTargets(initialTargets);
    }
  }, [isOpen, currentConfig]);

  const total = useMemo(() => {
    // FIX: Explicitly type the accumulator and value in the reduce function to prevent type errors.
    return Object.values(targets).reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0);
  }, [targets]);

  const handleTargetChange = (category: Category, value: string) => {
    // Allow empty string or numbers up to 100
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 100)) {
        setTargets(prev => ({ ...prev, [category]: value }));
    }
  };
  
  const handleSave = () => {
    if (Math.round(total) !== 100) {
        alert('A soma das porcentagens deve ser exatamente 100%.');
        return;
    }
    const newConfigForSave: CategoryTargets = {};
    // FIX: Explicitly type the destructured key and value to prevent type errors.
    Object.entries(targets).forEach(([key, value]: [string, string]) => {
        newConfigForSave[key as Category] = { target: (parseFloat(value) || 0) / 100 };
    });
    onSave(newConfigForSave);
  };
  
  const handleReset = () => {
    onReset();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="text-indigo-500 mr-3" />
            Configurar Metas de Orçamento
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3 text-sm">
                        A porcentagem sugerida é a mais recomendada. Antes de alterar, sugerimos a leitura deste artigo: 
                        <a href="https://investidorsardinha.r7.com/opiniao/os-maiores-erros-do-seu-controle-financeiro-custos-fixos/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-yellow-700 dark:hover:text-yellow-100"> "Os maiores erros do seu controle financeiro"</a>.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {editableCategories.map(key => (
                    <div key={key} className="flex items-center">
                        <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: currentConfig[key].color }}></span>
                        <label htmlFor={`target-${key}`} className="w-32 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {currentConfig[key].name}
                        </label>
                        <div className="relative flex-grow">
                             <input
                                type="text"
                                id={`target-${key}`}
                                value={targets[key] || ''}
                                onChange={(e) => handleTargetChange(key, e.target.value)}
                                className="w-full pl-3 pr-8 py-2 text-right bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                             />
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-4 text-center font-bold text-lg p-2 rounded-md ${Math.round(total) === 100 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                Total: {total.toFixed(2)}%
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-lg">
           <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw size={16} />
            Restaurar Padrão
          </button>
          <div className="flex w-full sm:w-auto justify-end gap-3">
             <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                Cancelar
            </button>
            <button
                type="button"
                onClick={handleSave}
                disabled={Math.round(total) !== 100}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Salvar Metas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetConfigModal;