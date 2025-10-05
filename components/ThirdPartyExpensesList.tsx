import React, { useMemo } from 'react';
import { Expense } from '../types';
import { CATEGORIES } from '../constants';
import { Edit, Trash2, Users } from 'lucide-react';
import Card from './common/Card';

interface ThirdPartyExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ThirdPartyExpensesList: React.FC<ThirdPartyExpensesListProps> = ({ expenses, onEdit, onDelete }) => {
  const groupedExpenses = useMemo(() => {
    type GroupedData = Record<string, { expenses: Expense[], total: number }>;
    return expenses.reduce((acc: GroupedData, expense) => {
      const payer = expense.payer || 'Desconhecido';
      if (!acc[payer]) {
        acc[payer] = { expenses: [], total: 0 };
      }
      acc[payer].expenses.push(expense);
      acc[payer].total += expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  const sortedPayers = Object.entries(groupedExpenses).sort((a, b) => a[0].localeCompare(b[0]));

  if (expenses.length === 0) {
    return null; // Não renderiza o card se não houver despesas de terceiros
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <Users className="mr-2 text-purple-500"/>
            Contas de Terceiros
        </h3>
        {sortedPayers.length > 0 ? (
          <div className="space-y-6">
            {sortedPayers.map(([payer, data]) => (
              <div key={payer} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h4 className="font-bold text-md text-gray-800 dark:text-gray-200">{payer}</h4>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar</p>
                        <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)}
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sr-only">
                      <tr><th>Descrição</th><th>Valor</th><th>Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.expenses.map(expense => (
                        <tr key={expense.id}>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white">{expense.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{CATEGORIES[expense.category].name} - Vence em {new Date(expense.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                            </p>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                                <button onClick={() => onEdit(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Editar Despesa">
                                <Edit size={18} />
                                </button>
                                <button onClick={() => onDelete(expense)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Excluir Despesa">
                                <Trash2 size={18} />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa de terceiro registrada para este mês.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Ao adicionar uma nova despesa, marque a opção "Esta despesa é de um terceiro".</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ThirdPartyExpensesList;
