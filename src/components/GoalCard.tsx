
import { useState } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowDownCircle, CalendarClock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProgressBar from './ProgressBar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GoalCardProps {
  goal: Goal;
  onAddExpense: (goalId: string) => void;
  transactions: Transaction[];
}

const GoalCard = ({ goal, onAddExpense, transactions }: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Filter transactions for this goal and calculate statistics
  const goalTransactions = transactions.filter(t => t.goalId === goal.id);
  const totalSpent = goal.currentAmount;
  const remaining = goal.amount - totalSpent;
  const isOverdue = isBefore(goal.deadline, new Date()) && totalSpent < goal.amount;
  const isCompleted = totalSpent >= goal.amount;

  // Calculate time left to deadline
  let timeLeft = '';
  const now = new Date();
  if (isAfter(goal.deadline, now)) {
    timeLeft = formatDistanceToNow(goal.deadline, { locale: ru, addSuffix: true });
  } else {
    timeLeft = 'срок истек';
  }

  // Last 3 transactions for this goal
  const recentTransactions = [...goalTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <Card 
      className={cn(
        'group overflow-hidden transition-all duration-300 ease-in-out',
        isHovered ? 'translate-y-[-4px] shadow-lg' : 'shadow-md',
        isOverdue ? 'border-destructive/30' : '',
        isCompleted ? 'border-green-500/30' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div 
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ 
                backgroundColor: `${goal.color}20`, 
                color: goal.color 
              }}
            >
              {goal.category}
            </div>
            <h3 className="text-lg font-medium leading-tight tracking-tight">{goal.title}</h3>
          </div>
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${goal.color}15` }}
          >
            <TrendingUp 
              className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              style={{ color: goal.color }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-2">
        <div className="mt-2 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold">{totalSpent.toLocaleString()} ₽</span>
            <span className="text-sm text-muted-foreground">из {goal.amount.toLocaleString()} ₽</span>
          </div>
          
          <ProgressBar 
            currentValue={totalSpent}
            maxValue={goal.amount}
            color={goal.color}
            height={6}
          />
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span className={cn(
              isOverdue ? 'text-destructive' : '',
              isCompleted ? 'text-green-500' : ''
            )}>
              {isCompleted ? 'Цель достигнута' : timeLeft}
            </span>
          </div>

          {recentTransactions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Последние расходы:</p>
              <div className="space-y-1.5">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{transaction.description}</span>
                    <span>{transaction.amount.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-1.5 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          onClick={() => onAddExpense(goal.id)}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          <span>Списать расход</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
