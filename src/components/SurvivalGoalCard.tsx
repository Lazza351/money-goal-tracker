
import { useState, useEffect } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { differenceInDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowDownCircle, CalendarRange, PlusCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgressBar from './ProgressBar';
import { toast } from '@/components/ui/toast-utils';

interface SurvivalGoalCardProps {
  goal: Goal;
  onAddExpense: (goalId: string) => void;
  onAddIncome: (goalId: string, amount: number, description: string) => void;
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
  const [description, setDescription] = useState('Пополнение бюджета');
  
  // Calculate days remaining in the period - include both start and end dates in calculation
  const today = new Date();
  const periodStart = goal.periodStart || goal.createdAt;
  const periodEnd = goal.periodEnd || goal.deadline;
  
  // Add 1 to make the calculation inclusive of both start and end dates
  const totalDays = Math.max(1, differenceInDays(periodEnd, periodStart) + 1);
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
  
  // Calculate actual max amount based on transactions
  const getActualMaxAmount = () => {
    // Get all income transactions
    const incomeTransactions = transactions
      .filter(t => t.goalId === goal.id && t.amount < 0);
    
    // Sum up all income amounts (negative values represent income)
    const totalIncomeAmount = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Return original amount plus additional income
    return goal.amount + totalIncomeAmount;
  };
  
  // Get the actual maximum amount including added funds
  const actualMaxAmount = getActualMaxAmount();

  // Handle adding funds
  const handleAddFunds = () => {
    const amount = Number(fundsToAdd);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Укажите описание пополнения');
      return;
    }
    
    onAddIncome(goal.id, amount, description.trim());
    setShowAddFundsInput(false);
    setFundsToAdd('');
    setDescription('Пополнение бюджета');
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
            <span className="text-sm text-muted-foreground">из {actualMaxAmount.toLocaleString()} ₽</span>
          </div>
          
          <ProgressBar 
            currentValue={totalSpent}
            maxValue={actualMaxAmount}
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
            <div className="space-y-2">
              <Input
                type="number"
                className="w-full"
                placeholder="Сумма"
                value={fundsToAdd}
                onChange={(e) => setFundsToAdd(e.target.value)}
              />
              <Input
                type="text"
                className="w-full"
                placeholder="Описание пополнения"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddFunds}
                  className="flex-1"
                >
                  Пополнить
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowAddFundsInput(false);
                    setFundsToAdd('');
                    setDescription('Пополнение бюджета');
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
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
