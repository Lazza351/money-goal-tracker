
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Goal, Transaction } from '@/interfaces';
import { toast } from '@/components/ui/toast-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Car, Handshake, CalendarRange } from 'lucide-react';
import { differenceInDays, endOfDay, isToday, startOfDay } from 'date-fns';

interface ExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (transaction: Transaction) => void;
  goals: Goal[];
  selectedGoalId?: string;
  transactions?: Transaction[];
}

// Emoji descriptions options
const emojiOptions = [
  { icon: <ShoppingCart className="h-5 w-5" />, text: "Покупка в магазине", value: "🛒 Покупка в магазине" },
  { icon: <Car className="h-5 w-5" />, text: "Поездка", value: "🚗 Поездка" },
  { icon: <Handshake className="h-5 w-5" />, text: "Перевод денег", value: "🤝 Перевод денег" }
];

const ExpenseDialog = ({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  goals,
  selectedGoalId,
  transactions = [] 
}: ExpenseDialogProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState<string | undefined>(undefined);
  const [descriptionType, setDescriptionType] = useState<'text' | 'emoji'>('text');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && selectedGoalId) {
      setGoalId(selectedGoalId);
    }
  }, [isOpen, selectedGoalId]);
  
  const selectedGoal = goals.find(g => g.id === goalId);
  const isSurvivalGoal = selectedGoal?.type === 'survival';
  
  // Вычисление суммы доступной на сегодня для цели выживания
  const calculateTodayAllowance = () => {
    if (!selectedGoal || !isSurvivalGoal) return null;
    
    const today = new Date();
    const periodStart = selectedGoal.periodStart || selectedGoal.createdAt;
    const periodEnd = selectedGoal.periodEnd || selectedGoal.deadline;
    
    // Период с учетом текущего дня (включительно) и дня окончания (включительно)
    const totalDays = Math.max(1, differenceInDays(endOfDay(periodEnd), startOfDay(periodStart)) + 1);
    const daysElapsed = Math.min(totalDays, Math.max(0, differenceInDays(endOfDay(today), startOfDay(periodStart))));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    
    // Все транзакции для этой цели
    const goalTransactions = transactions.filter(t => t.goalId === selectedGoal.id);
    
    // Расходы и доходы
    const incomeTransactions = goalTransactions.filter(t => t.amount < 0);
    const expenseTransactions = goalTransactions.filter(t => t.amount > 0);
    
    // Общая сумма доходов
    const totalIncomeAmount = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Максимальная сумма (первоначальный бюджет + все пополнения)
    const actualMaxAmount = selectedGoal.amount + totalIncomeAmount;
    
    // Общая сумма расходов
    const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Остаток
    const remainingAmount = actualMaxAmount - totalSpent;
    
    // Расходы за сегодня
    const todayExpenses = expenseTransactions
      .filter(t => isToday(new Date(t.date)))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Дневной лимит
    let dailyAllowance;
    if (daysRemaining <= 1) {
      dailyAllowance = remainingAmount;
    } else {
      dailyAllowance = remainingAmount / daysRemaining;
    }
    
    // Доступно сегодня
    return Math.max(0, dailyAllowance - todayExpenses);
  };
  
  const todayAllowance = isSurvivalGoal ? calculateTodayAllowance() : null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalId) {
      toast.error('Выберите цель');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Укажите корректную сумму расхода');
      return;
    }
    
    let finalDescription = '';
    
    if (descriptionType === 'text') {
      if (!description.trim()) {
        toast.error('Укажите описание расхода');
        return;
      }
      finalDescription = description.trim();
    } else {
      if (!selectedEmoji) {
        toast.error('Выберите тип расхода');
        return;
      }
      finalDescription = selectedEmoji;
    }
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      goalId,
      amount: Number(amount),
      description: finalDescription,
      date: new Date(),
    };
    
    onAddExpense(newTransaction);
    toast.success('Расход добавлен');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setGoalId(undefined);
    setDescriptionType('text');
    setSelectedEmoji(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить расход</DialogTitle>
          <DialogDescription>
            Укажите сумму и описание расхода по выбранной цели
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            {!selectedGoalId && (
              <div className="space-y-2">
                <Label htmlFor="goal">Цель</Label>
                <select
                  id="goal"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={goalId || ''}
                  onChange={(e) => setGoalId(e.target.value)}
                >
                  <option value="" disabled>
                    Выберите цель
                  </option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} {goal.type === 'survival' ? '(Выживание)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedGoal && (
              <div className={`rounded-md p-3 ${isSurvivalGoal ? 'bg-orange-100' : 'bg-secondary/50'}`}>
                <div className="font-medium">{selectedGoal.title}</div>
                {isSurvivalGoal ? (
                  <div className="mt-1 text-sm">
                    <div className="text-muted-foreground">
                      Осталось всего: {(selectedGoal.amount - selectedGoal.currentAmount).toLocaleString()} ₽
                    </div>
                    {todayAllowance !== null && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CalendarRange className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium">Сегодня доступно: {Math.round(todayAllowance).toLocaleString()} ₽</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Осталось: {(selectedGoal.amount - selectedGoal.currentAmount).toLocaleString()} ₽
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма расхода</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₽
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Описание</Label>
              <Tabs 
                defaultValue="text" 
                value={descriptionType} 
                onValueChange={(value) => setDescriptionType(value as 'text' | 'emoji')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Текст</TabsTrigger>
                  <TabsTrigger value="emoji">Эмодзи</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-2 mt-2">
                  <Input
                    id="description"
                    placeholder="На что потрачены средства"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </TabsContent>
                
                <TabsContent value="emoji" className="mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {emojiOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedEmoji === option.value ? "default" : "outline"}
                        className={`flex flex-col items-center p-3 h-auto text-xs ${
                          selectedEmoji === option.value ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedEmoji(option.value)}
                      >
                        <div className="mb-1">{option.icon}</div>
                        <span>{option.text}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">Добавить расход</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
