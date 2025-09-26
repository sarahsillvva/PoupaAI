import React, { useState, useMemo } from 'react';
import { Expense, Category, CategoryInfo } from '../types';
import { CATEGORIES } from '../constants';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface PurchaseAdvisorProps {
  onClose: () => void;
  totalAmount: number;
  currentExpenses: Expense[];
  categoryConfig: Record<Category, CategoryInfo>;
}

type Result = {
    status: 'yes' | 'no' | 'none';
    message: string;
}

const formatToCurrency = (value: number): string => {
  if (value === 0) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parseFromCurrency = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  return parseFloat(digitsOnly) / 100;
};


const PurchaseAdvisor: React.FC<PurchaseAdvisorProps> = ({ onClose, totalAmount, currentExpenses, categoryConfig }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.UNCATEGORIZED);
  const [result, setResult] = useState<Result>({status: 'none', message: ''});

  const categorySpending = useMemo(() => {
    // FIX: Use a generic argument for reduce to ensure the result is correctly typed as Record<string, number>.
    // This prevents potential runtime errors by ensuring `currentSpent` is a number before arithmetic operations.
    return currentExpenses.reduce<Record<string, number>>((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});
  }, [currentExpenses]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFromCurrency(value);
    setAmount(formatToCurrency(numericValue));
  };

  const handleCheck = () => {
    // FIX: Corrected typo in function name from parseFromcurrency to parseFromCurrency.
    const purchaseAmount = parseFromCurrency(amount);
    if (!name || purchaseAmount <= 0 || category === Category.UNCATEGORIZED) {
        setResult({status: 'no', message: "Por favor, preencha todos os campos com valores válidos."});
        return;
    }
    
    const categoryInfo = categoryConfig[category];
    const categoryTarget = categoryInfo.target;
    const categoryBudget = totalAmount * categoryTarget;
    const currentSpent = categorySpending[category] || 0;
    const availableBudget = categoryBudget - currentSpent;
    
    if (purchaseAmount <= availableBudget) {
        setResult({
            status: 'yes', 
            message: `Sim! Você tem ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableBudget)} de saldo para ${categoryInfo.name} este mês.`
        });
    } else {
        const needed = purchaseAmount - availableBudget;
        setResult({
            status: 'no',
            message: `Não. Esta compra excede seu orçamento para ${categoryInfo.name} em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(needed)}. Considere esperar ou reajustar seus gastos.`
        });
    }
  };
  
  const ResultDisplay = () => {
    if (result.status === 'none') return null;
    const isYes = result.status === 'yes';
    const bgColor = isYes ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900';
    const textColor = isYes ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
    const Icon = isYes ? CheckCircle : XCircle;

    return (
        <div className={`p-4 rounded-md mt-4 ${bgColor} ${textColor} flex items-center gap-3`}>
            <Icon size={24} />
            <p>{result.message}</p>
        </div>
    )
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300" >Posso Fazer Essa Compra?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="purchase-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">O que você quer comprar?</label>
            <input
              type="text"
              id="purchase-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchase-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor</label>
              <input
                type="text"
                inputMode="decimal"
                id="purchase-amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="R$ 0,00"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
             <div>
                {/* FIX: Corrected typo in closing tag from glabel to label */}
                <label htmlFor="purchase-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select
                id="purchase-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                >
                {Object.entries(categoryConfig).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <ResultDisplay />

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleCheck}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Verificar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAdvisor;