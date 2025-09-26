
import { Category } from './types';
import type { CategoryInfo } from './types';

export const CATEGORIES: Record<Category, CategoryInfo> = {
  [Category.INVESTMENTS]: { name: 'Investimentos', target: 0.25, color: '#10B981' }, // Emerald-500
  [Category.FIXED_COSTS]: { name: 'Custos Fixos', target: 0.30, color: '#3B82F6' }, // Blue-500
  [Category.COMFORT]: { name: 'Conforto', target: 0.15, color: '#6366F1' },      // Indigo-500
  [Category.GOALS]: { name: 'Metas', target: 0.15, color: '#F97316' },        // Orange-500
  [Category.PLEASURES]: { name: 'Prazeres', target: 0.10, color: '#EC4899' },      // Pink-500
  [Category.KNOWLEDGE]: { name: 'Conhecimento', target: 0.05, color: '#8B5CF6' },    // Violet-500
  [Category.UNCATEGORIZED]: { name: 'Não Categorizado', target: 0, color: '#6B7280' }, // Gray-500
};
