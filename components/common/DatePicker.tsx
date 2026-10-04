import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
};

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string) => parseDate(value).toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DatePicker: React.FC<DatePickerProps> = ({ id, value, onChange, hasError = false }) => {
  const selectedDate = useMemo(() => parseDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !calendarRef.current?.contains(target)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, selectedDate]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: lastDay }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [visibleMonth]);

  const chooseDate = (date: Date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  const today = new Date();
  const isSameDay = (first: Date, second: Date) => toDateValue(first) === toDateValue(second);

  return (
    <div ref={containerRef} className="relative mt-1">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-gray-900 shadow-sm transition hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
      >
        <span className="capitalize">{formatDate(value)}</span>
        <CalendarDays size={19} className="text-indigo-500 dark:text-indigo-300" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 pointer-events-none">
        <div ref={calendarRef} role="dialog" aria-modal="true" aria-label="Escolher data" className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() - 1, 1))} aria-label="Mês anterior" className="rounded-full p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <ChevronLeft size={20} />
            </button>
            <p className="font-semibold text-gray-900 dark:text-white">{MONTHS[visibleMonth.getMonth()]} <span className="text-indigo-600 dark:text-indigo-300">{visibleMonth.getFullYear()}</span></p>
            <button type="button" onClick={() => setVisibleMonth(date => new Date(date.getFullYear(), date.getMonth() + 1, 1))} aria-label="Próximo mês" className="rounded-full p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="pb-2 text-xs font-semibold text-gray-400">{day}</span>)}
            {days.map((date, index) => date ? (
              <button
                key={toDateValue(date)}
                type="button"
                onClick={() => chooseDate(date)}
                aria-label={date.toLocaleDateString('pt-BR')}
                aria-pressed={isSameDay(date, selectedDate)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                  isSameDay(date, selectedDate)
                    ? 'bg-gradient-to-r from-violet-600 to-pink-500 font-semibold text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {date.getDate()}
                {isSameDay(date, today) && !isSameDay(date, selectedDate) && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-500" />}
              </button>
            ) : <span key={`empty-${index}`} />)}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-3 text-center dark:border-gray-700">
            <button type="button" onClick={() => chooseDate(today)} className="rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-gray-700">Selecionar hoje</button>
          </div>
        </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default DatePicker;
