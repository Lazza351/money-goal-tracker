
export interface Goal {
  id: string;
  title: string;
  amount: number;
  currentAmount: number;
  deadline: Date;
  createdAt: Date;
  category: string;
  color: string;
  hidden?: boolean;
  type?: 'standard' | 'survival';
  periodStart?: Date;
  periodEnd?: Date;
  dailyAllowance?: number;
}

export interface Transaction {
  id: string;
  goalId: string;
  amount: number;
  description: string;
  date: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Путешествия', color: '#3B82F6' },
  { id: '2', name: 'Образование', color: '#10B981' },
  { id: '3', name: 'Техника', color: '#F59E0B' },
  { id: '4', name: 'Дом', color: '#8B5CF6' },
  { id: '5', name: 'Автомобиль', color: '#EC4899' },
  { id: '6', name: 'Здоровье', color: '#14B8A6' },
  { id: '7', name: 'Прочее', color: '#6B7280' },
];
