import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
  viewDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ viewDate, onPreviousMonth, onNextMonth }) => {
  const monthYearString = viewDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC', // Use UTC to avoid timezone shifts affecting month display
  });
  const capitalizedMonthYear = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <button
        onClick={onPreviousMonth}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Mês Anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
        {capitalizedMonthYear}
      </h2>
      <button
        onClick={onNextMonth}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Próximo Mês"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default MonthNavigator;
