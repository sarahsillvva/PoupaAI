import { Expense } from '../types';
import { CATEGORIES, logoSrc } from '../constants';

declare const jspdf: any;

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

// Helper function to convert SVG data URL to PNG data URL
const convertSvgToPng = (svgDataUrl: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            const pngDataUrl = canvas.toDataURL('image/png');
            resolve(pngDataUrl);
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load SVG image for conversion'));
        };
        
        img.src = svgDataUrl;
    });
};


export const generatePDF = async (totalAmount: number, expenses: Expense[]) => {
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
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const logoSize = 30;

  try {
    const pngLogoSrc = await convertSvgToPng(logoSrc, 256, 256); // Convert with high resolution for quality
    doc.addImage(pngLogoSrc, 'PNG', margin, 15, logoSize, logoSize);
  } catch(e) {
      console.error("Could not add logo to PDF:", e);
      // Continue without logo if conversion fails
  }

  doc.setFontSize(20);
  doc.text('Relatório Financeiro Mensal', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 35, { align: 'center' });

  let y = 55;

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