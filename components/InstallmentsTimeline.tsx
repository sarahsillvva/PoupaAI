
import React, { useMemo } from 'react';
import { Expense } from '../types';
import Card from './common/Card';
import { CalendarClock } from 'lucide-react';

interface InstallmentsTimelineProps {
  allExpenses: Expense[];
}

const InstallmentsTimeline: React.FC<InstallmentsTimelineProps> = ({ allExpenses }) => {
  const futureInstallments = useMemo(() => {
    const now = new Date();
    // Set to start of today for comparison
    now.setHours(0, 0, 0, 0);

    return allExpenses
      .filter(expense => {
        const dueDate = new Date(expense.dueDate);
        return expense.installments && dueDate >= now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 10); // Limit to next 10 for brevity
  }, [allExpenses]);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <CalendarClock className="mr-2" />
            Próximas Parcelas
        </h3>
        {futureInstallments.length > 0 ? (
          <ul className="space-y-3">
            {futureInstallments.map(expense => (
              <li key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div>
                  <p className="font-semibold">{expense.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vencimento: {new Date(expense.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  </p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                    </p>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium px-2 py-0.5 rounded-full">
                        {expense.installments?.current}/{expense.installments?.total}
                    </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mt-4">Nenhuma parcela futura encontrada.</p>
        )}
      </div>
    </Card>
  );
};

export default InstallmentsTimeline;
