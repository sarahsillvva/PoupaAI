import { Expense } from '../types';
import { CATEGORIES } from '../constants';

declare const jspdf: any;

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

export const generatePDF = (totalAmount: number, expenses: Expense[]) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalExpenses = currentMonthExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalAmount - totalExpenses;

  // --- Header ---
  doc.setFontSize(20);
  doc.text('Relatório Financeiro Mensal', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: 'center' });

  let y = 40;

  // --- Summary ---
  doc.setFontSize(16);
  doc.text('Resumo do Mês', 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`Valor Disponível: ${formatCurrency(totalAmount)}`, 14, y);
  y += 7;
  doc.text(`Total de Gastos: ${formatCurrency(totalExpenses)}`, 14, y);
  y += 7;
  doc.text(`Saldo Final: ${formatCurrency(balance)}`, 14, y);
  y += 12;

  // --- Expenses List ---
  if (currentMonthExpenses.length > 0) {
    doc.setFontSize(16);
    doc.text('Despesas do Mês', 14, y);
    y += 8;
    doc.autoTable({
      startY: y,
      head: [['Descrição', 'Categoria', 'Vencimento', 'Valor']],
      body: currentMonthExpenses.map(e => [
        e.name,
        CATEGORIES[e.category].name,
        formatDate(e.dueDate),
        { content: formatCurrency(e.amount), styles: { halign: 'right' } }
      ]),
      theme: 'striped',
      headStyles: { fillColor: [75, 85, 99] }
    });
    y = doc.autoTable.previous.finalY + 10;
  }
  
  // --- Future Payments ---
  const futurePayments = expenses.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    const isFutureInstallment = expense.installments && (expenseDate.getMonth() > currentMonth || expenseDate.getFullYear() > currentYear);
    const isRecurringForNextMonth = expense.recurrence === 'monthly';
    return isFutureInstallment || isRecurringForNextMonth;
  });
  
  const nextMonthPayments = futurePayments.map(e => {
     let name = e.name;
     if (e.installments) {
         name += ` (${e.installments.current}/${e.installments.total})`;
     }
     const dueDate = new Date(e.dueDate);
     if (e.recurrence === 'monthly') {
         dueDate.setMonth(nextMonth);
         dueDate.setFullYear(nextMonthYear);
     }
     return { ...e, name, dueDate: dueDate.toISOString().split('T')[0] };
  }).filter(e => {
    const d = new Date(e.dueDate);
    return d.getMonth() === nextMonth && d.getFullYear() === nextMonthYear;
  });

  if(nextMonthPayments.length > 0) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.text('Pagamentos Programados para o Próximo Mês', 14, y);
    y += 8;
    doc.autoTable({
      startY: y,
      head: [['Descrição', 'Vencimento Previsto', 'Valor']],
      body: nextMonthPayments.map(e => [
        e.name,
        formatDate(e.dueDate),
        { content: formatCurrency(e.amount), styles: { halign: 'right' } }
      ]),
      theme: 'grid',
      headStyles: { fillColor: [75, 85, 99] }
    });
  }

  // --- Save ---
  doc.save('relatorio-financeiro.pdf');
};