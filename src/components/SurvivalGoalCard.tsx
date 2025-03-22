
import { useState, useEffect } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { differenceInDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowDownCircle, CalendarRange, PlusCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';
import { toast } from '@/components/ui/toast-utils';

interface SurvivalGoalCardProps {
  goal: Goal;
  onAddExpense: (goalId: string) => void;
  onAddIncome: (goalId: string, amount: number) => void;
  onEditGoal: (goalId: string) => void;
  transactions: Transaction[];
}

const SurvivalGoalCard = ({ 
  goal, 
  onAddExpense, 
  onAddIncome,
  onEditGoal,
  transactions
}: SurvivalGoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showAddFundsInput, setShowAddFundsInput] = useState(false);
  const [fundsToAdd, setFundsToAdd] = useState('');
  
  // Calculate days remaining in the period
  const today = new Date();
  const periodStart = goal.periodStart || goal.createdAt;
  const periodEnd = goal.periodEnd || goal.deadline;
  
  const totalDays = Math.max(1, differenceInDays(periodEnd, periodStart));
  const daysElapsed = Math.min(totalDays, Math.max(0, differenceInDays(today, periodStart)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  
  // Calculate spent amount
  const totalSpent = goal.currentAmount;
  const remainingAmount = goal.amount - totalSpent;
  
  // Calculate daily allowance
  const dailyAllowance = remainingAmount / Math.max(1, daysRemaining);
  
  // Calculate today's remaining allowance
  const todayAllowance = dailyAllowance;
  const isOverBudget = remainingAmount < 0;

  // Handle adding funds
  const handleAddFunds = () => {
    const amount = Number(fundsToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }
    
    onAddIncome(goal.id, amount);
    setShowAddFundsInput(false);
    setFundsToAdd('');
  };

  // Recent transactions
  const recentTransactions = [...transactions]
    .filter(t => t.goalId === goal.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-300 ease-in-out border-2 ${
        isHovered ? 'translate-y-[-4px] shadow-lg' : 'shadow-md'
      } sticky top-20 z-10 bg-orange-50 border-orange-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div 
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ 
                backgroundColor: '#FF4500', 
                color: 'white' 
              }}
            >
              Выживание
            </div>
            <h3 className="text-lg font-medium leading-tight tracking-tight">{goal.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FF450015' }}
            >
              <RefreshCw 
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                style={{ color: '#FF4500' }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-2">
        <div className="mt-2 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold">{remainingAmount.toLocaleString()} ₽</span>
            <span className="text-sm text-muted-foreground">из {goal.amount.toLocaleString()} ₽</span>
          </div>
          
          <ProgressBar 
            currentValue={totalSpent}
            maxValue={goal.amount}
            color={isOverBudget ? '#EF4444' : '#FF4500'}
            height={6}
          />
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between rounded-md bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Сегодня можно потратить:</span>
              </div>
              <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                {Math.round(todayAllowance).toLocaleString()} ₽
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Осталось дней: {daysRemaining}</span>
              <span>
                {format(periodStart, 'dd.MM')} - {format(periodEnd, 'dd.MM.yyyy')}
              </span>
            </div>
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
          
          {showAddFundsInput && (
            <div className="flex gap-2">
              <input
                type="number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Сумма"
                value={fundsToAdd}
                onChange={(e) => setFundsToAdd(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddFunds}
              >
                ОК
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddFundsInput(false)}
              >
                Отмена
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex p-3 pt-0 gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full gap-1.5 transition-all duration-300"
          style={{ backgroundColor: '#FF4500' }}
          onClick={() => onAddExpense(goal.id)}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          <span>Списать расход</span>
        </Button>
        
        {!showAddFundsInput && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 transition-all duration-300"
            onClick={() => {
              setShowAddFundsInput(true);
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 transition-all duration-300"
          onClick={() => onEditGoal(goal.id)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SurvivalGoalCard;
