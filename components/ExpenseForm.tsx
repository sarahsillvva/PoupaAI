import React, { useState, useCallback, useEffect } from 'react';
import { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onClose: () => void;
  onSaveAdd: (expense: Omit<Expense, 'id'>) => void;
  onSaveEdit: (expense: Expense) => void;
  expenseToEdit: Expense | null;
}

const suggestCategoryLocal = (description: string): Category => {
    const lowerDesc = description.toLowerCase();
    if (/(aluguel|luz|água|internet|condomínio|gás)/.test(lowerDesc)) return Category.FIXED_COSTS;
    if (/(supermercado|feira|padaria|transporte|gasolina)/.test(lowerDesc)) return Category.COMFORT;
    if (/(restaurante|bar|cinema|show|festa|viagem curta|ifood)/.test(lowerDesc)) return Category.PLEASURES;
    if (/(curso|livro|workshop|palestra)/.test(lowerDesc)) return Category.KNOWLEDGE;
    if (/(aporte|investimento|tesouro|cdb|ações|fii)/.test(lowerDesc)) return Category.INVESTMENTS;
    if (/(viagem|carro|casa|reforma|meta)/.test(lowerDesc)) return Category.GOALS;
    return Category.UNCATEGORIZED;
};


const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, onSaveAdd, onSaveEdit, expenseToEdit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>(Category.UNCATEGORIZED);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [installmentsTotal, setInstallmentsTotal] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!expenseToEdit;

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDueDate(expenseToEdit.dueDate);
      setInstallmentsTotal(expenseToEdit.installments?.total.toString() || '1');
      setIsRecurring(expenseToEdit.recurrence === 'monthly');
    }
  }, [expenseToEdit]);

  const handleDescriptionBlur = useCallback(() => {
    if (name.trim().length > 3 && !isEditing) { // Only suggest for new expenses
      const suggested = suggestCategoryLocal(name);
      setCategory(suggested);
    }
  }, [name, isEditing]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    if (isEditing && expenseToEdit) {
      const updatedExpense: Expense = {
        ...expenseToEdit,
        name,
        amount: parseFloat(amount),
        category,
        dueDate,
        recurrence: isRecurring ? 'monthly' : undefined,
      };
      onSaveEdit(updatedExpense);
    } else {
      const expenseData: Omit<Expense, 'id'> = {
        name,
        amount: parseFloat(amount),
        category,
        dueDate,
        recurrence: isRecurring ? 'monthly' : undefined,
      };
      const totalInstallments = parseInt(installmentsTotal, 10);
      if (totalInstallments > 1) {
        expenseData.installments = {
          current: 1,
          total: totalInstallments
        };
      }
      onSaveAdd(expenseData);
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative max-h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleDescriptionBlur}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                step="0.01"
              />
            </div>
             <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vencimento</label>
                <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
            <div>
                <label htmlFor="installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº de Parcelas</label>
                <input
                type="number"
                id="installments"
                value={installmentsTotal}
                onChange={(e) => setInstallmentsTotal(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                disabled={isEditing}
                />
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Gasto Mensal Recorrente
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : `Salvar ${isEditing ? 'Alterações' : 'Despesa'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;