
import React, { useState } from 'react';
import { Goal, Transaction } from '@/interfaces';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarRange, ArrowDownCircle, Pencil, Trash2, Eye, EyeOff, ArrowUpCircle, Undo } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onAddExpense: (goalId: string) => void;
  onEditGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  transactions: Transaction[];
  onToggleHideGoal?: (goalId: string) => void;
  isHidden?: boolean;
  onUndoTransaction?: (transactionId: string) => void;
}

const GoalCard = ({ 
  goal, 
  onAddExpense, 
  onEditGoal, 
  onDeleteGoal, 
  transactions, 
  onToggleHideGoal,
  isHidden = false,
  onUndoTransaction
}: GoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate progress and related information
  const progress = goal.currentAmount / goal.amount;
  const percentComplete = Math.min(100, Math.round(progress * 100));
  const remaining = goal.amount - goal.currentAmount;
  
  // Calculate days until deadline
  const today = new Date();
  const daysRemaining = Math.max(0, differenceInDays(new Date(goal.deadline), today));
  const isDueToday = daysRemaining === 0;
  const isPastDue = today > new Date(goal.deadline) && goal.currentAmount < goal.amount;
  
  // Filter transactions related to this goal
  const goalTransactions = transactions.filter(t => t.goalId === goal.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-300 ease-in-out ${
        isHovered ? 'translate-y-[-4px] shadow-lg' : 'shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeft: `4px solid ${goal.color}` }}
    >
      <CardHeader className="p-4 pb-0">
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
            <h3 className="text-base font-medium leading-tight tracking-tight">
              {goal.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {onDeleteGoal && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGoal(goal.id);
                }}
                title="Удалить цель"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onToggleHideGoal && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHideGoal(goal.id);
                }}
                title={isHidden ? "Показать цель" : "Скрыть цель"}
              >
                {isHidden ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="mt-2 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-semibold">
              {goal.currentAmount.toLocaleString()} ₽
            </span>
            <span className="text-xs text-muted-foreground">
              из {goal.amount.toLocaleString()} ₽
            </span>
          </div>
          
          <ProgressBar 
            currentValue={goal.currentAmount}
            maxValue={goal.amount}
            color={goal.color}
            height={4}
          />
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <CalendarRange className="h-3.5 w-3.5" style={{ color: goal.color }} />
              <span className={isPastDue ? 'text-red-500 font-medium' : ''}>
                {isPastDue 
                  ? 'Просрочено' 
                  : (isDueToday 
                    ? 'Сегодня' 
                    : `${daysRemaining} ${getDaysWord(daysRemaining)}`)}
              </span>
            </div>
            <span className="text-muted-foreground">
              {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: ru })}
            </span>
          </div>

          {goalTransactions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Последние операции:</p>
              <div className="space-y-1.5">
                {goalTransactions.map(transaction => {
                  const isIncome = transaction.amount < 0;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {isIncome ? (
                          <ArrowUpCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="truncate">{transaction.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={isIncome ? 'text-green-500' : 'text-red-500'}>
                          {isIncome ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} ₽
                        </span>
                        {onUndoTransaction && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUndoTransaction(transaction.id);
                            }}
                            title="Отменить транзакцию"
                          >
                            <Undo className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex p-3 pt-0 justify-between">
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1.5 transition-all duration-300"
          style={{ backgroundColor: goal.color }}
          onClick={() => onAddExpense(goal.id)}
        >
          <ArrowDownCircle className="h-3.5 w-3.5" />
          <span>Добавить расход</span>
        </Button>
        
        {onEditGoal && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 transition-all duration-300"
            onClick={() => onEditGoal(goal.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Helper function to format days in Russian
const getDaysWord = (days: number) => {
  if (days >= 10 && days <= 20) return 'дней';
  const lastDigit = days % 10;
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
};

export default GoalCard;
