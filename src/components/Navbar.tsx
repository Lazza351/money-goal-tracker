
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PlusCircle, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HiddenGoalsSheet from './HiddenGoalsSheet';
import { Goal, Transaction } from '@/interfaces';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  onAddGoal: () => void;
  goals: Goal[];
  transactions: Transaction[];
  onAddExpense: (goalId: string) => void;
  onToggleHideGoal: (goalId: string) => void;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onAddIncome?: (goalId: string, amount: number, description: string) => void;
  onClearData?: () => void; // Новое свойство для очистки данных
}

const Navbar = ({
  onAddGoal,
  goals,
  transactions,
  onAddExpense,
  onToggleHideGoal,
  onEditGoal,
  onDeleteGoal,
  onAddIncome,
  onClearData
}: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  // Add scroll event listener to change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={cn('sticky top-0 z-50 w-full transition-all duration-300 ease-in-out', scrolled ? 'glass border-b border-border/40 py-3' : 'bg-transparent py-5')}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold tracking-tight">ФинТрекер</h1>
        </div>
        <div className="flex items-center gap-3">
          {onClearData && (
            <Button 
              variant="outline" 
              size="sm" 
              className="group flex items-center gap-1.5 rounded-full px-4 transition-all duration-300 hover:border-red-500 hover:text-red-500"
              onClick={onClearData}
            >
              <span className="md:inline hidden">Очистить данные</span>
              <Trash2 className="h-4 w-4 transition-all duration-300 group-hover:text-red-500" />
            </Button>
          )}
          
          <HiddenGoalsSheet 
            goals={goals} 
            transactions={transactions} 
            onAddExpense={onAddExpense} 
            onToggleHideGoal={onToggleHideGoal}
            onEditGoal={onEditGoal}
            onDeleteGoal={onDeleteGoal}
            onAddIncome={onAddIncome}
          />
          
          <Button variant="default" size="sm" className="group flex items-center gap-1.5 rounded-full px-4 transition-all duration-300 hover:gap-2" onClick={onAddGoal}>
            <span className="md:inline hidden">Новая цель</span>
            <PlusCircle className="h-4 w-4 transition-all duration-300 group-hover:rotate-90" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
