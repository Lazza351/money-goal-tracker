
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HiddenGoalsSheet from './HiddenGoalsSheet';
import { Goal, Transaction } from '@/interfaces';

interface NavbarProps {
  onAddGoal: () => void;
  goals: Goal[];
  transactions: Transaction[];
  onAddExpense: (goalId: string) => void;
  onToggleHideGoal: (goalId: string) => void;
}

const Navbar = ({
  onAddGoal,
  goals,
  transactions,
  onAddExpense,
  onToggleHideGoal
}: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

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
          <HiddenGoalsSheet 
            goals={goals} 
            transactions={transactions} 
            onAddExpense={onAddExpense} 
            onToggleHideGoal={onToggleHideGoal} 
          />
          
          <Button variant="default" size="sm" className="group flex items-center gap-1.5 rounded-full px-4 transition-all duration-300 hover:gap-2" onClick={onAddGoal}>
            <span>Новая цель</span>
            <PlusCircle className="h-4 w-4 transition-all duration-300 group-hover:rotate-90" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
